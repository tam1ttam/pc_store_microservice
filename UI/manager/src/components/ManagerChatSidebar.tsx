import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/services/api/aiApi";
import { messageApi, Conversation, ManagerInfo, Attachment } from "@/services/api/messageApi";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { RootState } from "@/redux/store";
import { setMessages, addMessage, ChatMessage, setConversations, updateConversation, clearUnread, SupportConversation } from "@/redux/slices/chat";
import { AILogo } from "@/assets/logo";
import { Send, X, Loader2, User, Shield, ArrowRightLeft, Plus, MessageSquare, Search, Paperclip, FileText, Music, Video } from "lucide-react";

function detectFileType(fileName: string): Attachment["fileType"] {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg", "mov", "avi"].includes(ext)) return "video";
    if (["mp3", "wav", "flac", "aac", "m4a"].includes(ext)) return "audio";
    return "document";
}

function AttachmentBubble({ att, isMe, isDirect }: { att: Attachment; isMe: boolean; isDirect: boolean }) {
    const textClass = isMe ? (isDirect ? "text-indigo-100" : "text-orange-100") : "text-gray-500";
    if (att.fileType === "image") {
        return (
            <a href={att.url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                <img src={att.url} alt={att.originalFileName} className="max-w-[180px] max-h-[140px] rounded-lg object-cover" />
            </a>
        );
    }
    if (att.fileType === "video") {
        return (
            <video controls className="mt-1 max-w-[180px] rounded-lg">
                <source src={att.url} />
            </video>
        );
    }
    if (att.fileType === "audio") {
        return (
            <div className="mt-1 flex items-center gap-1.5">
                <Music className={`w-3.5 h-3.5 flex-shrink-0 ${textClass}`} />
                <audio controls className="h-7 max-w-[160px]"><source src={att.url} /></audio>
            </div>
        );
    }
    return (
        <a href={att.url} target="_blank" rel="noopener noreferrer"
            className={`mt-1 flex items-center gap-1 underline text-xs ${textClass}`}>
            <FileText className="w-3 h-3 flex-shrink-0" />
            {att.originalFileName}
        </a>
    );
}

function getIdentityUserIdFromToken(token: string | null): string {
    if (!token) return "";
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || "";
    } catch {
        return "";
    }
}

interface AIMessage {
    id: number;
    type: "user" | "bot";
    content: string;
    timestamp: Date;
}

function clientName(conv: Conversation | SupportConversation) {
    if (!conv.conversationName) return "Khách hàng";
    return conv.conversationName.replace(/\| *ADMIN/i, "").trim() || "Khách hàng";
}

type FilterTab = "all" | "customers" | "managers" | "ai";

function sortByRecent(a: SupportConversation, b: SupportConversation) {
    const dateA = a.lastMessageAt || a.modifiedDate || "";
    const dateB = b.lastMessageAt || b.modifiedDate || "";
    return dateB > dateA ? 1 : -1;
}

// ─── AI Chat Window ────────────────────────────────────────────────────────────
const AIChatWindow = ({ onClose }: { onClose: () => void }) => {
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: 0,
            type: "bot",
            content: "👋 Xin chào! Tôi là trợ lý AI của PC Store. Hãy hỏi tôi bất cứ điều gì!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const userMsg: AIMessage = { id: messages.length, type: "user", content: input.trim(), timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        try {
            const res = await aiApi.askQuestion(userMsg.content);
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length,
                    type: "bot",
                    content: res.answer || res.error || "Xin lỗi, tôi không thể xử lý yêu cầu này.",
                    timestamp: new Date(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: prev.length, type: "bot", content: "❌ Có lỗi xảy ra. Vui lòng thử lại.", timestamp: new Date() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-0 right-72 z-50 w-96 h-[560px] bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <img src={AILogo} alt="AI" className="w-8 h-8 rounded-full border-2 border-white/30" />
                    <div>
                        <p className="font-semibold text-sm">PC Store AI</p>
                        <p className="text-xs text-white/70">Trợ lý thông minh</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                {messages.map((msg) => {
                    const time = msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                            {msg.type === "user" ? (
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <User className="w-3 h-3 text-white" />
                                </div>
                            ) : (
                                <img src={AILogo} alt="AI" className="w-6 h-6 rounded-full flex-shrink-0" />
                            )}
                            <div className={`max-w-[75%] flex flex-col gap-0.5 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                <div
                                    className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${msg.type === "user"
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-white text-gray-800 border rounded-bl-sm shadow-sm"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-gray-400 px-1">{time}</span>
                            </div>
                        </div>
                    );
                })}
                {loading && (
                    <div className="flex items-end gap-2">
                        <img src={AILogo} alt="AI" className="w-6 h-6 rounded-full flex-shrink-0" />
                        <div className="bg-white border px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div className="p-3 bg-white border-t flex gap-2 flex-shrink-0">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Nhập câu hỏi..."
                    className="flex-1 h-9 rounded-full text-sm"
                    disabled={loading}
                />
                <Button
                    onClick={send}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-full p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

// ─── Customer / Direct Chat Window ────────────────────────────────────────────
const CustomerChatWindow = ({
    conversation,
    currentUsername,
    onClose,
    onUpdated,
}: {
    conversation: SupportConversation;
    currentUsername: string;
    onClose: () => void;
    onUpdated: (conv: SupportConversation) => void;
}) => {
    const [input, setInput] = useState("");
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferFilter, setTransferFilter] = useState<"online" | "all">("all");
    const [actionLoading, setActionLoading] = useState(false);
    const [managerList, setManagerList] = useState<ManagerInfo[]>([]);
    const [loadingManagers, setLoadingManagers] = useState(false);
    const [onlineManagerIds, setOnlineManagerIds] = useState<string[]>([]);
    const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevConvIdRef = useRef<string>("");
    const dispatch = useAppDispatch();
    const messages = useAppSelector((state: RootState) => state.chat.messages[conversation.id] || []);
    const token = useAppSelector((state: RootState) => state.auth.token);
    const currentUserId = useMemo(() => getIdentityUserIdFromToken(token), [token]);
    const onlineUserIds = useAppSelector((state: RootState) => state.presence.onlineUserIds);

    const isDirect = conversation.type !== "SUPPORT";
    const isAssignedToMe = !isDirect && !!conversation.assignedManagerId && conversation.assignedManagerId === currentUserId;
    const isUnassigned = !isDirect && !conversation.assignedManagerId;
    const canSend = isDirect || isAssignedToMe;
    const isClientOnline = !isDirect && !!conversation.clientId && onlineUserIds.includes(conversation.clientId);

    // Bootstrap client online status on mount
    useEffect(() => {
        if (!isDirect && conversation.clientId) {
            messageApi.isUserOnline(conversation.clientId)
                .then(online => { if (online) dispatch({ type: "presence/setUserOnline", payload: conversation.clientId }); })
                .catch(() => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation.id]);

    useEffect(() => {
        const isNewConv = prevConvIdRef.current !== conversation.id;
        prevConvIdRef.current = conversation.id;
        if (isNewConv) setLoadingMsgs(true);

        messageApi
            .getMessages(conversation.id)
            .then((msgs) => {
                const formatted: ChatMessage[] = (msgs || []).map((msg: any) => ({
                    id: msg.id,
                    conversationId: conversation.id,
                    sender: msg.sender,
                    content: msg.message || msg.content || "",
                    message: msg.message || msg.content || "",
                    attachments: msg.attachments,
                    createdDate: typeof msg.createdDate === "number"
                        ? (msg.createdDate > 1e12 ? msg.createdDate : msg.createdDate * 1000)
                        : new Date(msg.createdDate).getTime(),
                    me: msg.me ?? false,
                }));
                dispatch(setMessages({ conversationId: conversation.id, messages: formatted }));
            })
            .catch(console.error)
            .finally(() => { if (isNewConv) setLoadingMsgs(false); });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation.id, conversation.lastMessageAt, dispatch]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, loadingMsgs]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFile(true);
        try {
            const result = await messageApi.uploadFile(file);
            const fileType = detectFileType(result.originalFileName || file.name);
            setPendingAttachment({ url: result.url, originalFileName: result.originalFileName || file.name, fileType });
        } catch {
            alert("Tải file lên thất bại.");
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const send = async () => {
        if ((!input.trim() && !pendingAttachment) || !canSend) return;
        try {
            const attachments = pendingAttachment ? [pendingAttachment] : undefined;
            const response = await messageApi.sendMessage(conversation.id, input.trim(), attachments);
            setInput("");
            setPendingAttachment(null);
            if (response) {
                const createdDate = typeof response.createdDate === "number"
                    ? response.createdDate
                    : new Date(response.createdDate).getTime();
                dispatch(addMessage({
                    conversationId: conversation.id,
                    message: {
                        id: response.id,
                        conversationId: conversation.id,
                        sender: response.sender,
                        content: response.message || "",
                        message: response.message,
                        attachments: response.attachments,
                        createdDate,
                        me: true,
                    },
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleClaim = async () => {
        setActionLoading(true);
        try {
            const updated = await messageApi.claimConversation(conversation.id);
            onUpdated(updated as SupportConversation);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Không thể nhận xử lý cuộc trò chuyện này.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleTransfer = async (toManagerId: string) => {
        setActionLoading(true);
        try {
            const updated = await messageApi.transferConversation(conversation.id, toManagerId);
            onUpdated(updated as SupportConversation);
            setShowTransfer(false);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Không thể chuyển giao cuộc trò chuyện.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleShowTransfer = async () => {
        if (showTransfer) { setShowTransfer(false); return; }
        setShowTransfer(true);
        setLoadingManagers(true);
        try {
            const [list, onlineIds] = await Promise.all([
                managerList.length === 0 ? messageApi.getManagerList() : Promise.resolve(managerList),
                messageApi.getOnlineManagers(),
            ]);
            if (managerList.length === 0) setManagerList((list as ManagerInfo[]).filter(m => m.id !== currentUserId));
            setOnlineManagerIds(onlineIds);
        } catch { /* ignore */ } finally {
            setLoadingManagers(false);
        }
    };

    const headerGradient = isDirect
        ? "bg-gradient-to-r from-indigo-500 to-purple-600"
        : "bg-gradient-to-r from-orange-400 to-red-500";

    const headerSubtitle = isDirect
        ? "Nhắn tin nội bộ"
        : isUnassigned
            ? "Chưa có người phụ trách"
            : isAssignedToMe
                ? "Bạn đang phụ trách"
                : `${conversation.assignedManagerName ?? "Manager khác"} đang phụ trách`;

    const onlineManagers = managerList.filter(m => onlineManagerIds.includes(m.id));

    return (
        <div className="fixed bottom-0 right-72 z-50 w-96 h-[620px] bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div className={`${headerGradient} text-white px-4 py-3 flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        {isDirect ? <MessageSquare className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                        {isClientOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{clientName(conversation)}</p>
                        <p className="text-xs text-white/70 truncate">
                            {!isDirect && isClientOnline ? "Đang hoạt động · " : ""}
                            {headerSubtitle}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Action bar — only for SUPPORT conversations */}
            {!isDirect && (
                <div className="px-3 py-2 border-b bg-orange-50 flex items-center gap-2 flex-shrink-0">
                    {isUnassigned && (
                        <button onClick={handleClaim} disabled={actionLoading}
                            className="flex items-center gap-1 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full transition-colors disabled:opacity-60">
                            <Shield className="w-3 h-3" />Nhận xử lý
                        </button>
                    )}
                    {isAssignedToMe && (
                        <button onClick={handleShowTransfer} disabled={actionLoading}
                            className="flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-full transition-colors disabled:opacity-60">
                            <ArrowRightLeft className="w-3 h-3" />Chuyển giao
                        </button>
                    )}
                    {!isUnassigned && !isAssignedToMe && (
                        <span className="text-xs text-gray-400 py-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {conversation.assignedManagerName ?? "Manager khác"} đang phụ trách
                        </span>
                    )}
                    {isUnassigned && (
                        <span className="text-xs text-yellow-600 py-1 ml-auto">Chưa có người phụ trách</span>
                    )}
                </div>
            )}

            {/* Transfer picker — tabs: Đang hoạt động / Tất cả */}
            {!isDirect && showTransfer && (
                <div className="border-b bg-gray-50 flex-shrink-0 max-h-52 flex flex-col overflow-hidden">
                    {/* Tab toggle */}
                    <div className="flex gap-1 px-3 pt-2 pb-1.5 flex-shrink-0">
                        {(["online", "all"] as const).map(tab => (
                            <button key={tab} onClick={() => setTransferFilter(tab)}
                                className={`flex-1 text-[11px] py-1 rounded-full font-medium transition-colors ${transferFilter === tab ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-200"}`}>
                                {tab === "online" ? "Đang hoạt động" : "Tất cả"}
                            </button>
                        ))}
                    </div>
                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {loadingManagers ? (
                            <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
                        ) : (() => {
                            const filtered = transferFilter === "online" ? onlineManagers : managerList;
                            console.log('online manager: ', onlineManagers);

                            return filtered.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-3">
                                    {transferFilter === "online" ? "Không có manager nào đang online" : "Không có manager nào"}
                                </p>
                            ) : filtered.map(m => {
                                const isOnline = onlineManagerIds.includes(m.id);
                                return (
                                    <button key={m.id} onClick={() => handleTransfer(m.id)} disabled={actionLoading}
                                        className="w-full text-left px-4 py-2 text-xs hover:bg-orange-50 transition-colors disabled:opacity-60 flex items-center gap-2">
                                        <div className="relative w-6 h-6 flex-shrink-0">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isOnline ? "bg-green-100" : "bg-gray-200"}`}>
                                                <User className={`w-3 h-3 ${isOnline ? "text-green-700" : "text-gray-500"}`} />
                                            </div>
                                            {isOnline && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full" />}
                                        </div>
                                        <span className="font-medium text-gray-700">{m.username}</span>
                                        {isOnline && <span className="ml-auto text-green-500 text-[10px]">Online</span>}
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {loadingMsgs ? (
                    <div className="flex justify-center pt-8">
                        <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                    </div>
                ) : messages.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 pt-8">Chưa có tin nhắn nào</p>
                ) : (
                    messages.map((msg) => {
                        const content = msg.content || msg.message || "";
                        const isMe = msg.me ?? false;
                        const senderName = msg.sender?.username;
                        const avatarUrl = msg.sender?.avatar;
                        const time = msg.createdDate
                            ? new Date(msg.createdDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                            : "";
                        return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                {isMe ? (
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isDirect ? "bg-indigo-100" : "bg-orange-100"}`}>
                                        <User className={`w-4 h-4 ${isDirect ? "text-indigo-500" : "text-orange-500"}`} />
                                    </div>
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-500" />}
                                    </div>
                                )}
                                <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                                    <div className={`px-3 py-2 rounded-2xl text-sm break-words ${isMe
                                        ? isDirect
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm"
                                            : "bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-br-sm"
                                        : "bg-white text-gray-800 border rounded-bl-sm shadow-sm"}`}>
                                        {content && <span className="whitespace-pre-wrap">{content}</span>}
                                        {(msg.attachments ?? []).map((att, i) => (
                                            <AttachmentBubble key={i} att={att} isMe={isMe} isDirect={isDirect} />
                                        ))}
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                        {senderName && <span className="text-[10px] text-gray-500 font-medium">{senderName}</span>}
                                        {time && <span className="text-[10px] text-gray-400">{time}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pending attachment preview */}
            {pendingAttachment && (
                <div className="px-3 py-2 bg-orange-50 border-t flex items-center gap-2 flex-shrink-0">
                    {pendingAttachment.fileType === "video" ? <Video className="w-4 h-4 text-orange-500" />
                        : pendingAttachment.fileType === "audio" ? <Music className="w-4 h-4 text-orange-500" />
                            : pendingAttachment.fileType === "document" ? <FileText className="w-4 h-4 text-orange-500" />
                                : <User className="w-4 h-4 text-orange-500" />}
                    <span className="text-xs text-gray-700 truncate flex-1">{pendingAttachment.originalFileName}</span>
                    <button onClick={() => setPendingAttachment(null)} className="text-gray-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t flex gap-2 items-center flex-shrink-0">
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" />
                {canSend && (
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                        className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50"
                        title="Đính kèm file">
                        {uploadingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" /> : <Paperclip className="w-3.5 h-3.5 text-gray-500" />}
                    </button>
                )}
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canSend && send()}
                    placeholder={canSend ? "Nhắn tin..." : `${conversation.assignedManagerName ?? "Manager khác"} đang phụ trách`}
                    className="flex-1 h-9 rounded-full text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    disabled={!canSend}
                />
                <Button
                    onClick={send}
                    disabled={(!input.trim() && !pendingAttachment) || !canSend}
                    className={`w-9 h-9 rounded-full p-0 hover:opacity-90 flex-shrink-0 ${isDirect ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-gradient-to-r from-orange-400 to-red-500"}`}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const ManagerChatSidebar = () => {
    const dispatch = useAppDispatch();
    const [activeChat, setActiveChat] = useState<"ai" | string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
    const [searchText, setSearchText] = useState("");
    const [showNewManagerChat, setShowNewManagerChat] = useState(false);
    const [managerListForNew, setManagerListForNew] = useState<ManagerInfo[]>([]);
    const [loadingNewManagers, setLoadingNewManagers] = useState(false);
    const [creatingChat, setCreatingChat] = useState(false);

    const currentUsername = useAppSelector((state: RootState) => state.user.info?.userName ?? "");
    const token = useAppSelector((state: RootState) => state.auth.token);
    const currentManagerId = useMemo(() => getIdentityUserIdFromToken(token), [token]);
    const conversations = useAppSelector((state: RootState) => state.chat.conversations ?? []);
    const unreadIds = useAppSelector((state: RootState) => state.chat.unreadConversationIds ?? []);
    const onlineUserIds = useAppSelector((state: RootState) => state.presence.onlineUserIds);

    const fetchConversations = useCallback(async () => {
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
        } catch {
            dispatch(setConversations([]));
        }
    }, [dispatch]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const supportConversations = useMemo(() =>
        conversations.filter(c => !c.type || c.type === "SUPPORT"), [conversations]);

    const directConversations = useMemo(() =>
        conversations.filter(c => c.type && c.type !== "SUPPORT"), [conversations]);

    const filteredSupport = useMemo(() => {
        if (activeFilter === "managers" || activeFilter === "ai") return [];
        const q = searchText.toLowerCase();
        return supportConversations
            .filter(c => !q || clientName(c).toLowerCase().includes(q) || (c.lastMessage || "").toLowerCase().includes(q))
            .sort(sortByRecent);
    }, [supportConversations, activeFilter, searchText]);

    const filteredDirect = useMemo(() => {
        if (activeFilter === "customers" || activeFilter === "ai") return [];
        const q = searchText.toLowerCase();
        return directConversations
            .filter(c => !q || clientName(c).toLowerCase().includes(q) || (c.lastMessage || "").toLowerCase().includes(q))
            .sort(sortByRecent);
    }, [directConversations, activeFilter, searchText]);

    const showAI = activeFilter === "all" || activeFilter === "ai";

    const activeConversation =
        activeChat && activeChat !== "ai"
            ? (conversations.find((c) => c.id === activeChat) ?? null)
            : null;

    const handleConvUpdated = (updated: SupportConversation) => {
        dispatch(updateConversation(updated));
    };

    const handleOpenNewManagerChat = async () => {
        if (showNewManagerChat) { setShowNewManagerChat(false); return; }
        setShowNewManagerChat(true);
        if (managerListForNew.length === 0) {
            setLoadingNewManagers(true);
            try {
                const list = await messageApi.getManagerList();
                setManagerListForNew(list.filter(m => m.id !== currentManagerId));
            } catch { /* ignore */ } finally {
                setLoadingNewManagers(false);
            }
        }
    };

    const handleStartDirectChat = async (managerId: string) => {
        setCreatingChat(true);
        try {
            const conv = await messageApi.createDirectConversation(managerId);
            await fetchConversations();
            setActiveChat(conv.id);
            setShowNewManagerChat(false);
        } catch (err) {
            console.error(err);
        } finally {
            setCreatingChat(false);
        }
    };

    const filterTabs: { key: FilterTab; label: string }[] = [
        { key: "all", label: "Tất cả" },
        { key: "customers", label: "Khách" },
        { key: "managers", label: "Manager" },
        { key: "ai", label: "AI" },
    ];

    return (
        <>
            <div className="fixed right-0 top-0 h-screen w-72 bg-white border-l border-gray-200 z-40 flex flex-col">
                <div className="pt-16 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                        <h2 className="font-semibold text-gray-700 text-sm">Tin nhắn</h2>
                        <button
                            onClick={handleOpenNewManagerChat}
                            className="w-7 h-7 rounded-full bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                            title="Nhắn tin manager khác"
                        >
                            <Plus className="w-4 h-4 text-indigo-600" />
                        </button>
                    </div>

                    {/* New manager chat picker */}
                    {showNewManagerChat && (
                        <div className="border-b bg-indigo-50 flex-shrink-0 max-h-44 overflow-y-auto">
                            <p className="text-xs text-indigo-600 font-medium px-4 pt-2 pb-1">Chọn manager để nhắn tin</p>
                            {loadingNewManagers ? (
                                <div className="flex justify-center py-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                </div>
                            ) : managerListForNew.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-3">Không có manager nào khác</p>
                            ) : (
                                managerListForNew.map((m) => {
                                    const isOnline = onlineUserIds.includes(m.id);
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => handleStartDirectChat(m.id)}
                                            disabled={creatingChat}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-100 transition-colors disabled:opacity-60 flex items-center gap-2"
                                        >
                                            <div className="relative w-6 h-6 flex-shrink-0">
                                                <div className="w-6 h-6 rounded-full bg-indigo-300 flex items-center justify-center">
                                                    <User className="w-3 h-3 text-white" />
                                                </div>
                                                {isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-700">{m.username}</span>
                                            {isOnline && <span className="text-green-500 text-[10px]">Online</span>}
                                            {creatingChat && <Loader2 className="w-3 h-3 animate-spin text-indigo-400 ml-auto" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Search */}
                    <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Tìm kiếm..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:border-blue-300 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="px-3 py-1.5 border-b border-gray-100 flex gap-1 flex-shrink-0">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                className={`flex-1 text-xs py-1 rounded-full transition-colors font-medium ${activeFilter === tab.key
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* AI entry */}
                        {showAI && (
                            <button
                                onClick={() => setActiveChat((prev) => (prev === "ai" ? null : "ai"))}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${activeChat === "ai" ? "bg-blue-50" : ""
                                    }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img src={AILogo} alt="AI" className="w-10 h-10 rounded-full border-2 border-blue-200" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800">PC Store AI</p>
                                    <p className="text-xs text-gray-400 truncate">Trợ lý thông minh</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium flex-shrink-0">
                                    AI
                                </span>
                            </button>
                        )}

                        {/* Support / Customer conversations */}
                        {filteredSupport.length > 0 && (
                            <>
                                <div className="px-4 py-1.5 border-b border-gray-100">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Khách hàng</p>
                                </div>
                                {filteredSupport.map((conv) => {
                                    const isAssignedToMe = !!conv.assignedManagerId && conv.assignedManagerId === currentManagerId;
                                    const isUnassigned = !conv.assignedManagerId;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => {
                                                setActiveChat((prev) => (prev === conv.id ? null : conv.id));
                                                dispatch(clearUnread(conv.id));
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${activeChat === conv.id ? "bg-orange-50" : ""
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-800 truncate">{clientName(conv)}</p>
                                                <p className="text-xs text-gray-400 truncate">{conv.lastMessage || "Chưa có tin nhắn"}</p>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-1">
                                                {unreadIds.includes(conv.id) && (
                                                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                                )}
                                                {isUnassigned ? (
                                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Chờ</span>
                                                ) : isAssignedToMe ? (
                                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Tôi</span>
                                                ) : (
                                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                        {conv.assignedManagerName?.slice(0, 6)}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </>
                        )}

                        {/* Direct / Manager conversations */}
                        {(activeFilter === "all" || activeFilter === "managers") && (
                            <>
                                <div className="px-4 py-1.5 border-b border-gray-100 flex items-center justify-between">
                                    <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Manager</p>
                                </div>
                                {filteredDirect.length === 0 ? (
                                    <p className="px-4 py-3 text-xs text-gray-400 text-center">Chưa có cuộc trò chuyện nào</p>
                                ) : (
                                    filteredDirect.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => {
                                                setActiveChat((prev) => (prev === conv.id ? null : conv.id));
                                                dispatch(clearUnread(conv.id));
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${activeChat === conv.id ? "bg-indigo-50" : ""
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-800 truncate">{clientName(conv)}</p>
                                                <p className="text-xs text-gray-400 truncate">{conv.lastMessage || "Chưa có tin nhắn"}</p>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-1">
                                                {unreadIds.includes(conv.id) && (
                                                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                                )}
                                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">DM</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </>
                        )}

                        {/* Empty state when nothing matches */}
                        {!showAI && filteredSupport.length === 0 && filteredDirect.length === 0 && activeFilter !== "managers" && (
                            <p className="px-4 py-8 text-xs text-gray-400 text-center">Không có hội thoại nào</p>
                        )}
                    </div>
                </div>
            </div>

            {activeChat === "ai" && <AIChatWindow onClose={() => setActiveChat(null)} />}
            {activeConversation && (
                <CustomerChatWindow
                    conversation={activeConversation}
                    currentUsername={currentUsername}
                    onClose={() => setActiveChat(null)}
                    onUpdated={handleConvUpdated}
                />
            )}
        </>
    );
};

export default ManagerChatSidebar;
