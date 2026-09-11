import net from "net";

const socket = net.connect({ host: "localhost", port: 8729 });

socket.on("connect", () => {
  console.log("on connect");
});

socket.on("close", () => {
  console.log("on close");
});
