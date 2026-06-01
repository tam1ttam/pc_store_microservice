import { get, post } from "@/services/api.service";
import ENDPOINT from "@/constants/endpoint";

export interface Attachment {
  url: string;
  originalFileName: string;
  fileType: string; // "image" | "video" | "audio" | "document"
}

export interface Conversation {
  id: string;
  type?: string;
  participants: any[];
  clientId?: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  modifiedDate?: string;
  conversationName?: string;
  conversationAvatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: any;
  messageType?: "TEXT" | "PRODUCT_CARD";
  productCard?: {
    productId: string;
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  message: string;
  attachments?: Attachment[];
  createdDate: string;
  me?: boolean;
}

export interface AIResponse {
  success: boolean;
  response: string;
  model: string;
  usage?: any;
  error?: string;
}

export interface AIHistoryItem {
  conversationId: string;
  senderUserId: string;
  message: string;
  messageType?: string;
  createdDate?: string;
}

export const messageApi = {
  askAi: async (
    message: string,
    productCard?: Message["productCard"],
    attachments?: Attachment[],
  ): Promise<AIResponse> => {
    const payload: Record<string, any> = { message };
    if (productCard) {
      payload.productCard = productCard;
      payload.messageType = "PRODUCT_CARD";
    }
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments;
    }
    const res = await post<AIResponse>(ENDPOINT.AI.CHAT, payload);
    return res.data;
  },

  getAiHistory: async (): Promise<AIHistoryItem[]> => {
    const res = await get<{ content: AIHistoryItem[]; totalElements: number }>(ENDPOINT.AI.HISTORY);
    return res.data.content;
  },

  startStoreChat: async (): Promise<Conversation> => {
    const res = await post<{ result: Conversation }>(ENDPOINT.CHAT.WITH_STORE, {});
    return res.data.result;
  },

  getMyConversations: async (): Promise<Conversation[]> => {
    const res = await get<{ result: Conversation[] }>(ENDPOINT.CHAT.MY_CONVERSATIONS);
    return res.data.result;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const res = await get<{ result: Message[] }>(ENDPOINT.CHAT.GET_CONVERSATION_MESSAGES(conversationId));
    return res.data.result;
  },

  sendMessage: async (
    conversationId: string,
    message: string,
    attachments?: Attachment[],
    messageType: "TEXT" | "PRODUCT_CARD" = "TEXT",
    productCard?: Message["productCard"],
  ): Promise<Message> => {
    const res = await post<{ result: Message }>(ENDPOINT.CHAT.CREATE_MESSAGE, {
      conversationId,
      message,
      messageType,
      productCard,
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
    });
    return res.data.result;
  },

  uploadFile: async (file: File): Promise<{ url: string; originalFileName: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await post<{ result: { url: string; originalFileName: string } }>(
      ENDPOINT.FILE.UPLOAD,
      formData,
    );
    return res.data.result;
  },

  getOnlineManagers: async (): Promise<string[]> => {
    const res = await get<{ result: string[] }>(ENDPOINT.CHAT.MANAGERS_ONLINE);
    return res.data.result;
  },

  createConversation: async (participantIds: string[]): Promise<Conversation> => {
    const res = await post<{ result: Conversation }>(ENDPOINT.CHAT.CREATE_CONVERSATION, { participantIds });
    return res.data.result;
  },
};
