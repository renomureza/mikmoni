import { RouterOSClient } from ".";

async function main() {
  const client = new RouterOSClient({
    // host: "192.168.88.1",
    host: "localhost",
    user: "admin",
    // password: "your-password",
    password: "123",
    // port: 8728,     // 8729 if tls: true
    // tls: true,
  });

  client.on("error", (err) => console.error("Socket error:", err));
  client.on("close", () => console.log("Connection closed"));

  await client.connect();
  console.log("Connected & logged in");

  // Simple query
  const identity = await client.write("/system/identity/print");
  console.log("Identity:", identity);

  // Query with parameters (equivalent to: /interface print where type=ether)
  const interfaces = await client.write("/interface/print", {}, [
    "?type=ether",
  ]);
  console.log("Ethernet interfaces:", interfaces);

  // Add a firewall rule (command with =key=value params)
  // await client.write("/ip/firewall/filter/add", {
  //   chain: "forward",
  //   action: "drop",
  //   "src-address": "10.0.0.5",
  // });

  // Streaming example: live traffic monitor (runs until cancelled)
  // const cancel = client.listen(
  //   "/interface/monitor-traffic",
  //   { interface: "ether1", once: "" },
  //   (row) => console.log("traffic:", row)
  // );
  // setTimeout(cancel, 5000);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
