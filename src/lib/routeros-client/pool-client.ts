import { RouterOSClient, RouterOSOptions, RosReplyRow } from "./client";

export interface PoolOptions extends RouterOSOptions {
  /** Max simultaneous connections to the router. Default: 5 */
  max?: number;
  /** Close an idle connection after this many ms. Default: 30000 */
  idleTimeoutMillis?: number;
  /** How long to wait for a free connection before rejecting. Default: 10000 */
  acquireTimeoutMillis?: number;
}

interface Waiter {
  resolve: (client: RouterOSClient) => void;
  reject: (err: Error) => void;
}

/**
 * A pooled RouterOS connection acquired via pool.getConnection().
 * Call release() when done, just like mysql2/pg — do NOT call close().
 */
export interface PooledConnection {
  write(
    command: string,
    params?: Record<string, string>,
    query?: string[],
  ): Promise<RosReplyRow[]>;
  listen(
    command: string,
    params: Record<string, string>,
    onRow: (row: RosReplyRow) => void,
  ): () => void;
  release(): void;
}

/**
 * Connection pool for RouterOSClient — same idea as a mysql2/pg pool.
 * Connections are created lazily (up to `max`) and reused; you call
 * pool.write(...) directly without ever touching connect()/close().
 */
export class RouterOSPoolClient {
  private idle: RouterOSClient[] = [];
  private all = new Set<RouterOSClient>();
  private idleTimers = new Map<RouterOSClient, NodeJS.Timeout>();
  private waiters: Waiter[] = [];
  private closed = false;

  constructor(private opts: PoolOptions) {}

  /** Runs a single command using a pooled connection, releasing it automatically. */
  async write(
    command: string,
    params: Record<string, string> = {},
    query: string[] = [],
  ): Promise<RosReplyRow[]> {
    const client = await this.acquire();
    try {
      return await client.write(command, params, query);
    } finally {
      this.release(client);
    }
  }

  /**
   * Streaming version of write(). Holds a dedicated pooled connection for
   * the duration of the stream; call the returned function to cancel the
   * command AND release the connection back to the pool.
   */
  async listen(
    command: string,
    params: Record<string, string>,
    onRow: (row: RosReplyRow) => void,
  ): Promise<() => void> {
    const client = await this.acquire();
    const cancel = client.listen(command, params, onRow);
    return () => {
      cancel();
      this.release(client);
    };
  }

  /**
   * mysql2/pg-style manual acquire: borrow a connection for several calls,
   * then release() it yourself. Prefer pool.write() for one-off commands.
   */
  async getConnection(): Promise<PooledConnection> {
    const client = await this.acquire();
    let released = false;
    return {
      write: (command, params = {}, query = []) =>
        client.write(command, params, query),
      listen: (command, params, onRow) => client.listen(command, params, onRow),
      release: () => {
        if (released) return;
        released = true;
        this.release(client);
      },
    };
  }

  /** Closes every connection and rejects any queued waiters. Call on shutdown. */
  async end(): Promise<void> {
    this.closed = true;
    for (const w of this.waiters) w.reject(new Error("Pool is closing"));
    this.waiters = [];
    for (const timer of this.idleTimers.values()) clearTimeout(timer);
    this.idleTimers.clear();

    const clients = Array.from(this.all);
    this.all.clear();
    this.idle = [];
    await Promise.all(clients.map((c) => c.close().catch(() => {})));
  }

  private async acquire(): Promise<RouterOSClient> {
    if (this.closed) throw new Error("Pool is closed");

    // Reuse an idle, still-connected client.
    while (this.idle.length > 0) {
      const client = this.idle.pop()!;
      this.clearIdleTimer(client);
      if (client.isConnected()) return client;
      this.all.delete(client); // dead connection, drop it and keep looking
    }

    if (this.all.size < (this.opts.max ?? 5)) {
      return this.createConnection();
    }

    // Pool is at capacity — wait for a release() or a timeout.
    return new Promise<RouterOSClient>((resolve, reject) => {
      const timeoutMs = this.opts.acquireTimeoutMillis ?? 10000;
      const timer = setTimeout(() => {
        const idx = this.waiters.indexOf(waiter);
        if (idx !== -1) this.waiters.splice(idx, 1);
        reject(
          new Error("Timed out waiting for an available RouterOS connection"),
        );
      }, timeoutMs);

      const waiter: Waiter = {
        resolve: (client) => {
          clearTimeout(timer);
          resolve(client);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      };
      this.waiters.push(waiter);
    });
  }

  private release(client: RouterOSClient): void {
    if (this.closed || !client.isConnected()) {
      this.all.delete(client);
      return;
    }

    const waiter = this.waiters.shift();
    if (waiter) {
      waiter.resolve(client);
      return;
    }

    this.idle.push(client);
    this.scheduleIdleTimeout(client);
  }

  private async createConnection(): Promise<RouterOSClient> {
    const client = new RouterOSClient(this.opts);

    // If the router drops the connection while it's idle or mid-command,
    // remove it from the pool instead of handing out a dead socket.
    const forget = () => {
      this.all.delete(client);
      this.idle = this.idle.filter((c) => c !== client);
      this.clearIdleTimer(client);
    };
    client.on("close", forget);
    client.on("fatal", forget);

    await client.connect();
    this.all.add(client);
    return client;
  }

  private scheduleIdleTimeout(client: RouterOSClient): void {
    const idleTimeoutMs = this.opts.idleTimeoutMillis ?? 30000;
    const timer = setTimeout(() => {
      this.idle = this.idle.filter((c) => c !== client);
      this.all.delete(client);
      client.close().catch(() => {});
    }, idleTimeoutMs);
    // Don't let idle-connection timers keep the Node process alive.
    if (typeof timer.unref === "function") timer.unref();
    this.idleTimers.set(client, timer);
  }

  private clearIdleTimer(client: RouterOSClient): void {
    const timer = this.idleTimers.get(client);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(client);
    }
  }

  /** Number of live connections currently open (idle + in use). */
  get size(): number {
    return this.all.size;
  }

  /** Number of connections currently sitting idle in the pool. */
  get idleCount(): number {
    return this.idle.length;
  }
}

export function createPool(opts: PoolOptions): RouterOSPool {
  return new RouterOSPool(opts);
}
