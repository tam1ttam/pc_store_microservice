import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { connectSocket, disconnectSocket } from "@/utils/socketClient";
import { addMessage, updateConversation, setConversations, addUnread, SupportConversation } from "@/redux/slices/chat";
import { messageApi } from "@/services/api/messageApi";

const SocketClient = () => {
    const dispatch = useAppDispatch();
    const isLogin = useAppSelector(state => state.auth.isLogin);
    const token = useAppSelector(state => state.auth.token);

    useEffect(() => {
        if (!isLogin || !token) return;

        const socket = connectSocket(token);
        if (!socket) return;

        socket.on("connect", () => console.log("[Manager Socket] Connected:", socket.id));
        socket.on("connect_error", (err) => console.error("[Manager Socket] Connect error:", err.message));
        socket.on("disconnect", (reason) => console.warn("[Manager Socket] Disconnected:", reason));

        socket.on("message", (data: any) => {
            console.log("[Manager Socket] Received message event:", data);
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
                    createdDate,
                    me: actualData.me,
                },
            }));

            if (!actualData.me) {
                dispatch(addUnread(actualData.conversationId));
            }
        });

        socket.on("conversation_updated", async (data: any) => {
            const conv = typeof data === "string" ? JSON.parse(data) : data;
            dispatch(updateConversation(conv));
            try {
                const [support, mine] = await Promise.all([
                    messageApi.getAllSupportConversations(),
                    messageApi.getMyConversations(),
                ]);
                const directOnly = (mine as SupportConversation[]).filter(c => c.type !== "SUPPORT");
                const supportIds = new Set((support as SupportConversation[]).map(c => c.id));
                const merged = [
                    ...(support as SupportConversation[]),
                    ...directOnly.filter(c => !supportIds.has(c.id)),
                ];
                dispatch(setConversations(merged));
            } catch { /* ignore */ }
        });

        return () => {
            socket.off("message");
            socket.off("conversation_updated");
            disconnectSocket();
        };
    }, [isLogin, token, dispatch]);

    return null;
};

export default SocketClient;
