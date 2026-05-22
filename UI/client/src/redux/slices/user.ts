import { BaseState, User, UserResponse } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getUserInfo } from "../thunks/user";

interface UserState extends BaseState {
    info: User | null;
}

const initialState: UserState = {
    info: null,
    status: "idle",
    error: null
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearUser: (state) => {
            state.info = null;
            state.status = "idle";
            state.error = null;
        },
        updateUserAvatar: (state, action: PayloadAction<string>) => {
            if (state.info) {
                state.info.avatar = action.payload;
            }
        },
        setProfileActive: (state) => {
            if (state.info) {
                state.info.isActive = true;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserInfo.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getUserInfo.fulfilled, (state, action: PayloadAction<UserResponse>) => {
                state.status = "succeeded";
                state.info = action.payload.result;
            })
            .addCase(getUserInfo.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    }
});

export const { clearUser, updateUserAvatar, setProfileActive } = userSlice.actions;
export default userSlice.reducer;
