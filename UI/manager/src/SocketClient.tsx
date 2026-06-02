import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { connectSocket, disconnectSocket } from "@/utils/socketClient";
import { addMessage, updateConversation, setConversations, addUnread, SupportConversation } from "@/redux/slices/chat";
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
      console.log("[Manager Socket] Connected:", socket.id);
      messageApi.getOnlineManagers().then(ids => dispatch(setOnlineUsers(ids))).catch(() => {});
    });
    socket.on("connect_error", (err) => console.error("[Manager Socket] Connect error:", err.message));
    socket.on("disconnect", (reason) => console.warn("[Manager Socket] Disconnected:", reason));

    socket.on("user_online", (userId: string) => {
      dispatch(setUserOnline(userId));
    });

    socket.on("user_offline", (userId: string) => {
      dispatch(setUserOffline(userId));
    });

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
          messageType: actualData.messageType,
          productCard: actualData.productCard,
          attachments: actualData.attachments,
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
      socket.off("user_online");
      socket.off("user_offline");
      disconnectSocket();
    };
  }, [isLogin, dispatch]);

  return null;
};

export default SocketClient;
