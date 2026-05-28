import { get, post } from "@/services/api.service";
import ENDPOINT from "@/constants/endpoint";

interface ApiResponse<T> {
    code?: number;
    result: T;
    message?: string;
}

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

export const messageApi = {
    askAi: async (message: string, mode: "chat" | "agent"): Promise<AIResponse> => {
        const res = await post<ApiResponse<AIResponse>>(ENDPOINT.CHAT.AI_CHAT, {
            message,
            mode,
        });
        return res.data.result;
    },

    startStoreChat: async (): Promise<Conversation> => {
        const res = await post<ApiResponse<Conversation>>(ENDPOINT.CHAT.WITH_STORE, {});
        return res.data.result;
    },

    getMyConversations: async (): Promise<Conversation[]> => {
        const res = await get<ApiResponse<Conversation[]>>(ENDPOINT.CHAT.MY_CONVERSATIONS);
        return res.data.result;
    },

    getMessages: async (conversationId: string): Promise<Message[]> => {
        const res = await get<ApiResponse<Message[]>>(ENDPOINT.CHAT.GET_CONVERSATION_MESSAGES(conversationId));
        return res.data.result;
    },

    sendMessage: async (
        conversationId: string,
        message: string,
        attachments?: Attachment[],
    ): Promise<Message> => {
        const res = await post<ApiResponse<Message>>(ENDPOINT.CHAT.CREATE_MESSAGE, {
            conversationId,
            message,
            ...(attachments && attachments.length > 0 ? { attachments } : {}),
        });
        return res.data.result;
    },

    uploadFile: async (file: File): Promise<{ url: string; originalFileName: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await post<ApiResponse<{ url: string; originalFileName: string }>>(
            ENDPOINT.FILE.UPLOAD,
            formData,
        );
        return res.data.result;
    },

    getOnlineManagers: async (): Promise<string[]> => {
        const res = await get<ApiResponse<string[]>>(ENDPOINT.CHAT.MANAGERS_ONLINE);
        return res.data.result;
    },

    createConversation: async (participantIds: string[]): Promise<Conversation> => {
        const res = await post<ApiResponse<Conversation>>(ENDPOINT.CHAT.CREATE_CONVERSATION, { participantIds });
        return res.data.result;
    },
};
