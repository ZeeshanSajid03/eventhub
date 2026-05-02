import { Server } from "socket.io";

let io;

export function getIO() {
  return io;
}

export function initSocket(server) {
  if (io) return io;

  io = new Server(server, {
    path: "/api/socket",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join-event", (eventId) => {
      socket.join(eventId);
    });

    socket.on("disconnect", () => {});
  });

  return io;
}