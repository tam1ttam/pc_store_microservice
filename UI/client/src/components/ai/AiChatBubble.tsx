import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { messageApi } from '@/services/api/messageApi';
import { aiApi } from '@/services/api/aiApi';
import { X, Send, Bot, User, ShoppingCart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiChatBus, AI_EVENTS } from '@/utils/aiChatBus';
import { ProductCardBubble } from '@/components/chat/ProductCardBubble';
import { RootState } from '@/redux/store';
import { upsertCartItem } from '@/redux/thunks/cart';
import { useToast } from '@/hooks/use-toast';

interface AiMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  messageType?: 'TEXT' | 'PRODUCT_CARD';
  productCard?: { productId: string; name: string; price: number; image: string; slug: string };
}

export const AiChatBubble = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { info: user } = useSelector((state: RootState) => state.user);
  const userId = user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<AiMessage['productCard'] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleOpenAndSend = (data: { message: string; mode?: string }) => {
      setIsOpen(true);
      const userMsg: AiMessage = { role: 'user', text: data.message, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      sendAiMessage(data.message);
    };

    const handleOpenAndSendProduct = (data: { product: any; message: string }) => {
      setIsOpen(true);
      const userMsg: AiMessage = {
        role: 'user',
        text: data.message,
        timestamp: new Date(),
        messageType: 'PRODUCT_CARD',
        productCard: data.product,
      };
      setPendingProduct(data.product);
      setMessages(prev => [...prev, userMsg]);
      sendAiMessage(data.message, data.product);
    };

    aiChatBus.on(AI_EVENTS.OPEN_AND_SEND, handleOpenAndSend);
    aiChatBus.on(AI_EVENTS.OPEN_AND_SEND_PRODUCT, handleOpenAndSendProduct);
    return () => {
      aiChatBus.off(AI_EVENTS.OPEN_AND_SEND, handleOpenAndSend);
      aiChatBus.off(AI_EVENTS.OPEN_AND_SEND_PRODUCT, handleOpenAndSendProduct);
    };
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await aiApi.getHistory();
        if (history && history.length > 0) {
          const mappedHistory = history.map((msg: any) => ({
            role: msg.me ? 'user' : 'ai' as 'user' | 'ai',
            text: msg.message,
            timestamp: new Date(msg.createdDate),
            messageType: msg.messageType,
            productCard: msg.productCard,
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
  }, [isOpen]);

  const sendAiMessage = async (text: string, productCard?: AiMessage['productCard']) => {
    if (!text?.trim() && !productCard) return;

    setIsLoading(true);
    try {
      const res = await aiApi.askQuestion(text || '', userId);
      if (res.success) {
        const aiMsg: AiMessage = { role: 'ai', text: res.response, timestamp: new Date() };
        if (productCard) {
          aiMsg.messageType = 'PRODUCT_CARD';
          aiMsg.productCard = productCard;
        }
        setMessages(prev => [...prev, aiMsg]);
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `❌ Lỗi: ${res.error || 'Không thể kết nối AI'}`,
          timestamp: new Date(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '❌ Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: AiMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const text = input;
    setInput('');
    await sendAiMessage(text);
  };

  const handleAddToCart = async (product: AiMessage['productCard']) => {
    if (!product) return;
    try {
      await dispatch(upsertCartItem({
        productId: product.productId,
        productName: product.name,
        productPrice: product.price,
        quantity: 1,
        productImage: product.image,
      }) as any);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Đã thêm "${product.name}" vào giỏ hàng!`,
        timestamp: new Date(),
      }]);
      setPendingProduct(null);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '❌ Thêm vào giỏ thất bại, vui lòng thử lại.',
        timestamp: new Date(),
      }]);
    }
  };

  const handleBuyNow = (product: AiMessage['productCard']) => {
    if (!product) return;
    navigate(`/checkout?productId=${product.productId}&quantity=1`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">AI Assistant</span>
              <span className="text-[10px] bg-indigo-500 px-2 py-0.5 rounded-full ml-1">BETA</span>
            </div>
            <button
              onClick={() => { setIsOpen(false); setPendingProduct(null); }}
              className="hover:bg-indigo-500 p-1 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 text-sm mt-10 space-y-3">
                <Bot size={40} className="mx-auto mb-2 opacity-20" />
                <p>Chào bạn! Tôi là trợ lý AI của PC Store.</p>
                <p className="text-xs">Tôi có thể giúp bạn tìm sản phẩm, tư vấn, thêm vào giỏ hàng và đặt hàng.</p>
                <p className="text-xs italic opacity-70">Nhắn tin hoặc gửi sản phẩm từ danh sách cho tôi nhé!</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] p-3 rounded-2xl text-sm shadow-sm',
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none',
                  )}
                >
                  {msg.messageType === 'PRODUCT_CARD' && msg.productCard && (
                    <div>
                      <ProductCardBubble product={msg.productCard} isMe={msg.role === 'user'} />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(msg.productCard)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors text-[11px] font-medium"
                        >
                          <ShoppingCart size={12} />
                          Thêm vào giỏ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBuyNow(msg.productCard)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-[11px] font-medium"
                        >
                          Mua ngay
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.text && (
                    <>
                      <div className="flex items-center gap-1 mb-1 opacity-70 text-[10px] uppercase font-bold">
                        {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                        {msg.role === 'user' ? 'Bạn' : 'AI Assistant'}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </>
                  )}

                  <div className="text-right text-[9px] opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              type="button"
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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>
    </div>
  );
};
