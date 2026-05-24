import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { connectSocket, disconnectSocket } from "@/utils/socketClient";
import { addMessage } from "@/redux/slices/chat";
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

        socket.on("message", (data: any) => {
            const actualData = typeof data === "string" ? JSON.parse(data) : data;

            const createdDate = typeof actualData.createdDate === 'number'
                ? (actualData.createdDate > 1e12 ? actualData.createdDate : actualData.createdDate * 1000)
                : (actualData.createdDate ? new Date(actualData.createdDate).getTime() : Date.now());

            dispatch(addMessage({
                conversationId: actualData.conversationId,
                message: {
                    id: actualData.id,
                    conversationId: actualData.conversationId,
                    sender: actualData.sender,
                    content: actualData.content || "",
                    message: actualData.message,
                    createdDate,
                    me: actualData.me
                }
            }));
        });

        return () => {
            socket.off("message");
            disconnectSocket();
        };
    }, [isLogin, dispatch]);

    return null;
};

export default SocketClient;
