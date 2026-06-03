import { createAsyncThunk } from "@reduxjs/toolkit";
import { cartApi } from "@/services/api/cartApi";

export const getCart = createAsyncThunk("cart/getCart", async (_, { rejectWithValue }) => {
    try {
        const response = await cartApi.getCart();
        return (response as any).data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Không thể tải giỏ hàng");
    }
});

export const upsertCartItem = createAsyncThunk(
    "cart/upsertItem",
    async (
        payload: { productId: string; productName: string; productPrice: number; quantity: number; productImage?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await cartApi.upsertItem(
                payload.productId,
                payload.productName,
                payload.productPrice,
                payload.quantity,
                payload.productImage
            );
            return (response as any).data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Thêm vào giỏ hàng thất bại");
        }
    }
);

export const removeCartItem = createAsyncThunk(
    "cart/removeItem",
    async ({ itemId }: { itemId: number }, { rejectWithValue }) => {
        try {
            const response = await cartApi.deleteItem(itemId);
            return (response as any).data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Xóa sản phẩm thất bại");
        }
    }
);

// keep old name as alias so ProtectedRoutes/Cart/etc can migrate gradually
export const getCartCount = getCart;
export const addToCart = upsertCartItem;
export const deleteCartItem = removeCartItem;
