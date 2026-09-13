import { db } from "../db";
import { RouterosClientManager } from "./client-manager";
export { RouterOSClient } from "./client";

export const clientManager = new RouterosClientManager({
  idleTimeoutMillis: 30 * 60 * 1000, // 30 minutes
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
