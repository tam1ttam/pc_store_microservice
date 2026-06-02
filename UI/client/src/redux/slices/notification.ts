import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationItem {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    isRead: boolean;
    isSystem: boolean;
    actionRequired: boolean;
    actionDone: boolean;
    referenceId?: string;
    referenceType?: string;
    createdAt: string | number[];
}

interface NotificationState {
    items: NotificationItem[];
    unreadCount: number;
    status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
    status: "idle",
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
            state.items = action.payload;
            state.status = "succeeded";
        },
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },
        markOneRead: (state, action: PayloadAction<string>) => {
            const item = state.items.find((n) => n.id === action.payload);
            if (item && !item.isRead) {
                item.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllRead: (state) => {
            state.items.forEach((n) => {
                n.isRead = true;
            });
            state.unreadCount = 0;
        },
        markActionDoneLocal: (state, action: PayloadAction<string>) => {
            const item = state.items.find((n) => n.id === action.payload);
            if (item) {
                item.actionDone = true;
                if (!item.isRead) {
                    item.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            }
        },
        setStatus: (state, action: PayloadAction<NotificationState["status"]>) => {
            state.status = action.payload;
        },
    },
});

export const { setNotifications, setUnreadCount, markOneRead, markAllRead, markActionDoneLocal, setStatus } =
    notificationSlice.actions;
export default notificationSlice.reducer;
