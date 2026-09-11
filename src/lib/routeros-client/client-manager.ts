import { RouterOSClient, RosReplyRow } from "./client";

export interface RouterRow {
  host: string;
  port: number;
  user: string;
  password: string;
  tls?: boolean;
}

export interface RouterManagerOptions {
  idleTimeoutMillis?: number;
  connectTimeoutMillis?: number;
  getRouterosConfig: (id: number) => Promise<RouterRow | null | undefined>;
}

export interface ManagedRouterClient {
  write(
    command: string,
    params?: Record<string, string>,
    query?: string[],
  ): Promise<RosReplyRow[]>;
  listen(
    command: string,
    params: Record<string, string>,
    onRow: (row: RosReplyRow) => void,
  ): Promise<() => void>;
}

export class RouterosClientManager {
  private clients = new Map<number, RouterOSClient>();
  private idleTimers = new Map<number, NodeJS.Timeout>();
  private connecting = new Map<number, Promise<RouterOSClient>>();

  constructor(private opts: RouterManagerOptions) {}

  getClient(id: number): ManagedRouterClient {
    return {
      write: (command, params = {}, query = []) =>
        this.write(id, command, params, query),
      listen: (command, params, onRow) =>
        this.listen(id, command, params, onRow),
    };
  }

  private async write(
    id: number,
    command: string,
    params: Record<string, string>,
    query: string[],
  ): Promise<RosReplyRow[]> {
    const client = await this.acquire(id);
    return client.write(command, params, query);
  }

  private async listen(
    id: number,
    command: string,
    params: Record<string, string>,
    onRow: (row: RosReplyRow) => void,
  ): Promise<() => void> {
    const client = await this.acquire(id);
    return client.listen(command, params, onRow);
  }

  private async acquire(id: number): Promise<RouterOSClient> {
    const existing = this.clients.get(id);
    if (existing && existing.isConnected()) {
      this.touch(id);
      return existing;
    }

    const inFlight = this.connecting.get(id);
    if (inFlight) return inFlight;

    const connectPromise = this.createConnection(id).finally(() => {
      this.connecting.delete(id);
    });
    this.connecting.set(id, connectPromise);
    return connectPromise;
  }

  private async createConnection(id: number): Promise<RouterOSClient> {
    const row = await this.opts.getRouterosConfig(id);
    if (!row) {
      throw new Error(`Routeros dengan id=${id} tidak ditemukan`);
    }

    const client = new RouterOSClient({
      host: row.host,
      port: row.port,
      user: row.user,
      password: row.password,
      tls: row.tls,
      timeout: this.opts.connectTimeoutMillis ?? 6_000,
    });

    const forget = () => {
      if (this.clients.get(id) === client) {
        this.clients.delete(id);
      }
      this.clearIdleTimer(id);
    };
    client.on("close", forget);
    client.on("fatal", forget);

    await client.connect();
    this.clients.set(id, client);
    this.scheduleIdleTimeout(id);
    return client;
  }

  private touch(id: number): void {
    this.scheduleIdleTimeout(id);
  }

  private scheduleIdleTimeout(id: number): void {
    this.clearIdleTimer(id);
    const idleTimeoutMs = this.opts.idleTimeoutMillis ?? 30 * 60 * 1000;
    const timer = setTimeout(() => {
      const client = this.clients.get(id);
      this.clients.delete(id);
      this.idleTimers.delete(id);
      if (client) client.close().catch(() => {});
    }, idleTimeoutMs);

    if (typeof timer.unref === "function") timer.unref();
    this.idleTimers.set(id, timer);
  }

  private clearIdleTimer(id: number): void {
    const timer = this.idleTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.idleTimers.delete(id);
    }
  }

  async evict(id: number): Promise<void> {
    this.clearIdleTimer(id);
    const client = this.clients.get(id);
    this.clients.delete(id);
    if (client) await client.close().catch(() => {});
  }

  async closeAll(): Promise<void> {
    const ids = Array.from(this.clients.keys());
    await Promise.all(ids.map((id) => this.evict(id)));
  }

  get activeCount(): number {
    return this.clients.size;
  }
}
