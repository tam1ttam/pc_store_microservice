import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi } from "@/services/api/orderApi";

export const viewOrder = createAsyncThunk(
    "order/viewOrder",
    async (_: void, { rejectWithValue }) => {
        try {
            const response = await orderApi.getOrders();
            return (response as any).data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lấy danh sách đơn hàng thất bại");
        }
    }
);
