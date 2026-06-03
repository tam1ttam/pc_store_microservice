import ENDPOINT from "@/constants/endpoint";
import { del, get, put } from "../api.service";

export const cartApi = {
    getCart: () => get(ENDPOINT.CART.GET),

    upsertItem: (productId: string, productName: string, productPrice: number, quantity: number, productImage?: string) =>
        put(ENDPOINT.CART.UPDATE_ITEM, { productId, productName, productPrice, quantity, productImage }),

    deleteItem: (itemId: number) => del(ENDPOINT.CART.DELETE_ITEM(itemId)),

    clearCart: () => del(ENDPOINT.CART.CLEAR),
};
