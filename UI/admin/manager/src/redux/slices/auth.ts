import { BaseState, CheckTokenValidResponse, LoginResponse, LogoutResponse } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { checkTokenValid, login, logout } from "../thunks/auth";

interface AuthState extends BaseState {
    token: string | null;
    isLogin: boolean;
}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    status: "idle",
    isLogin: false,
    error: null
};

const clearAuthState = (state: AuthState) => {
    state.token = null;
    state.isLogin = false;
    state.error = null;
    localStorage.removeItem("token");
    localStorage.removeItem("addressShipping");
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuth: clearAuthState
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
                state.status = "succeeded";
                state.token = action.payload.result.token;
                state.isLogin = true;
                localStorage.setItem("token", action.payload.result.token);
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
                clearAuthState(state);
            })
            .addCase(checkTokenValid.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(checkTokenValid.fulfilled, (state, action: PayloadAction<CheckTokenValidResponse>) => {
                state.status = "succeeded";
                state.isLogin = action.payload.result.valid;
                if (!action.payload.result.valid) clearAuthState(state);
            })
            .addCase(checkTokenValid.rejected, (state, action) => {
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

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
