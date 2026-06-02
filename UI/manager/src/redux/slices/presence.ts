import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PresenceState {
    onlineUserIds: string[];
}

const initialState: PresenceState = {
    onlineUserIds: [],
};

const presenceSlice = createSlice({
    name: "presence",
    initialState,
    reducers: {
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUserIds = action.payload;
        },
        setUserOnline: (state, action: PayloadAction<string>) => {
            if (!state.onlineUserIds.includes(action.payload)) {
                state.onlineUserIds.push(action.payload);
            }
        },
        setUserOffline: (state, action: PayloadAction<string>) => {
            state.onlineUserIds = state.onlineUserIds.filter(id => id !== action.payload);
        },
    },
});

export const { setOnlineUsers, setUserOnline, setUserOffline } = presenceSlice.actions;
export default presenceSlice.reducer;
