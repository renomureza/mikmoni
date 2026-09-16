// import { RouterOSClient } from "~/lib/routeros-client";

// const routeros = new RouterOSClient({
//   host: "localhost",
//   port: 8738,
//   user: "admin",
//   password: "123",
// });

// await routeros.connect();
// console.log(
//   // await routeros.write("/ip/hotspot/user/print", {}, [
//   //   ">.id=*2",
//   //   "<.id=*7",
//   //   "#&",
//   // ]),
// );

// await (async () => {
//   // await routeros.write("/ip/address/add", {
//   //   address: "192.168.50.1/24",
//   //   interface: "ether2",
//   // });
//   // await routeros.write("/ip/dns/set", { "allow-remote-requests": "true" });
//   // await routeros.write("/ip/firewall/nat/add", {
//   //   chain: "srcnat",
//   //   "out-interface": "ether1",
//   //   action: "masquerade",
//   // });
//   //
//   // await routeros.write("/system/clock/set", {
//   //   "time-zone-name": "Asia/Jakarta",
//   // });
//   // const [[{ address: primaryNtp }], [{ address: secondaryNtp }]] =
//   //   await Promise.all([
//   //     Bun.dns.lookup("0.id.pool.ntp.org"),
//   //     Bun.dns.lookup("1.id.pool.ntp.org"),
//   //   ]);
//   // await routeros.write("/system/ntp/client/set", {
//   //   enabled: "yes",
//   //   "primary-ntp": primaryNtp,
//   //   "secondary-ntp": secondaryNtp,
//   // });
// })();

// await routeros.close();

const html = `<html lang="en"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      padding: 0;
      margin: 0;
    }
    *, 
    *::before, 
    *::after {
      box-sizing: border-box;
    }
    body {
      font-size: 14px;
      font-family: Helvetica, arial, sans-serif;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      background-color: white;
    }
    .voucher {
      border: 1px solid black;
      width: 220px;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 3px 10px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid black;
    }
    .body {
      padding: 10px;
      display: flex;
      gap: 10px;
    }
    .credential {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
    }
    .credential__value,
    .credential__label {
      text-align: center;
      font-size: 12px;
    }
    .credential__label {
      color: rgb(31, 31, 31);
    }
    .credential__value {
      border: 1px solid black;
      font-weight: 600;
    }
    .qrcode {
      width: 100%;
      background-color: rgb(223, 223, 223);
    }
    .footer {
      border-top: 1px solid black;
      padding: 3px 10px;
      text-align: center;
    }

    @media print {
      .voucher {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
    <div class="voucher">
      <div class="header">
        <div>Routeros</div>
        <div>1</div>
      </div>
      <div class="body">
        <div class="credential">
          <div class="credential__item">
            <div class="credential__label">
              Username
            </div>
            <div class="credential__value">
              user
            </div>
          </div>
          <div class="credential__item">
            <div class="credential__label">
              Password
            </div>
            <div class="credential__value">
              password
            </div>
          </div>
        </div>
        <div class="qrcode">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h21v21H0z"></path><path stroke="#000000" d="M0 0.5h7m1 0h2m1 0h2m1 0h7M0 1.5h1m5 0h1m2 0h1m1 0h2m1 0h1m5 0h1M0 2.5h1m1 0h3m1 0h1m4 0h1m2 0h1m1 0h3m1 0h1M0 3.5h1m1 0h3m1 0h1m1 0h2m1 0h2m1 0h1m1 0h3m1 0h1M0 4.5h1m1 0h3m1 0h1m2 0h1m2 0h1m1 0h1m1 0h3m1 0h1M0 5.5h1m5 0h1m2 0h1m2 0h1m1 0h1m5 0h1M0 6.5h7m1 0h1m1 0h1m1 0h1m1 0h7M10 7.5h1m1 0h1M2 8.5h1m1 0h3m1 0h1m1 0h2m1 0h1m3 0h1m2 0h1M1 9.5h1m1 0h2m3 0h1m2 0h3m5 0h2M0 10.5h2m2 0h1m1 0h1m1 0h1m1 0h1m2 0h1m2 0h5M3 11.5h1m1 0h1m4 0h1m8 0h1M3 12.5h2m1 0h1m1 0h2m1 0h1m1 0h2m1 0h1M8 13.5h4m1 0h1m1 0h1m2 0h3M0 14.5h7m2 0h2m2 0h1m1 0h1m2 0h3M0 15.5h1m5 0h1m1 0h1m3 0h1m1 0h3M0 16.5h1m1 0h3m1 0h1m1 0h2m1 0h2m2 0h1m3 0h2M0 17.5h1m1 0h3m1 0h1m2 0h1m1 0h1m3 0h1m2 0h2M0 18.5h1m1 0h3m1 0h1m1 0h3m3 0h1m1 0h1m1 0h1m1 0h1M0 19.5h1m5 0h1m3 0h1m2 0h1m2 0h1m2 0h1M0 20.5h7m2 0h2m3 0h2m3 0h2"></path></svg>

        </div>
      </div>
      <div class="footer">
        <div>dsa</div>
        <div>dsa</div>
      </div>
    </div>

</body></html>`;
import { JSDOM } from "jsdom";
import { toPng } from "html-to-image";

const dom = new JSDOM(html);

console.log(
  await toPng(
    dom.window.document.body.querySelector(".voucher") as HTMLElement,
  ),
);
