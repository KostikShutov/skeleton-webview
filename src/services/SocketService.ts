import { Socket, io } from "socket.io-client";

class SocketService {
  socket: Socket;

  constructor() {
    this.socket = io(process.env.VUE_APP_SERVER_HOST, {
      auth: {
        token: "secret",
      },
    });
  }
}

export default new SocketService();
