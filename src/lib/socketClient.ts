import io from "socket.io-client";

export const socket = io("https://stakehub-chat-ws-server.onrender.com/", {
  transports: ["websocket"],
});
