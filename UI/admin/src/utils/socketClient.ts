import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
export const KEY_TOKEN = "accessToken";

export const connectSocket = (token?: string) => {
    const realToken = token || getToken();
    if (!realToken) return null;
    if (socket && socket.connected) return socket;
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8099", {
        transports: ["websocket"],
        query: { token: realToken },
        autoConnect: true
    });
    return socket;
};

export const getSocket = () => socket;

export const getToken = () => {
    return localStorage.getItem(KEY_TOKEN);
};
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
