import { db } from "../db";
import { RouterosClientManager } from "./client-manager";
export { RouterOSClient } from "./client";

export const clientManager = new RouterosClientManager({
  idleTimeoutMillis:
    process.env.NODE_ENV === "production"
      ? // 30 minutes
        30 * 60 * 1000
      : // 1 minutes
        1 * 60 * 1000,
  connectTimeoutMillis: 6_000,
  getRouterosConfig: async (id) => {
    const routeros = await db.query.routeros.findFirst({
      columns: {
        host: true,
        port: true,
        username: true,
        password: true,
        tls: true,
      },
      where: { id: id },
    });
    if (!routeros) return;
    return {
      host: routeros.host,
      user: routeros.username,
      password: routeros.password,
      port: routeros.port,
      tls: routeros.tls,
    };
  },
});
