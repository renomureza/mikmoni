import * as net from "net";
import * as tls from "tls";
import * as crypto from "crypto";
import { EventEmitter } from "events";
import { encodeSentence, SentenceDecoder } from "./encoding";

export interface RouterOSOptions {
  host: string;
  user: string;
  password: string;
  port?: number; // default 8728, or 8729 when tls=true
  tls?: boolean; // use encrypted API (port 8729)
  timeout?: number; // connect timeout in ms, default 10000
  rejectUnauthorized?: boolean; // for tls, default false (RouterOS uses self-signed certs)
}

export type RosReplyRow = Record<string, string>;

interface PendingRequest {
  tag: string;
  resolve: (rows: RosReplyRow[]) => void;
  reject: (err: Error) => void;
  rows: RosReplyRow[];
  onRow?: (row: RosReplyRow) => void; // for streaming/listen
}

/**
 * Client for the MikroTik RouterOS binary API.
 *
 * Example:
 *   const client = new RouterOSClient({ host: "192.168.88.1", user: "admin", password: "secret" });
 *   await client.connect();
 *   const identity = await client.write("/system/identity/print");
 *   await client.close();
 */
export class RouterOSClient extends EventEmitter {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private decoder = new SentenceDecoder();
  private pending = new Map<string, PendingRequest>();
  private tagCounter = 0;
  private connected = false;

  constructor(private opts: RouterOSOptions) {
    super();
  }

  async connect(): Promise<void> {
    const { host, tls: useTls = false } = this.opts;
    const port = this.opts.port ?? (useTls ? 8729 : 8728);
    const timeout = this.opts.timeout ?? 10000;

    await new Promise<void>((resolve, reject) => {
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const onTimeout = () => {
        cleanup();
        reject(new Error(`Connection to ${host}:${port} timed out`));
      };
      const cleanup = () => {
        this.socket?.removeListener("error", onError);
        this.socket?.removeListener("timeout", onTimeout);
      };

      const onConnect = () => {
        cleanup();
        this.socket!.setTimeout(0);
        resolve();
      };

      if (useTls) {
        this.socket = tls.connect(
          {
            host,
            port,
            rejectUnauthorized: this.opts.rejectUnauthorized ?? false,
          },
          onConnect,
        );
      } else {
        this.socket = net.connect({ host, port }, onConnect);
      }

      this.socket!.setTimeout(timeout);
      this.socket!.once("error", onError);
      this.socket!.once("timeout", onTimeout);
    });

    this.socket!.on("data", (chunk: Buffer) => this.handleData(chunk));
    this.socket!.on("close", () => this.handleClose());
    this.socket!.on("error", (err) => this.emit("error", err));

    this.connected = true;
    await this.login();
  }

  private async login(): Promise<void> {
    const { user, password } = this.opts;

    // RouterOS 6.43+: plain login in a single sentence.
    const rows = await this.write("/login", { name: user, password });

    // Older RouterOS (<6.43): responds with a challenge ("ret") that must be
    // combined with the password via MD5.
    const challenge = rows[0]?.ret;
    if (challenge) {
      const challengeBytes = Buffer.from(challenge, "hex");
      const hash = crypto.createHash("md5");
      hash.update(
        Buffer.concat([
          Buffer.from([0]),
          Buffer.from(password, "utf8"),
          challengeBytes,
        ]),
      );
      const response = "00" + hash.digest("hex");
      await this.write("/login", { name: user, response });
    }
  }

  /**
   * Sends a command and resolves once RouterOS replies with !done.
   * `params` become `=key=value` API words; `params["."]` style query words
   * (e.g. "?name=ether1") can be passed via the `query` argument.
   */
  write(
    command: string,
    params: Record<string, string | number> = {},
    query: string[] = [],
  ): Promise<RosReplyRow[]> {
    if (!this.socket) return Promise.reject(new Error("Not connected"));

    const tag = String(++this.tagCounter);
    const words = [command];
    for (const [key, value] of Object.entries(params)) {
      words.push(`=${key}=${value}`);
    }
    for (const q of query) {
      words.push(q.startsWith("?") ? q : `?${q}`);
    }
    words.push(`.tag=${tag}`);

    return new Promise<RosReplyRow[]>((resolve, reject) => {
      this.pending.set(tag, { tag, resolve, reject, rows: [] });
      this.socket!.write(encodeSentence(words));
    });
  }

  /**
   * Like write(), but calls onRow for every row as it streams in — useful
   * for long-running commands such as "/tool/torch" or listening to
   * "/interface/monitor-traffic". Returns a function to cancel the request.
   */
  listen(
    command: string,
    params: Record<string, string>,
    onRow: (row: RosReplyRow) => void,
  ): () => void {
    if (!this.socket) throw new Error("Not connected");

    const tag = String(++this.tagCounter);
    const words = [command];
    for (const [key, value] of Object.entries(params)) {
      words.push(`=${key}=${value}`);
    }
    words.push(`.tag=${tag}`);

    this.pending.set(tag, {
      tag,
      resolve: () => {},
      reject: () => {},
      rows: [],
      onRow,
    });
    this.socket.write(encodeSentence(words));

    return () => {
      this.write("/cancel", { tag }).catch(() => {});
    };
  }

  private handleData(chunk: Buffer): void {
    this.decoder.push(chunk);
    for (const sentence of this.decoder.drain()) {
      this.handleSentence(sentence);
    }
  }

  private handleSentence(words: string[]): void {
    const [type, ...rest] = words;
    const row: RosReplyRow = {};
    let tag = "";

    for (const w of rest) {
      if (w.startsWith(".tag=")) {
        tag = w.slice(5);
      } else if (w.startsWith("=")) {
        const eq = w.indexOf("=", 1);
        if (eq !== -1) row[w.slice(1, eq)] = w.slice(eq + 1);
      } else if (w.startsWith("!trap") || w.startsWith("!fatal")) {
        // handled below via `type`
      }
    }

    const pending = this.pending.get(tag);

    switch (type) {
      case "!re":
        if (pending?.onRow) {
          pending.onRow(row);
        } else if (pending) {
          pending.rows.push(row);
        }
        break;

      case "!done":
        if (pending) {
          this.pending.delete(tag);
          pending.resolve(pending.rows);
        }
        break;

      case "!trap":
        if (pending) {
          this.pending.delete(tag);
          pending.reject(new Error(row.message || "RouterOS API trap error"));
        } else {
          this.emit(
            "error",
            new Error(row.message || "RouterOS API trap error"),
          );
        }
        break;

      case "!fatal":
        for (const [, p] of this.pending) {
          p.reject(new Error(rest.join(" ") || "RouterOS API fatal error"));
        }
        this.pending.clear();
        this.emit("fatal", rest.join(" "));
        this.socket?.destroy();
        break;
    }
  }

  private handleClose(): void {
    this.connected = false;
    for (const [, p] of this.pending) {
      p.reject(new Error("Connection closed"));
    }
    this.pending.clear();
    this.emit("close");
  }

  isConnected(): boolean {
    return this.connected;
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve();
      this.socket.end(() => resolve());
    });
  }
}
