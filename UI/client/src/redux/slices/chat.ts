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
    messageType?: "TEXT" | "PRODUCT_CARD";
    productCard?: {
        productId: string;
        name: string;
        price: number;
        image: string;
        slug: string;
    };
    content: string;
    message?: string;
    attachments?: Attachment[];
    createdDate: number;
    me?: boolean;
}

export interface ChatState {
    messages: Record<string, ChatMessage[]>;
    notifications: any[];
    pendingProductCard: {
        productId: string;
        name: string;
        price: number;
        image: string;
        slug: string;
    } | null;
}

const initialState: ChatState = {
    messages: {},
    notifications: [],
    pendingProductCard: null,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        triggerSellerChat: (state, action: PayloadAction<{ product: any }>) => {
            state.pendingProductCard = action.payload.product;
        },
        clearPendingProduct: (state) => {
            state.pendingProductCard = null;
        },
        addMessage: (state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) => {
            const { conversationId, message } = action.payload;
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
            const exists = state.messages[conversationId].some(m => m.id === message.id);
            if (exists) return;
            state.messages[conversationId] = [
                ...state.messages[conversationId],
                message,
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

        addNotification: (state, action: PayloadAction<any>) => {
            state.notifications.push(action.payload);
        },

        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const { addMessage, setMessages, clearMessages, addNotification, clearNotifications, triggerSellerChat, clearPendingProduct } = chatSlice.actions;
export default chatSlice.reducer;
