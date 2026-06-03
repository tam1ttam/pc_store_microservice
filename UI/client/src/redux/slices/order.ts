import { Order } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { viewOrder } from "../thunks/order";

interface OrderState {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    orders: Order[];
}

const initialState: OrderState = {
    orders: [],
    error: null,
    status: "idle",
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
            .addCase(viewOrder.fulfilled, (state, action) => {
                state.status = "succeeded";
                const result = action.payload?.result ?? [];
                state.orders = [...result].reverse().map((o: any) => ({
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
            .addCase(viewOrder.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export default orderSlice.reducer;
