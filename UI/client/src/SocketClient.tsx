import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { connectSocket, disconnectSocket } from "@/utils/socketClient";
import { addMessage } from "@/redux/slices/chat";
import { setOnlineUsers, setUserOnline, setUserOffline } from "@/redux/slices/presence";
import { messageApi } from "@/services/api/messageApi";
import { getAccessToken } from "@/config/axios.config";

const SocketClient = () => {
    const dispatch = useAppDispatch();
    const isLogin = useAppSelector(state => state.auth.isLogin);

    useEffect(() => {
        if (!isLogin) return;

        const token = getAccessToken();
        if (!token) return;

        const socket = connectSocket(token);
        if (!socket) return;

        socket.on("connect", () => {
            messageApi.getOnlineManagers().then(ids => dispatch(setOnlineUsers(ids))).catch(() => {});
        });

        socket.on("user_online", (userId: string) => {
            dispatch(setUserOnline(userId));
        });

        socket.on("user_offline", (userId: string) => {
            dispatch(setUserOffline(userId));
        });

        socket.on("message", (data: any) => {
            const actualData = typeof data === "string" ? JSON.parse(data) : data;
            const createdDate = typeof actualData.createdDate === "number"
                ? (actualData.createdDate > 1e12 ? actualData.createdDate : actualData.createdDate * 1000)
                : (actualData.createdDate ? new Date(actualData.createdDate).getTime() : Date.now());

            dispatch(addMessage({
                conversationId: actualData.conversationId,
                message: {
                    id: actualData.id,
                    conversationId: actualData.conversationId,
                    sender: actualData.sender,
                    content: actualData.content || actualData.message || "",
                    message: actualData.message,
                    attachments: actualData.attachments,
                    createdDate,
                    me: actualData.me,
                },
            }));
        });

        return () => {
            socket.off("connect");
            socket.off("message");
            socket.off("user_online");
            socket.off("user_offline");
            disconnectSocket();
        };
    }, [isLogin, dispatch]);

    return null;
};

export default SocketClient;
