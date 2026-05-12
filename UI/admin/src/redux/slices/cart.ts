import { BaseState, CartItem } from "@/types";
import { createSlice } from "@reduxjs/toolkit";
import { addToCart, deleteCartItem, getCartCount } from "../thunks/cart";

interface CartState extends BaseState {
    cartCount: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    items: CartItem[];
}

const initialState: CartState = {
    status: "idle",
    error: null,
    cartCount: 0,
    items: []
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCart: (state) => {
            state.cartCount = 0;
            state.status = "idle";
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCartCount.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getCartCount.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.cartCount = action.payload.result.reduce((total: number, item: any) => {
                    return total + item.quantity;
                }, 0);
                state.items = action.payload.result;
            })
            .addCase(getCartCount.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(addToCart.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state) => {
                state.status = "succeeded";
                state.error = null;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(deleteCartItem.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(deleteCartItem.fulfilled, (state) => {
                state.status = "succeeded";
                state.error = null;
            })
            .addCase(deleteCartItem.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
