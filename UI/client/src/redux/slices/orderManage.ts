import { Order } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { viewOrder } from "../thunks/order";
import { confirmOrder, fetchPendingOrders } from "../thunks/orderManage";

interface OrderManageState {
  pendingOrders: Order[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: OrderManageState = {
  pendingOrders: [],
  status: "idle",
  error: null,
};

const orderManageSlice = createSlice({
  name: "orderManage",
  initialState,
  reducers: {
    clearPendingOrders(state) {
      state.pendingOrders = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPendingOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        const list = (action.payload as any)?.result ?? action.payload ?? [];
        state.pendingOrders = list.map((o: any) => ({
          ...o,
          orderDate: o.orderDate
            ? new Date(o.orderDate).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        }));
      })
      .addCase(fetchPendingOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(confirmOrder.fulfilled, (state, action) => {
        const confirmedId = (action.meta.arg as any)?.orderId;
        if (confirmedId != null) {
          state.pendingOrders = state.pendingOrders.filter(
            (o) => o.id !== confirmedId
          );
        }
      });
  },
});

export const { clearPendingOrders } = orderManageSlice.actions;
export default orderManageSlice.reducer;
