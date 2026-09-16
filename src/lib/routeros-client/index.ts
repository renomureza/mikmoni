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
  getRouterosConfig: (id) => {
    return db.query.routeros.findFirst({
      columns: {
        host: true,
        port: true,
        user: true,
        password: true,
        tls: true,
      },
      where: { id: id },
    });
  },
});
