import { RouterOSClient } from "~/lib/routeros-client";

const routeros = new RouterOSClient({
  host: "localhost",
  port: 8738,
  user: "admin",
  password: "123",
});

await routeros.connect();
console.log(await routeros.write("/ip/hotspot/user/print", {}, [".id=*5"]));

await routeros.close();
