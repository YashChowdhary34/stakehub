import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initSocket(token: string) {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return socket;
}
