import { RouterOSClient } from "~/lib/routeros-client";

const routeros = new RouterOSClient({
  host: "192.168.22.253",
  port: 8728,
  user: "admin",
  password: "123",
});

await routeros.connect();
console.log(
  await routeros.write("/ip/hotspot/user/print", { ".proplist": "comment" }, [
    ">comment=up-",
    ">comment=vc-",
    "#|",
    ".id=*0",
    "#!",
    "#&",
  ]),
);

await routeros.close();
