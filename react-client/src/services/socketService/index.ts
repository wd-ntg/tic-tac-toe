import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

class SocketService {
  public socket: Socket | null = null;

  public connect(
    url: string,
    timeOut: number
  ): Promise<Socket<DefaultEventsMap, DefaultEventsMap>> {
    return new Promise((resolve, reject) => {
      // Kiểm tra nếu socket đã tồn tại và đang kết nối thì không tạo mới
      if (this.socket && this.socket.connected) {
        return resolve(this.socket);
      }

      // Nếu đã tồn tại socket nhưng không kết nối, ngắt kết nối cũ
      if (this.socket) {
        this.socket.disconnect();
      }

      // Tạo một kết nối mới
      this.socket = io(url);

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
        resolve(this.socket as Socket);
      });

      this.socket.on("connect_error", (err) => {
        console.log("Connection error: ", err);
        reject(err);
      });
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log("Socket disconnected");
      this.socket = null;
    }
  }
}

export default new SocketService();
