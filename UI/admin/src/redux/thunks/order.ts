import { OrderResponse } from "@/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi } from "@/services/api/orderApi";

export const viewOrder = createAsyncThunk(
    "order/viewOrder",
    async ({ userId }: { userId: string }, { rejectWithValue }) => {
        try {
            const response = await orderApi.getOrders(userId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lấy danh sách đơn hàng thất bại");
        }
    }
);
