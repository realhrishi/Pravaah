import type { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createSubscriber } from "@repo/redis/client";
import { prisma } from "@repo/database/client";

export function initSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" }, 
  });

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);


    socket.on("join:watershed", (watershedId: string) => {
      socket.join(`watershed:${watershedId}`);
      console.log(`[socket] ${socket.id} joined watershed:${watershedId}`);
    });

    socket.on("leave:watershed", (watershedId: string) => {
      socket.leave(`watershed:${watershedId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });


  const subscriber = createSubscriber();
  subscriber.psubscribe("risk:*", "alert:*", "sensor:*");

  subscriber.on("pmessage", async (_pattern, channel, message) => {
    const [eventType, id] = channel.split(":");
    const payload = JSON.parse(message);

    try {
      if (eventType === "risk") {
        const village = await prisma.village.findUnique({
          where: { villageId: id },
          select: { watershedId: true },
        });
        if (village) {
          io.to(`watershed:${village.watershedId}`).emit("risk:update", payload);
        }
      }

      if (eventType === "alert") {
        const village = await prisma.village.findUnique({
          where: { villageId: payload.villageId },
          select: { watershedId: true },
        });
        if (village) {
          io.to(`watershed:${village.watershedId}`).emit("alert:new", payload);
        }
      }

      if (eventType === "sensor") {
        io.emit("sensor:status", payload);
      }
    } catch (err) {
      console.error("[socket] error relaying pub/sub message:", err);
    }
  });

  return io;
}