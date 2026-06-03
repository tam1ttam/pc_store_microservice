import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi } from "@/services/api/orderApi";

export const fetchPendingOrders = createAsyncThunk(
  "orderManage/fetchPendingOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderApi.getPendingOrders();
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Lấy danh sách đơn chờ thất bại"
      );
    }
  }
);

export const confirmOrder = createAsyncThunk(
  "orderManage/confirmOrder",
  async (orderId: number, { rejectWithValue }) => {
    try {
      await orderApi.confirmOrder(orderId);
      return { orderId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Xác nhận đơn thất bại"
      );
    }
  }
);
