import { BaseState, Order, OrderResponse } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { viewOrder } from "../thunks/order";

interface OrderState extends BaseState {
    orders: Order[];
}

const initialState: OrderState = {
    orders: [],
    error: null,
    status: "idle"
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(viewOrder.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(viewOrder.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
                state.status = "succeeded";
                state.orders = action.payload.result
                    .map((order) => ({
                        ...order,
                        orderDate: new Date(String(order.orderDate).replace("ICT", "+0700")).toLocaleString("vi-VN", {
                            timeZone: "Asia/Ho_Chi_Minh",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                    }))
                    .reverse();
            })
            .addCase(viewOrder.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    }
});

// export const { clearOrder } = orderSlice.actions
export default orderSlice.reducer;
