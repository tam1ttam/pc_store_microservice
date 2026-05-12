import { useEffect, useRef, useState } from "react";
import { messageApi } from "@/services/api/messageApi";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { RootState } from "@/redux/store";
import { setMessages, addMessage, ChatMessage } from "@/redux/slices/chat";

const MessagesPage = () => {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    const dispatch = useAppDispatch();
    const currentUsername = useAppSelector((state: RootState) => state.user.info?.userName);
    const messages = useAppSelector((state: RootState) =>
        conversationId ? state.chat.messages[conversationId] || [] : []
    );

    useEffect(() => {
        let convId: string;
        messageApi
            .startStoreChat()
            .then((conv) => {
                convId = conv.id;
                setConversationId(conv.id);
                return messageApi.getMessages(conv.id);
            })
            .then((msgs) => {
                if (!msgs || msgs.length === 0) return;
                const formatted: ChatMessage[] = msgs.map((msg: any) => ({
                    id: msg.id,
                    conversationId: convId,
                    sender: msg.sender,
                    content: msg.message || msg.content || "",
                    message: msg.message || msg.content || "",
                    createdDate: typeof msg.createdDate === "number"
                        ? (msg.createdDate > 1e12 ? msg.createdDate : msg.createdDate * 1000)
                        : new Date(msg.createdDate).getTime(),
                    me: msg.me,
                }));
                dispatch(setMessages({ conversationId: convId, messages: formatted }));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [dispatch]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !conversationId || sending) return;
        setSending(true);
        try {
            const response = await messageApi.sendMessage(conversationId, input.trim());
            setInput("");
            if (response) {
                const createdDate = typeof response.createdDate === "number"
                    ? response.createdDate
                    : new Date(response.createdDate).getTime();
                dispatch(addMessage({
                    conversationId,
                    message: {
                        id: response.id,
                        conversationId,
                        sender: response.sender,
                        content: response.message || "",
                        message: response.message,
                        createdDate,
                        me: true,
                    },
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                    PC
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Cửa hàng PC Store</p>
                    <p className="text-xs text-green-500">Hỗ trợ trực tuyến</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center pt-12 text-gray-400 text-sm">Đang kết nối...</div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center pt-12 text-gray-400 text-sm">
                        Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện với cửa hàng.
                    </div>
                ) : (
                    messages.map((msg) => {
                        const content = msg.content || msg.message || "";
                        const isMe = msg.me || msg.sender?.userName === currentUsername;
                        return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                {!isMe && (
                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        PC
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words ${
                                        isMe
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-white text-gray-800 border rounded-bl-sm shadow-sm"
                                    }`}
                                >
                                    {content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t px-4 py-3 flex gap-3 items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Nhắn tin cho cửa hàng..."
                    disabled={loading || !conversationId}
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-400 transition-colors disabled:bg-gray-50"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading || sending || !conversationId}
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors flex-shrink-0"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default MessagesPage;
