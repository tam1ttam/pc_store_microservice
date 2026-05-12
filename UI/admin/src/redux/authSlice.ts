import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    token: localStorage.getItem("admin_token"),
    isAuthenticated: !!localStorage.getItem("admin_token"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem("admin_token", action.payload);
        },
        clearToken: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("admin_token");
        },
    },
});

export const { setToken, clearToken } = authSlice.actions;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export default authSlice.reducer;
