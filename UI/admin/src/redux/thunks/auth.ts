import { LoginCredentials, LoginResponse, LogoutResponse, RegisterCredentials } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { z } from "zod";
import { authApi } from "@/services/api/authApi";
import { setAccessToken } from "@/config/axios.config";

export const login = createAsyncThunk("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
        const response = await authApi.login(credentials);
        const token = response.data?.result?.token;
        if (!token) {
            throw new Error("Token không hợp lệ");
        }
        setAccessToken(token);
        return response.data;
    } catch (error: any) {
        return rejectWithValue({
            message: error?.response?.data?.message || error?.message || "Đăng nhập thất bại"
        });
    }
});

export const register = createAsyncThunk(
    "auth/register",
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            const response = await authApi.register(credentials);
            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) return rejectWithValue(error.errors);
            return rejectWithValue((error as Error).message);
        }
    }
);

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        setAccessToken(null);
        const response = await authApi.logout();
        return response.data;
    } catch (error) {
        if (error instanceof z.ZodError) return rejectWithValue(error.errors);
        return rejectWithValue((error as Error).message);
    }
});
