import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { Container } from "typedi";
import { SocketControllers } from "socket-controllers";
import { RoomController } from "./controllers/socketio/roomController";
import { Socket } from "net";

export default (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  new SocketControllers({
    io,
    container: Container,
    controllers: [RoomController],
  });

  return io;
};
