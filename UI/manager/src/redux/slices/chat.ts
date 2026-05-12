import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Attachment {
    url: string;
    originalFileName: string;
    fileType: string; // "image" | "video" | "audio" | "document"
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    sender: {
        userId?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    content: string;
    message?: string;
    attachments?: Attachment[];
    createdDate: number;
    me?: boolean;
}

export interface SupportConversation {
    id: string;
    type?: string;
    clientId?: string;
    assignedManagerId?: string;
    assignedManagerName?: string;
    conversationName?: string;
    conversationAvatar?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    participants?: any[];
    modifiedDate?: string;
}

export interface ChatState {
    messages: Record<string, ChatMessage[]>;
    conversations: SupportConversation[];
    notifications: any[];
    unreadConversationIds: string[];
}

const initialState: ChatState = {
    messages: {},
    conversations: [],
    notifications: [],
    unreadConversationIds: [],
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) => {
            const { conversationId, message } = action.payload;

            // ✅ Khởi tạo array nếu chưa có
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }

            // ✅ Kiểm tra duplicate
            const exists = state.messages[conversationId].some(m => m.id === message.id);
            if (exists) {
                console.log('⚠️ Message already exists, skipping:', message.id);
                return;
            }

            console.log('✅ Adding message to Redux:', message);

            // ✅ Tạo mảng mới thay vì mutate (force re-render)
            state.messages[conversationId] = [
                ...state.messages[conversationId],
                message
            ].sort((a, b) => a.createdDate - b.createdDate);
        },

        setMessages: (state, action: PayloadAction<{ conversationId: string; messages: ChatMessage[] }>) => {
            const { conversationId, messages } = action.payload;
            const existing = state.messages[conversationId] || [];
            const existingIds = new Set(existing.map(m => m.id));
            const merged = [
                ...existing,
                ...messages.filter(m => !existingIds.has(m.id)),
            ].sort((a, b) => a.createdDate - b.createdDate);
            state.messages[conversationId] = merged;
        },

        clearMessages: (state, action: PayloadAction<string>) => {
            delete state.messages[action.payload];
        },

        setConversations: (state, action: PayloadAction<SupportConversation[]>) => {
            state.conversations = action.payload;
        },

        updateConversation: (state, action: PayloadAction<SupportConversation>) => {
            const idx = state.conversations.findIndex(c => c.id === action.payload.id);
            if (idx >= 0) {
                state.conversations[idx] = action.payload;
            } else {
                state.conversations.push(action.payload);
            }
        },

        addNotification: (state, action: PayloadAction<any>) => {
            state.notifications.push(action.payload);
        },

        clearNotifications: (state) => {
            state.notifications = [];
        },

        addUnread: (state, action: PayloadAction<string>) => {
            if (!state.unreadConversationIds.includes(action.payload)) {
                state.unreadConversationIds.push(action.payload);
            }
        },

        clearUnread: (state, action: PayloadAction<string>) => {
            state.unreadConversationIds = state.unreadConversationIds.filter(id => id !== action.payload);
        },
    },
});

export const { addMessage, setMessages, clearMessages, setConversations, updateConversation, addNotification, clearNotifications, addUnread, clearUnread } = chatSlice.actions;
export default chatSlice.reducer;