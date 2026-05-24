import { BaseState, LoginResponse, LogoutResponse } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, logout } from "../thunks/auth";

interface AuthState extends BaseState {
    isLogin: boolean;
}

const initialState: AuthState = {
    status: "idle",
    isLogin: false,
    error: null
};

const clearAuthState = (state: AuthState) => {
    state.isLogin = false;
    state.error = null;
    localStorage.removeItem("addressShipping");
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLogin: (state, action: PayloadAction<boolean>) => {
            state.isLogin = action.payload;
            state.status = "succeeded";
        },
        clearAuth: clearAuthState
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(login.fulfilled, (state) => {
                state.status = "succeeded";
                state.isLogin = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
                clearAuthState(state);
            })
            .addCase(logout.fulfilled, (state, action: PayloadAction<LogoutResponse>) => {
                if (action.payload.code === 1000) {
                    state.status = "succeeded";
                    clearAuthState(state);
                }
            });
    }
});

export const { setLogin, clearAuth } = authSlice.actions;
export default authSlice.reducer;
