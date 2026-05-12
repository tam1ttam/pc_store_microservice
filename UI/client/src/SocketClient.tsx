import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { connectSocket, disconnectSocket } from "@/utils/socketClient";
import { addMessage } from "@/redux/slices/chat";

const SocketClient = () => {
    const dispatch = useAppDispatch();
    const isLogin = useAppSelector(state => state.auth.isLogin);
    const token = useAppSelector(state => state.auth.token);

    useEffect(() => {
        console.log(`Client connected to socket server with token: ${token}`);
        if (!isLogin || !token) return;

        const socket = connectSocket(token);
        if (!socket) return;

        // ✅ Nhận tin nhắn mới và dispatch vào Redux
        socket.on("message", (data: any) => {
            // console.log('🔔 SocketClient received RAW data:', data);

            // Lấy dữ liệu thực tế
            const actualData = typeof data === "string" ? JSON.parse(data) : data;

            console.log('🔔 SocketClient received RAW data:', actualData);
            const messageText = actualData.message;
            const messageContent = actualData.content;
            const createdDate = typeof actualData.createdDate === 'number'
                ? (actualData.createdDate > 1e12 ? actualData.createdDate : actualData.createdDate * 1000)
                : (actualData.createdDate ? new Date(actualData.createdDate).getTime() : Date.now());

            const message = {
                id: actualData.id,
                conversationId: actualData.conversationId,
                sender: actualData.sender,
                content: messageContent || "",
                message: messageText,
                createdDate,
                me: actualData.me
            };

            console.log('📨 Dispatching message to Redux:', message);

            dispatch(addMessage({
                conversationId: actualData.conversationId,
                message
            }));
        });

        return () => {
            socket.off("message");
            disconnectSocket();
        };
    }, [isLogin, token, dispatch]);

    return null;
};

export default SocketClient;