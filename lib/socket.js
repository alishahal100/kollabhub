import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const socket = getSocket();
  socket.emit("userConnected", userId);
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};