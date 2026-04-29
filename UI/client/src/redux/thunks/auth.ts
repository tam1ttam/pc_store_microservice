import {
    CheckTokenValidResponse,
    LoginCredentials,
    LoginResponse,
    LogoutResponse,
    RegisterCredentials,
    RegisterResponse
} from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { z } from "zod";
import { authApi } from "@/services/api/authApi";

export const login = createAsyncThunk("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
        const response = await authApi.login(credentials);
        if (!response.data?.result?.token) {
            throw new Error("Token không hợp lệ");
        }
        return response.data;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return rejectWithValue(error.errors);
        }
        return rejectWithValue((error as Error).message);
    }
});

export const register = createAsyncThunk(
    "auth/register",
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            const response = await authApi.register(credentials);
            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return rejectWithValue(error.errors);
            }
            return rejectWithValue((error as Error).message);
        }
    }
);

export const checkTokenValid = createAsyncThunk("auth/checkTokenValid", async (token: string, { rejectWithValue }) => {
    try {
        const response = await authApi.checkTokenValid(token);

        if (!response.data?.result?.valid) {
            throw new Error("Token không hợp lệ");
        }

        return response.data;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return rejectWithValue(error.errors);
        }
        return rejectWithValue((error as Error).message);
    }
});

export const logout = createAsyncThunk("auth/logout", async (token: string, { rejectWithValue }) => {
    try {
        const response = await authApi.logout(token);
        return response.data;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return rejectWithValue(error.errors);
        }
        return rejectWithValue((error as Error).message);
    }
});
