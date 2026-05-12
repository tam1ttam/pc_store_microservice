import { UserResponse } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { z } from "zod";
import { userApi } from "@/services/api/userApi";

export const getUserInfo = createAsyncThunk(
    "user/getUserInfo",
    async ({ token }: { token: string }, { rejectWithValue }) => {
        try {
            const response = await userApi.getUserInfo(token);
            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return rejectWithValue(error.errors);
            }
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateUserInfo = createAsyncThunk(
    "user/updateUserInfo",
    async (
        {
            userName,
            data
        }: {
            userName: string;
            data: {
                firstName: string;
                lastName: string;
                email: string;
                phoneNumber: string;
            };
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await userApi.updateUserInfo(userName, data);
            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return rejectWithValue(error.errors);
            }
            return rejectWithValue((error as Error).message);
        }
    }
);
