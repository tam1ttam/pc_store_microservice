// src/constants/endpoint.ts

const BASE_URL = import.meta.env.VITE_API_URL;

const ENDPOINT = {
    CHAT: {
        MY_CONVERSATIONS: `${BASE_URL}/api/conversations/my-conversations`,
        CREATE_CONVERSATION: `${BASE_URL}/api/conversations/create`,
        CREATE_MESSAGE: `${BASE_URL}/api/messages/create`,
        GET_CONVERSATION_MESSAGES: (conversationId: string) => `${BASE_URL}/api/messages/get/${conversationId}`
    },
    LOGIN: `${BASE_URL}/api/auth/log-in`,
    REGISTER: `${BASE_URL}/api/customers/register`,
    LOGOUT: `${BASE_URL}/api/auth/logout`,
    REFRESH_TOKEN: `${BASE_URL}/api/auth/refresh`,
    INTROSPECT: `${BASE_URL}/api/auth/introspect`,
    PRODUCTS: `${BASE_URL}/api/products`,
    PRODUCT_DETAIL: `${BASE_URL}/api/product-detail`,
    CART: {
        CART_COUNT: `/api/cart`,
        COUNT: `${BASE_URL}/api/cart/countOfItems`,
        CREATE: (customerId: string) => `${BASE_URL}/api/cart/createCart/${customerId}`,
        ADD: (customerId: string) => `${BASE_URL}/api/cart/${customerId}/addCart`,
        INCREASE: `${BASE_URL}/api/cart/increaseQuantity`,
        DECREASE: `${BASE_URL}/api/cart/decreaseQuantity`,
        DELETE_ITEM: `${BASE_URL}/api/cart/deleteItem`,
        DELETE_ALL: `${BASE_URL}/api/cart/deleteCart`,
        GET_PRODUCT_IDS: (customerId: string) => `${BASE_URL}/api/cart/productIds/${customerId}`,
        GET_ITEMS: (customerId: string) => `${BASE_URL}/api/cart/items/${customerId}`
    },
    LIST_ORDER: `/api/admin/list-orders`,
    ADMIN: `/api/admin`,
    UPDATE_PAYMENT_STATUS: `/api/admin/update-payment-status`,
    LIST_PRODUCT: `/api/products`,
    ADD_PRODUCT: `/api/admin/add-product`,
    UPDATE_PRODUCT: `/api/admin/update-product`,
    DELETE_PRODUCT: `/api/admin/delete-product`,
    UPDATE_PRODUCT_DETAIL: `/api/admin/update-product-detail`,
    USER_INFO: `/api/customers/info`,
    ORDER: `/api/orders`,
    PAYPAL: `/api/payment/create_payment`,
    PAYMENT_STATUS: `/api/payment`
};

export const buildProductsUrl = (page: number = 0, size: number = 10) => {
    return `${ENDPOINT.PRODUCTS}?page=${page}&size=${size}`;
};

export const buildProductDetailUrl = (id: string) => {
    return `${ENDPOINT.PRODUCT_DETAIL}/${id}`;
};

export default ENDPOINT;
