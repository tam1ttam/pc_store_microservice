import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { aiApi } from "@/services/api/aiApi";
import { useAppSelector } from "@/hooks";
import { RootState } from "@/redux/store";
import { MessageCircle, X, Send, User, Loader2 } from "lucide-react";
import { AILogo } from "../assets/logo";

interface Message {
    id: number;
    type: "user" | "bot";
    content: string;
    timestamp: Date;
}

interface AIChatModalProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    isHidden: boolean;
}

const suggestedQuestions = [
    "Có bao nhiêu sản phẩm trong hệ thống?",
    "Cho tôi biết thống kê tổng quan",
    "Đơn hàng gần đây như thế nào?",
    "Có bao nhiêu khách hàng?",
    "Tìm laptop gaming"
];

const AIChatModal = ({ isOpen, onOpen, onClose, isHidden }: AIChatModalProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            type: "bot",
            content:
                "👋 Xin chào! Tôi là trợ lý AI của PC Store. Tôi có thể giúp bạn tra cứu thông tin sản phẩm, đơn hàng và thống kê hệ thống. Hãy hỏi tôi bất cứ điều gì!",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const isLogin = useAppSelector((state: RootState) => state.auth.isLogin);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: messages.length,
            type: "user",
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await aiApi.askQuestion(userMessage.content);

            const botMessage: Message = {
                id: messages.length + 1,
                type: "bot",
                content: response.answer || response.error || "Xin lỗi, tôi không thể xử lý yêu cầu này.",
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error: any) {
            console.error("AI Chat Error:", error);
            let errorContent = "❌ Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.";

            if (error.response?.data?.code === 1003 || error.response?.status === 401) {
                errorContent = "🔐 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (error.response?.data?.message) {
                errorContent = `❌ ${error.response.data.message}`;
            }

            const errorMessage: Message = {
                id: messages.length + 1,
                type: "bot",
                content: errorContent,
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, errorMessage]);

            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể kết nối với AI Assistant"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInputValue(question);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isLogin) return null;
    if (isHidden) return null;

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={onOpen}
                className={`fixed bottom-8 right-2 z-50 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110 ${
                    isOpen ? "hidden" : ""
                }`}
            >
                <MessageCircle className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></span>
            </button>

            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed bottom-8 right-2 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={AILogo}
                                alt="AI Assistant"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                            />
                            <div>
                                <h3 className="font-semibold">PC Store AI</h3>
                                <p className="text-xs text-white/80">Trợ lý thông minh</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-start gap-2 ${
                                    message.type === "user" ? "flex-row-reverse" : ""
                                }`}
                            >
                                {message.type === "user" ? (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600 text-white">
                                        <User className="w-4 h-4" />
                                    </div>
                                ) : (
                                    <img
                                        src={AILogo}
                                        alt="AI"
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                )}
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${
                                        message.type === "user"
                                            ? "bg-blue-600 text-white rounded-br-md"
                                            : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <span
                                        className={`text-xs mt-1 block ${
                                            message.type === "user" ? "text-blue-200" : "text-gray-400"
                                        }`}
                                    >
                                        {message.timestamp.toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-start gap-2">
                                <img
                                    src={AILogo}
                                    alt="AI"
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                        <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Questions */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 bg-white border-t">
                            <p className="text-xs text-gray-500 mb-2">Câu hỏi gợi ý:</p>
                            <div className="flex flex-wrap gap-1">
                                {suggestedQuestions.slice(0, 3).map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestedQuestion(question)}
                                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-t">
                        <div className="flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập câu hỏi của bạn..."
                                className="flex-1 rounded-full border-gray-300 focus:border-blue-500"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 p-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatModal;
