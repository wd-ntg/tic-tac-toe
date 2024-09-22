import { randomUUID } from "crypto";
import {
  SocketController,
  OnConnect,
  OnDisconnect,
  MessageBody,
  ConnectedSocket,
  OnMessage,
} from "socket-controllers";
import { Socket } from "socket.io";
import { Service } from "typedi";

interface Room {
  id: string;
  players: string[];
  playerSymbols: { [key: string]: string };
  playerCreateRoom: string;
  data: any;
  player1Time: number;
  player2Time: number;
  messages: any;
}

interface CreateRoomData {
  typeRoom: string;
  timeOut: number;
  password?: string;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
}

export const rooms: { [key: string]: Room } = {};

const MAX_ROOMS = 10;

@Service()
@SocketController()
export class RoomController {
  @OnConnect()
  connection(@ConnectedSocket() socket: Socket) {
    console.log("A user connected:", socket.id);
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: Socket) {
    console.log("A user disconnected:", socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.players.includes(socket.id)) {
        room.players = room.players.filter((player) => player !== socket.id);
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          socket.to(roomId).emit("playerLeft", room);
        }
        break;
      }
    }
  }

  @OnMessage("create_room")
  createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomData: CreateRoomData
  ) {
    if (Object.keys(rooms).length >= MAX_ROOMS) {
      socket.emit("roomCreateError", {
        message: "Maximum number of rooms reached.",
      });
      return;
    }

    const roomId = randomUUID().slice(0, 8);
    const room: Room = {
      id: roomId,
      players: [socket.id],
      playerSymbols: { [roomData.player1]: "X" },
      playerCreateRoom: roomData.player1,
      data: roomData,
      player1Time: roomData.timeOut,
      player2Time: roomData.timeOut,
      messages: [],
    };

    if (rooms[roomId]) {
      socket.emit("roomCreateError", { message: "Room ID already exists." });
      return;
    }

    rooms[roomId] = room;
    socket.join(roomId);

    socket.emit("roomCreated", room);

    socket.broadcast.emit("allRooms", Object.values(rooms));
  }

  @OnMessage("join_room")
  joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; namePlayer2: string }
  ) {
    const { roomId, namePlayer2 } = data;
    const room = rooms[roomId];

    if (!room) {
      socket.emit("roomNotFound");
      return;
    }

    if (room.players.length < 2) {
      room.players.push(socket.id);
      room.data.player2 = namePlayer2;
      socket.join(roomId);

      room.playerSymbols = { ...room.playerSymbols, [room.data.player2]: "O" };

      room.data.score1 = 0;
      room.data.score2 = 0;

      socket.emit("playerNumber", room.players.length, room);

      if (room.players.length === 2) {
        socket.to(roomId).emit("playerJoined", room);
      }

      socket.broadcast.emit("allRooms", Object.values(rooms));
    } else {
      socket.emit("roomFull");
    }
  }

  @OnMessage("get_all_rooms")
  getAllRooms(@ConnectedSocket() socket: Socket) {
    const roomList = Object.values(rooms);
    socket.emit("allRooms", roomList);
  }

  @OnMessage("leave_room")
  leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() roomId: string) {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("roomNotFound");
      return;
    }

    room.players = room.players.filter((player) => player !== socket.id);
    if (room.players.length === 0) {
      delete rooms[roomId];
    } else {
      socket.to(roomId).emit("playerLeft", room);
    }

    socket.broadcast.emit("allRooms", Object.values(rooms));
  }

  @OnMessage("select_symbol")
  selectSymbol(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { roomId, symbol }: { roomId: string; symbol: string }
  ) {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("roomNotFound");
      return;
    }

    // Kiểm tra nếu người chơi đã tham gia phòng
    if (!room.players.includes(socket.id)) {
      socket.emit("notInRoom", { message: "You are not part of this room." });
      return;
    }

    // Kiểm tra nếu ký tự đã được chọn bởi người chơi khác
    const takenSymbols = Object.values(room.playerSymbols);
    if (takenSymbols.includes(symbol)) {
      socket.emit("symbolTaken", {
        message: `Symbol ${symbol} is already taken.`,
      });
      return;
    }

    // Gán ký tự cho người chơi
    room.playerSymbols[socket.id] = symbol;
    socket.emit("symbolSelected", { player: socket.id, symbol });
    console.log(`Player ${socket.id} selected symbol ${symbol}`);

    // Nếu cả hai người chơi đã chọn ký tự, bắt đầu trò chơi
    if (Object.keys(room.playerSymbols).length === 2) {
      socket.to(roomId).emit("startGame", room);
      console.log("Room started:", room);
    }
  }
  @OnMessage("get_room")
  getRoom(@ConnectedSocket() socket: Socket, @MessageBody() roomId: string) {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("roomNotFound");
      return;
    }

    socket.emit("roomFound", room);

    if (socket.rooms.has(roomId)) {
      console.log(`Socket ${socket.id} is in room ${roomId}`);
      socket.to(roomId).emit("playerJoined", room);
    } else {
      console.log(`Socket ${socket.id} is not in room ${roomId}`);
    }
  }

  @OnMessage("make_move")
  makeMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      newMatrix,
      currentPlayer,
      roomId,
    }: { newMatrix: string[][]; currentPlayer: "X" | "O"; roomId: string }
  ) {
    const room: any = rooms[roomId];

    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }

    const nextPlayer = currentPlayer === "X" ? "O" : "X";

    let foundKey = null;

    for (const key in room.playerSymbols) {
      if (room.playerSymbols[key] === nextPlayer) {
        foundKey = key;
        break;
      }
    }

    const namePlayerNext = String(foundKey);

    socket.to(roomId).emit("move_made", newMatrix, nextPlayer, namePlayerNext);

    socket.emit("current_turn", nextPlayer, newMatrix);
  }

  @OnMessage("update_time")
  updateTime(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
      player1Time,
      player2Time,
    }: {
      roomId: string;
      player1Time: number;
      player2Time: number;
    }
  ) {
    rooms[roomId].player1Time = player1Time;
    rooms[roomId].player2Time = player2Time;

    // Phát thời gian còn lại đến tất cả các client trong phòng
    socket.to(roomId).emit("update_time", {
      player1Time,
      player2Time,
    });
  }

  @OnMessage("start_game")
  startGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
    }: {
      roomId: string;
    }
  ) {
    socket.to(roomId).emit("start_game");
  }

  @OnMessage("change_matrix")
  changeMatrix(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
      gridSize,
      matrix,
    }: {
      roomId: string;
      gridSize: number;
      matrix: string[][];
    }
  ) {
    socket.to(roomId).emit("change_matrix", { matrix, gridSize });
  }

  @OnMessage("noti_change_xo")
  notichangeXO(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
      symbolPlayer,
      player,
    }: {
      roomId: string;
      symbolPlayer: string;
      player: string;
    }
  ) {
    console.log("hello");
    socket.to(roomId).emit("noti_change_xo", { symbolPlayer, player });
  }

  @OnMessage("change_xo")
  changeXO(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
      symbolPlayer,
      player,
    }: {
      roomId: string;
      symbolPlayer: string;
      player: string;
    }
  ) {
    const changeSymbol = symbolPlayer === "X" ? "O" : "X";

    const room = rooms[roomId];

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    const player1 = room.data.player1;
    const player2 = room.data.player2;

    const score1 = room.data.score1;
    const score2 = room.data.score2;

    if (player === player1 || player === player2) {
      room.data.player1 = player2;
      room.data.player2 = player1;

      room.data.score1 = score2;
      room.data.score2 = score1;

      const tempSymbol = room.playerSymbols[player1];
      room.playerSymbols[player1] = room.playerSymbols[player2];
      room.playerSymbols[player2] = tempSymbol;

      socket.to(roomId).emit("change_xo", {
        player1: room.data.player1,
        player2: room.data.player2,
        score1: room.data.score1,
        score2: room.data.score2,
        symbol: symbolPlayer,
      });

      socket.emit("change_xo", {
        player1: room.data.player1,
        player2: room.data.player2,
        score1: room.data.score1,
        score2: room.data.score2,
        symbol: changeSymbol,
      });
    } else {
      socket.emit("error", {
        message: "Player is not allowed to change symbols",
      });
    }
  }

  @OnMessage("end_game")
  endGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
      winner,
    }: {
      roomId: string;
      winner: string;
    }
  ) {
    const symbolPlayer = rooms[roomId].playerSymbols[winner];
    socket.to(roomId).emit("end_game", { symbolPlayer });
    socket.emit("end_game", { symbolPlayer });
  }

  @OnMessage("update_game")
  updateGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
      winner,
    }: {
      roomId: string;
      winner: string;
    }
  ) {
    const room = rooms[roomId];

    const timePlayer = Number(room.data.timeOut) * 60;

    socket.to(roomId).emit("update_game", { winner, timePlayer });
    socket.emit("update_game", { winner, timePlayer });
  }

  @OnMessage("update_score")
  updateScore(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
      winner,
    }: {
      roomId: string;
      winner: string;
    }
  ) {
    const room = rooms[roomId];

    if (winner === "X") {
      room.data.score1 += 1;
    } 
    
    if (winner === "O") {
      room.data.score2 += 1;
    }

    socket.to(roomId).emit("update_score", {
      winner,
      score1: room.data.score1,
      score2: room.data.score2,
    });
    socket.emit("update_score", {
      winner,
      score1: room.data.score1,
      score2: room.data.score2,
    });
  }

  @OnMessage("noti_reset_game")
  notiResetGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
      player,
    }: {
      roomId: string;
      player: string;
    }
  ) {
    console.log("noti_reset_game");

    socket.to(roomId).emit("noti_reset_game", { player });
  }

  @OnMessage("reset_game")
  resetGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      roomId,
    }: {
      roomId: string;
    }
  ) {
    console.log("reset_game");

    const room = rooms[roomId];

    room.data.score1 = 0;
    room.data.score2 = 0;
  }

  @OnMessage("send_message")
  sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    { user, message, roomId }: { user: string; message: string; roomId: string }
  ) {
    const room = rooms[roomId];

    console.log(user, message, roomId);
    if (room) {
      if (user) {
        room.messages[user] = message;

        socket.to(roomId).emit("receive_message", {
          user: user,
          message: message,
        });
      }

      console.log(room);
    }
  }

  @OnMessage("get_message")
getMessage(
  @ConnectedSocket() socket: Socket,
  @MessageBody() { roomId }: { roomId: string }
) {
  const room = rooms[roomId]; 
  console.log(room)
  if (room) {
    socket.emit("receive_message_history", {
      messages: room.messages,
    });
  }
}

}
