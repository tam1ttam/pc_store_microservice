import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { RootState } from "@/redux/store";
import { MessageCircle, X, Send, User, Loader2, Paperclip, FileText, Music, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { messageApi, Attachment } from "@/services/api/messageApi";
import { setMessages, addMessage, clearPendingProduct } from "@/redux/slices/chat";
import { ProductCardBubble } from "./chat/ProductCardBubble";
import { Seller } from "../assets/logo";

function detectFileType(fileName: string): Attachment["fileType"] {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg", "mov", "avi"].includes(ext)) return "video";
    if (["mp3", "wav", "flac", "aac", "m4a"].includes(ext)) return "audio";
    return "document";
}

function AttachmentPreview({ att, isMe }: { att: Attachment; isMe: boolean }) {
    const textClass = isMe ? "text-orange-100" : "text-gray-500";
    if (att.fileType === "image") {
        return (
            <a href={att.url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                <img src={att.url} alt={att.originalFileName} className="max-w-[200px] max-h-[160px] rounded-lg object-cover" />
            </a>
        );
    }
    if (att.fileType === "video") {
        return (
            <video controls className="mt-1 max-w-[200px] rounded-lg">
                <source src={att.url} />
            </video>
        );
    }
    if (att.fileType === "audio") {
        return (
            <div className="mt-1 flex items-center gap-2">
                <Music className={`w-4 h-4 flex-shrink-0 ${textClass}`} />
                <audio controls className="h-8 max-w-[180px]">
                    <source src={att.url} />
                </audio>
            </div>
        );
    }
    return (
        <a href={att.url} target="_blank" rel="noopener noreferrer"
            className={`mt-1 flex items-center gap-1.5 underline text-xs ${textClass}`}>
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            {att.originalFileName}
        </a>
    );
}

interface SellerChatModalProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    isHidden: boolean;
}

const SellerChatModal = ({ isOpen, onOpen, onClose, isHidden }: SellerChatModalProps) => {
    const { t } = useTranslation();
    const [conversation, setConversation] = useState<any | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasFetchedRef = useRef(false);

    const dispatch = useAppDispatch();
    const isLogin = useAppSelector((state: RootState) => state.auth.isLogin);
    const onlineUserIds = useAppSelector((state: RootState) => state.presence.onlineUserIds);
    const pendingProductCard = useAppSelector((state: RootState) => state.chat.pendingProductCard);
    const hasOnlineManager = onlineUserIds.length > 0;

    const messagesFromRedux = useAppSelector((state: RootState) =>
        conversation ? state.chat.messages[conversation.id] || [] : []
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFetchConversation = async () => {
        if (hasFetchedRef.current) return;
        try {
            hasFetchedRef.current = true;
            const conv = await messageApi.startStoreChat();
            setConversation(conv);
            const msgs = await messageApi.getMessages(conv.id);
            if (msgs && msgs.length > 0) {
                const formattedMsgs = msgs.map((msg: any) => ({
                    id: msg.id,
                    conversationId: conv.id,
                    sender: msg.sender,
                    content: msg.message || msg.content,
                    message: msg.message || msg.content,
                    attachments: msg.attachments,
                    messageType: msg.messageType,
                    productCard: msg.productCard,
                    createdDate: typeof msg.createdDate === "number"
                        ? (msg.createdDate > 1e12 ? msg.createdDate : msg.createdDate * 1000)
                        : new Date(msg.createdDate).getTime(),
                    me: msg.me ?? false,
                }));
                dispatch(setMessages({ conversationId: conv.id, messages: formattedMsgs }));
            }
        } catch (error) {
            console.error("Error fetching conversation:", error);
        }
    };

    useEffect(() => { scrollToBottom(); }, [messagesFromRedux, isOpen]);

    useEffect(() => {
        if (!isOpen) { hasFetchedRef.current = false; return; }
        handleFetchConversation();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && pendingProductCard) {
            handleSendMessage();
        }
    }, [isOpen, pendingProductCard]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFile(true);
        try {
            const result = await messageApi.uploadFile(file);
            const fileType = detectFileType(result.originalFileName || file.name);
            setPendingAttachment({ url: result.url, originalFileName: result.originalFileName || file.name, fileType });
        } catch {
            alert(t('chat.uploadFailed'));
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSendMessage = async () => {
        if ((!inputValue.trim() && !pendingAttachment && !pendingProductCard) || isLoading || !conversation) return;
        setIsLoading(true);
        try {
            const attachments = pendingAttachment ? [pendingAttachment] : undefined;

            const messageType = pendingProductCard ? "PRODUCT_CARD" : "TEXT";
            const productCard = pendingProductCard;

            const response = await messageApi.sendMessage(
                conversation.id,
                inputValue.trim(),
                attachments,
                messageType,
                productCard
            );

            setInputValue("");
            setPendingAttachment(null);
            dispatch(clearPendingProduct());

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
                        messageType: response.messageType,
                        productCard: response.productCard,
                    },
                }));
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    if (!isLogin) return null;
    if (isHidden) return null;

    return (
        <>
            <button
                onClick={onOpen}
                className={`fixed bottom-24 right-2 z-50 w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 ${isOpen ? "hidden" : ""}`}
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {isOpen && (
                <div className="fixed bottom-8 right-2 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full bg-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img src={Seller} alt="seller" />
                                {hasOnlineManager && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold">{t('chat.sellerTitle')}</h3>
                                <p className="text-xs text-white/80">
                                    {hasOnlineManager ? t('chat.online') : t('chat.customerSupport')}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messagesFromRedux.length === 0 && (
                            <div className="text-center text-gray-400 text-sm pt-4">{t('chat.startConversation')}</div>
                        )}
                        {messagesFromRedux.map((msg) => {
                            const isMe = msg.me ?? false;
                            const text = msg.message || msg.content || "";
                            const time = new Date(msg.createdDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                            return (
                                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                                    {isMe ? (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-500 text-white">
                                            <User className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {msg.sender?.avatar
                                                ? <img src={msg.sender.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                : <img src={Seller} alt="seller" />}
                                        </div>
                                    )}
                                    <div className={`max-w-[78%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                                        {msg.productCard && (
                                            <ProductCardBubble product={msg.productCard} isMe={isMe} />
                                        )}
                                        <div className={`px-3 py-2 rounded-2xl ${isMe
                                            ? "bg-orange-500 text-white rounded-br-md"
                                            : "bg-white text-gray-800 rounded-bl-md shadow-sm border"}`}>
                                            {text && <p className="text-sm whitespace-pre-wrap">{text}</p>}
                                            {(msg.attachments ?? []).map((att, i) => (
                                                <AttachmentPreview key={i} att={att} isMe={isMe} />
                                            ))}
                                        </div>
                                        <div className={`flex items-center gap-1 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                            {!isMe && msg.sender?.username && (
                                                <span className="text-[10px] text-gray-500 font-medium">{msg.sender.username}</span>
                                            )}
                                            <span className="text-[10px] text-gray-400">{time}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className="flex items-end gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <img src={Seller} alt="seller" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border">
                                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested questions */}
                    {messagesFromRedux.length <= 1 && (
                        <div className="px-4 py-2 bg-white border-t">
                            <p className="text-xs text-gray-500 mb-2">{t('chat.suggestedQuestions')}</p>
                            <div className="flex flex-wrap gap-1">
                                {[t('chat.suggestedQ1'), t('chat.suggestedQ2'), t('chat.suggestedQ3')].map((q, i) => (
                                    <button key={i} onClick={() => setInputValue(q)}
                                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors">
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input area */}
                    <div className="p-4 bg-white border-t">
                        <div className="flex gap-2 items-center">
                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange}
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" />
                            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingFile || isLoading}
                                className="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50"
                                title={t('chat.attachFile')}>
                                {uploadingFile
                                    ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    : <Paperclip className="w-4 h-4 text-gray-500" />}
                            </button>
                            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('chat.inputPlaceholder')}
                                className="flex-1 rounded-full border-gray-300 focus:border-orange-500"
                                disabled={isLoading} />
                            <Button onClick={handleSendMessage}
                                disabled={(!inputValue.trim() && !pendingAttachment && !pendingProductCard) || isLoading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 p-0 flex-shrink-0">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SellerChatModal;
