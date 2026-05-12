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

export interface ManagerInfo {
    id: string;
    username: string;
}

export const messageApi = {
    getMyConversations: async (): Promise<Conversation[]> => {
        const res = await get<ApiResponse<Conversation[]>>(ENDPOINT.CHAT.MY_CONVERSATIONS);
        return res.data.result;
    },

    getAllSupportConversations: async (): Promise<Conversation[]> => {
        const res = await get<ApiResponse<Conversation[]>>(ENDPOINT.CHAT.SUPPORT_ALL);
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

    createDirectConversation: async (participantId: string): Promise<Conversation> => {
        const res = await post<ApiResponse<Conversation>>(ENDPOINT.CHAT.CREATE_CONVERSATION, {
            participantIds: [participantId],
            type: "DIRECT",
        });
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

    getManagerList: async (): Promise<ManagerInfo[]> => {
        const res = await get<ApiResponse<ManagerInfo[]>>(ENDPOINT.CHAT.MANAGERS);
        return res.data.result;
    },

    getOnlineManagers: async (): Promise<string[]> => {
        const res = await get<ApiResponse<string[]>>(ENDPOINT.CHAT.MANAGERS_ONLINE);
        return res.data.result;
    },

    isUserOnline: async (userId: string): Promise<boolean> => {
        const res = await get<ApiResponse<boolean>>(ENDPOINT.CHAT.USER_ONLINE(userId));
        return res.data.result;
    },

    claimConversation: async (conversationId: string): Promise<Conversation> => {
        const res = await post<ApiResponse<Conversation>>(ENDPOINT.CHAT.CLAIM(conversationId), {});
        return res.data.result;
    },

    transferConversation: async (conversationId: string, toManagerId: string): Promise<Conversation> => {
        const res = await post<ApiResponse<Conversation>>(ENDPOINT.CHAT.TRANSFER(conversationId), { toManagerId });
        return res.data.result;
    },
};
