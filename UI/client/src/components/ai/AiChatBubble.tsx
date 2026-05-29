import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { messageApi } from '@/services/api/messageApi';
import { aiApi } from '@/services/api/aiApi';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiChatBus, AI_EVENTS } from '@/utils/aiChatBus';
import { ProductCardBubble } from '@/components/chat/ProductCardBubble';
import { RootState } from '@/redux/store';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  messageType?: 'TEXT' | 'PRODUCT_CARD';
  productCard?: {
    productId: string;
    name: string;
    price: number;
    image: string;
    slug: string;
  };
}

export const AiChatBubble = () => {
  const { info: user } = useSelector((state: RootState) => state.user);
  const userId = user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'agent'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 1. Handle AI Chat Events from Product Cards
  useEffect(() => {
    const handleOpenAndSend = (data: { message: string; mode?: string }) => {
      setIsOpen(true);
      if (data.mode) setMode(data.mode as 'chat' | 'agent');

      const userMsg: Message = { role: 'user', text: data.message, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);

      sendAiMessage(data.message, data.mode || 'chat');
    };

    const handleOpenAndSendProduct = (data: { product: any; message: string }) => {
      setIsOpen(true);
      const userMsg: Message = {
        role: 'user',
        text: data.message,
        timestamp: new Date(),
        messageType: 'PRODUCT_CARD',
        productCard: data.product
      };
      setMessages(prev => [...prev, userMsg]);
      sendAiMessage(data.message, 'agent');
    };

    aiChatBus.on(AI_EVENTS.OPEN_AND_SEND, handleOpenAndSend);
    aiChatBus.on(AI_EVENTS.OPEN_AND_SEND_PRODUCT, handleOpenAndSendProduct);
    return () => {
      aiChatBus.off(AI_EVENTS.OPEN_AND_SEND, handleOpenAndSend);
      aiChatBus.off(AI_EVENTS.OPEN_AND_SEND_PRODUCT, handleOpenAndSendProduct);
    };
  }, []);

  // 2. Load AI History when opening
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await aiApi.getHistory();
        if (history && history.length > 0) {
          const mappedHistory = history.map((msg: any) => ({
            role: msg.senderUserId === userId ? 'user' : 'ai',
            text: msg.message,
            timestamp: new Date(msg.createdDate),
            messageType: msg.messageType,
            productCard: msg.productCard
          })).reverse();
          setMessages(mappedHistory);
        }
      } catch (error) {
        console.error('Failed to fetch AI history:', error);
      }
    };

    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, userId]);

  const sendAiMessage = async (text: string, currentMode: string) => {
    if (!text || text.trim() === '') return;

    setIsLoading(true);
    try {
      const res = await messageApi.askAi(text, currentMode as 'chat' | 'agent');
      if (res.success) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: res.response,
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `❌ Lỗi: ${res.error || 'Không thể kết nối AI'}`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "❌ Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    await sendAiMessage(input, mode);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-2 bg-gray-50 border-b flex gap-2">
            <button
              onClick={() => setMode('chat')}
              className={cn(
                "flex-1 py-1 px-2 text-xs rounded-full transition-all",
                mode === 'chat' ? "bg-indigo-100 text-indigo-700 border border-indigo-300 font-medium" : "bg-white text-gray-500 border border-gray-200"
              )}
            >
              💬 Trợ lý chung
            </button>
            <button
              onClick={() => setMode('agent')}
              className={cn(
                "flex-1 py-1 px-2 text-xs rounded-full transition-all",
                mode === 'agent' ? "bg-indigo-600 text-white font-medium" : "bg-white text-gray-500 border border-gray-200"
              )}
            >
              <Sparkles size={12} className="inline mr-1" /> Agent Bán hàng
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 text-sm mt-10 space-y-2">
                <Bot size={32} className="mx-auto mb-2 opacity-20" />
                <p>Chào bạn! Tôi có thể giúp gì cho bạn?</p>
                <p className="text-xs italic">Mode hiện tại: {mode === 'agent' ? 'Tư vấn bán hàng' : 'Hỗ trợ chung'}</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                  msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                )}>
                  {msg.messageType === 'PRODUCT_CARD' && msg.productCard && (
                    <ProductCardBubble product={msg.productCard} isMe={msg.role === 'user'} />
                  )}
                  <div className="flex items-center gap-1 mb-1 opacity-70 text-[10px] uppercase font-bold">
                    {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                    {msg.role === 'user' ? 'Bạn' : 'AI Assistant'}
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className="text-right text-[9px] opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi..."
              className="flex-1 p-2 text-sm border rounded-full outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors disabled:bg-gray-300"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>
    </div>
  );
};
