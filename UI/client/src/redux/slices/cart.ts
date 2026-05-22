import { CartItem } from "@/types/Cart";
import { createSlice } from "@reduxjs/toolkit";
import { getCart, removeCartItem, upsertCartItem } from "../thunks/cart";

interface CartState {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    items: CartItem[];
    cartCount: number;
}

const initialState: CartState = {
    status: "idle",
    error: null,
    items: [],
    cartCount: 0,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCart: (state) => {
            state.items = [];
            state.cartCount = 0;
            state.status = "idle";
            state.error = null;
        },
        optimisticAddToCart: (state, action: { payload: { quantity: number } }) => {
            state.cartCount += action.payload.quantity;
        },
        optimisticRollbackAdd: (state, action: { payload: { quantity: number } }) => {
            state.cartCount = Math.max(0, state.cartCount - action.payload.quantity);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCart.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getCart.fulfilled, (state, action) => {
                state.status = "succeeded";
                const cart = action.payload?.result;
                state.items = cart?.items ?? [];
                state.cartCount = cart?.totalItems ?? 0;
            })
            .addCase(getCart.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(upsertCartItem.fulfilled, (state, action) => {
                const cart = action.payload?.result;
                if (cart) {
                    state.items = cart.items ?? [];
                    state.cartCount = cart.totalItems ?? 0;
                }
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                const cart = action.payload?.result;
                if (cart) {
                    state.items = cart.items ?? [];
                    state.cartCount = cart.totalItems ?? 0;
                }
            });
    },
});

export const { clearCart, optimisticAddToCart, optimisticRollbackAdd } = cartSlice.actions;
export default cartSlice.reducer;
