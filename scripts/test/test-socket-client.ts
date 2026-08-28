// scripts/test-socket-client.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("join:watershed", "g_mws.54029");
});

socket.on("risk:update", (data) => console.log("risk:update →", data));
socket.on("alert:new", (data) => console.log("alert:new →", data));
socket.on("sensor:status", (data) => console.log("sensor:status →", data));