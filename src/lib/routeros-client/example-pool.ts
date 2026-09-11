import { createPool, RouterOSClient } from "./";

const pool = createPool({
  // host: "192.168.88.1",
  host: "localhost",
  user: "admin",
  password: "123",
  max: 2, // up to 5 simultaneous connections
  idleTimeoutMillis: 30000, // close idle connections after 30s
});

const client = new RouterOSClient({
  host: "localhost",
  user: "admin",
  password: "123",
});

async function main() {
  // No connect()/close() needed — the pool handles it per call.
  await client.connect();
  const [hotspot, route] = await Promise.all([
    client.write("/ip/hotspot/print"),
    client.write("/ip/route/print"),
  ]);
  console.log(hotspot, route);

  // Fire several commands concurrently; the pool opens connections as needed
  // (up to `max`) and queues extra requests until one frees up.
  // const [interfaces, routes, users] = await Promise.all([
  //   pool.write("/interface/print"),
  //   pool.write("/ip/route/print"),
  //   pool.write("/user/print"),
  // ]);
  // console.log(interfaces.length, routes.length, users.length);
  // console.log(pool.size);

  // // Manual acquire, when you need several calls on the SAME connection:
  // const conn = await pool.getConnection();
  // try {
  //   await conn.write("/ip/firewall/filter/add", {
  //     chain: "forward",
  //     action: "drop",
  //     "src-address": "10.0.0.5",
  //   });
  //   const rules = await conn.write("/ip/firewall/filter/print");
  //   console.log(rules);
  // } finally {
  //   conn.release(); // back to the pool, NOT close()
  // }

  // // Streaming still works through the pool:
  // const stop = await pool.listen(
  //   "/interface/monitor-traffic",
  //   { interface: "ether1" },
  //   (row) => console.log("traffic:", row),
  // );
  // setTimeout(stop, 5000);

  // Only call this on app shutdown.
  // await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
