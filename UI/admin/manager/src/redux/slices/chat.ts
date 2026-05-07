import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
    id: string;
    conversationId: string;
    sender: {
        id: string;
        userName: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        roles?: Array<{ name: string; description?: string }>;
    };
    content: string;
    message?: string;
    createdDate: number;
    me?: boolean;
}

export interface ChatState {
    messages: Record<string, ChatMessage[]>;
    notifications: any[];
}

const initialState: ChatState = {
    messages: {},
    notifications: [],
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
            console.log(`📥 Setting ${messages.length} messages for conversation ${conversationId}`);

            // ✅ Sort và tạo array mới
            state.messages[conversationId] = [...messages].sort((a, b) => a.createdDate - b.createdDate);
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

export const { addMessage, setMessages, clearMessages, addNotification, clearNotifications } = chatSlice.actions;
export default chatSlice.reducer;