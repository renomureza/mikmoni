import { RouterOSClient } from "~/lib/routeros-client";

const routeros = new RouterOSClient({
  host: "192.168.22.252",
  port: 8728,
  user: "admin",
  password: "123",
});

await routeros.connect();
console.log(await routeros.write("/ppp/profile/print", {}, ["default=false"]));

await routeros.close();
