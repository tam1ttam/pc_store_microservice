import { useEffect, useState, useRef } from "react";
import { messageApi, Conversation } from "@/services/api/messageApi";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { RootState } from "@/redux/store";
import { setMessages, ChatMessage } from "@/redux/slices/chat";

function getConversationDisplayName(conversationName?: string) {
    if (!conversationName) return "";
    return conversationName.replace(/\| *ADMIN/i, "").trim();
}

const AdminChatTab = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selected, setSelected] = useState<Conversation | null>(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [input, setInput] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const dispatch = useAppDispatch();
    const currentUsername = useAppSelector((state: RootState) => state.user.info?.userName);

    // ✅ Lấy messages từ Redux
    const messagesFromRedux = useAppSelector((state: RootState) => {
        const msgs = selected ? state.chat.messages[selected.id] || [] : [];
        return msgs;
    });

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await messageApi.getMyConversations();
                setConversations(data || []);
            } catch (err) {
                setConversations([]);
            }
        };
        fetchConversations();
    }, []);

    // Fetch messages when selected conversation changes
    useEffect(() => {
        if (!selected) return;

        setLoadingMessages(true);
        messageApi
            .getMessages(selected.id)
            .then((msgs) => {
                // ✅ Dispatch vào Redux thay vì setState
                const formattedMsgs: ChatMessage[] = (msgs || []).map((msg: any) => ({
                    id: msg.id,
                    conversationId: selected.id,
                    sender: msg.sender,
                    // Fallback logic khi load history
                    content: msg.message || msg.content || "",
                    message: msg.message || msg.content || "",
                    createdDate: msg.createdDate > 1e12 ? msg.createdDate : msg.createdDate * 1000,
                    me: msg.sender?.userName === currentUsername
                }));

                dispatch(
                    setMessages({
                        conversationId: selected.id,
                        messages: formattedMsgs
                    })
                );
            })
            .finally(() => setLoadingMessages(false));
    }, [selected, currentUsername, dispatch]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messagesFromRedux]);

    const handleSend = async () => {
        if (!selected || (!input.trim() && !image)) return;

        // Gửi text
        if (input.trim()) {
            try {
                await messageApi.sendMessage(selected.id, input.trim());
                setInput("");
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }

        // Gửi ảnh
        if (image) {
            try {
                await messageApi.sendMessage(selected.id, `[Hình ảnh] ${image.name}`);
                setImage(null);
            } catch (error) {
                console.error("Error sending image:", error);
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                height: "70vh",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px #0001"
            }}
        >
            {/* Sidebar: Danh sách hội thoại */}
            <div style={{ width: 320, borderRight: "1px solid #eee", overflowY: "auto" }}>
                <div style={{ padding: 16, fontWeight: 600, fontSize: 18 }}>Tất cả hội thoại</div>
                {conversations.length === 0 && <div style={{ padding: 24, color: "#888" }}>Không có hội thoại nào</div>}
                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => setSelected(conv)}
                        style={{
                            padding: 16,
                            cursor: "pointer",
                            background: selected?.id === conv.id ? "#f0f0f0" : "transparent",
                            borderBottom: "1px solid #f5f5f5"
                        }}
                    >
                        <div style={{ fontWeight: 600 }}>{getConversationDisplayName(conv.conversationName)}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                            {conv.lastMessage ? conv.lastMessage : "Chưa có tin nhắn"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main: Khung chat hoặc thông báo */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                {!selected ? (
                    <div style={{ color: "#888", fontSize: 18, margin: "auto" }}>Nhấn vào hội thoại để bắt đầu</div>
                ) : (
                    <>
                        <div style={{ padding: 16, borderBottom: "1px solid #eee", fontWeight: 600, fontSize: 16 }}>
                            {getConversationDisplayName(selected.conversationName)}
                        </div>
                        <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#fafbfc" }}>
                            {loadingMessages ? (
                                <div style={{ color: "#888" }}>Đang tải tin nhắn...</div>
                            ) : messagesFromRedux.length === 0 ? (
                                <div style={{ color: "#888" }}>Hãy trò chuyện để bắt đầu.</div>
                            ) : (
                                messagesFromRedux.map((msg) => {
                                    // 🔥 FIX: Xác định nội dung hiển thị tại đây để tránh trường hợp content rỗng
                                    const displayContent = msg.content || msg.message || "";

                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                marginBottom: 12,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: msg.sender?.userName === "admin" ? "flex-end" : "flex-start"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background:
                                                        msg.sender?.userName === "admin" ? "#6c47ff" : "#f1f0f0",
                                                    color: msg.sender?.userName === "admin" ? "#fff" : "#222",
                                                    borderRadius: 16,
                                                    padding: "8px 16px",
                                                    maxWidth: "60%",
                                                    wordBreak: "break-word"
                                                }}
                                            >
                                                {/* Kiểm tra displayContent thay vì msg.content */}
                                                {typeof displayContent === "string" &&
                                                displayContent.startsWith("[Hình ảnh]") ? (
                                                    <span role="img" aria-label="image">
                                                        🖼️
                                                    </span>
                                                ) : null}
                                                {displayContent}
                                            </div>
                                            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
                                                {msg.sender?.userName} •{" "}
                                                {msg.createdDate
                                                    ? new Date(msg.createdDate).toLocaleString("vi-VN")
                                                    : ""}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {/* Input chat + upload ảnh */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: 16,
                                borderTop: "1px solid #eee",
                                background: "#fff"
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                id="chat-image-upload"
                                onChange={handleImageChange}
                            />
                            <label
                                htmlFor="chat-image-upload"
                                style={{ cursor: "pointer", marginRight: 8 }}
                                title="Gửi ảnh"
                            >
                                <span role="img" aria-label="upload">
                                    📷
                                </span>
                            </label>
                            {image && (
                                <span style={{ marginRight: 8, fontSize: 12, color: "#6c47ff" }}>{image.name}</span>
                            )}
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Nhắn tin..."
                                style={{
                                    flex: 1,
                                    border: "1px solid #eee",
                                    borderRadius: 16,
                                    padding: "8px 16px",
                                    marginRight: 8
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSend();
                                }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    background: "#6c47ff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 16,
                                    padding: "8px 20px",
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                                disabled={(!input.trim() && !image) || loadingMessages}
                            >
                                Gửi
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminChatTab;
