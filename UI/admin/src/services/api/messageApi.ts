// src/services/api/messageApi.ts

import { get, post } from "@/services/api.service";
import ENDPOINT from "@/constants/endpoint";

interface ApiResponse<T> {
    code?: number;
    result: T;
    message?: string;
}

export interface Conversation {
    id: string;
    participants: any[];
    lastMessage?: string;
    modifiedDate?: string;
    conversationName?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    sender: any;
    message: string;
    createdDate: string;
}

export const messageApi = {
    getMyConversations: async (): Promise<Conversation[]> => {
        const res = await get<ApiResponse<Conversation[]>>(ENDPOINT.CHAT.MY_CONVERSATIONS);
        return res.data.result;
    },

    getMessages: async (conversationId: string): Promise<Message[]> => {
        const res = await get<ApiResponse<Message[]>>(ENDPOINT.CHAT.GET_CONVERSATION_MESSAGES(conversationId));
        return res.data.result;
    },

    createConversation: async (participantIds: string[]): Promise<Conversation> => {
        const res = await post<ApiResponse<Conversation>>(ENDPOINT.CHAT.CREATE_CONVERSATION, { participantIds });
        return res.data.result;
    },

    sendMessage: async (conversationId: string, message: string): Promise<Message> => {
        const res = await post<ApiResponse<Message>>(ENDPOINT.CHAT.CREATE_MESSAGE, { conversationId, message });
        return res.data.result;
    }
};
