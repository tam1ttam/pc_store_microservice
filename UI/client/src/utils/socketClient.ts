import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
export const KEY_TOKEN = "accessToken";

export const connectSocket = (token?: string) => {
    const realToken = token || getToken();
    if (!realToken) return null;
    if (socket && socket.connected) return socket;
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
    }
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8099", {
        transports: ["websocket"],
        query: { token: realToken },
        autoConnect: true,
        reconnection: true,
    });
    // Refresh token before each auto-reconnect attempt
    socket.io.on("reconnect_attempt", () => {
        (socket!.io.opts as any).query = { token: getToken() };
    });
    // socket.io-client v4 does NOT auto-reconnect on "io server disconnect"
    // Manually reconnect with fresh token when server kicks the client (e.g. auth failure)
    socket.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
            setTimeout(() => {
                const freshToken = getToken();
                if (freshToken && socket && !socket.connected) {
                    (socket.io.opts as any).query = { token: freshToken };
                    socket.connect();
                }
            }, 1000);
        }
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
