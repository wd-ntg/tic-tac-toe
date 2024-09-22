import { Socket } from "socket.io-client";

interface RoomResponse {
  id: string;
  players: string[];
  playerCreateRoom: string;
  data: object;
}

interface Room {
  id: string;
  players: string[];
  playerCreateRoom: string;
  data: object;
}

class RoomService {
  public async createGameRoom(
    socket: Socket,
    data: object
  ): Promise<RoomResponse> {
    try {
      const roomCreated: RoomResponse = await new Promise((resolve, reject) => {
        socket.emit("create_room", data);
        socket.once("roomCreated", (data) => resolve(data));
        socket.once("roomCreateError", ({ error }) => reject(error));
      });

      if (roomCreated) {
        return roomCreated;
      } else {
        throw new Error("Failed to create room");
      }
    } catch (error) {
      console.error("Lỗi tạo phòng chơi:", error);
      throw error;
    }
  }

  public async joinGameRoom(socket: Socket, roomId: string, namePlayer2: string): Promise<Room> {
    return new Promise((resolve, reject) => {
      socket.emit("join_room", { roomId, namePlayer2 });

      // Nhận số người chơi
      socket.on("playerNumber", (playerNumber: number, room: Room) => {
        console.log(`You are player number ${playerNumber}`);
        // Room data sẽ được truyền khi nhận sự kiện "playerNumber"
        resolve(room); // Trả về dữ liệu của phòng ngay khi nhận
      });

      // Sự kiện khi trò chơi bắt đầu, trả về dữ liệu phòng
      socket.once("playerJoined", (room: Room) => {
        console.log("Player joined:", room);
        resolve(room);
      });

      socket.once("roomNotFound", () => {
        console.error("Room not found");
        reject("Room not found");
      });

      socket.once("roomFull", () => {
        console.error("Room is full");
        reject("Room is full");
      });
    });
  }

  public async getRoom(socket: Socket, roomId: string): Promise<Room> {
    return new Promise((resolve, reject) => {
      socket.emit("get_room", roomId);

      socket.on("roomNotFound", () => {
        console.error("Room not found");
        reject("Room not found");
      });

      socket.on("roomFound", (room: Room) => {
        resolve(room);
      });
      
    });
  }

  public async getAllRooms(socket: Socket): Promise<Room[]> {
    return new Promise((resolve, reject) => {
      socket.emit("get_all_rooms");

      socket.on("allRooms", (rooms: Room[]) => {
        resolve(rooms);
      });

      socket.on("error", (error) => {
        console.error("Error getting rooms:", error);
        reject(error);
      });
    });
  }

  public async select_symbol(
    socket: Socket,
    roomId: string,
    symbol: string
  ): Promise<Room> {
    return new Promise((resolve, reject) => {
      socket.emit("select_symbol", roomId, symbol);

      socket.on("symbolTaken", (message) => {
        reject(message);
      });

      socket.on("symbolSelected", (room: Room) => {
        resolve(room);
      });

      socket.on("error", (error) => {
        console.error("Error selecting symbol:", error);
        reject(error);
      });
    });
  }
}

export default new RoomService();
