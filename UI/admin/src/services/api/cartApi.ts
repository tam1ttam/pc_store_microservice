import { ENDPOINTS } from "@/constants";
import ENDPOINT from "@/constants/endpoint";
import { del, get, post } from "../api.service";

export const cartApi = {
    getCartCount: (userId: string) => {
        return get(`${ENDPOINTS.CART.CART_COUNT}/items/${userId}`);
    },

    addToCart: (userId: string, productId: string, quantity: number = 1) => {
        return post(`${ENDPOINTS.CART.ADD(userId)}?productId=${productId}&quantity=${quantity}`, {});
    },

    deleteCartItem: (customerId: string, productId: string) => {
        return del(`${ENDPOINTS.CART.DELETE_ITEM}?customerId=${customerId}&productId=${productId}`, {});
    },

    deleteAllCart: (customerId: string, headers?: any) => {
        return del(ENDPOINT.CART.DELETE_ALL, { customerId }, headers);
    },

    decreaseQuantity: (customerId: string, productId: string) => {
        return post(`${ENDPOINTS.CART.DECREASE}?customerId=${customerId}&productId=${productId}`, {});
    },

    increaseQuantity: (customerId: string, productId: string) => {
        return post(`${ENDPOINTS.CART.INCREASE}?customerId=${customerId}&productId=${productId}`, {});
    }
};
