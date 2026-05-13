// src/constants/endpoint.ts

const BASE_URL = import.meta.env.VITE_API_URL;

const IDENTITY = `${BASE_URL}/api-gateway/identity-service`;
const USER_SVC = `${BASE_URL}/api-gateway/user-service`;
const PRODUCT_SVC = `${BASE_URL}/api-gateway/product-service`;
const ORDER_SVC = `${BASE_URL}/api-gateway/order-service`;
const CHAT_SVC = `${BASE_URL}/api-gateway/chat-service`;
const FILE_SVC = `${BASE_URL}/api-gateway/file-service`;

const ENDPOINT = {
    // ── Auth (identity-service) ──────────────────────────────────────────────
    LOGIN: `${IDENTITY}/auth/token`,
    REGISTER: `${IDENTITY}/users/registration`,
    LOGOUT: `${IDENTITY}/auth/logout`,
    REFRESH_TOKEN: `${IDENTITY}/auth/refresh`,
    INTROSPECT: `${IDENTITY}/auth/introspect`,
    MY_INFO: `${IDENTITY}/users/my-info`,

    // Identity-admin base (append e.g. /update-role/{userName})
    ADMIN: `${IDENTITY}/api/admin`,

    // ── User-service ─────────────────────────────────────────────────────────
    CUSTOMERS: `${USER_SVC}/api/customers`,
    USER_INFO: `${USER_SVC}/api/customers/info`,
    USER_PROFILE: `${USER_SVC}/users`,           // /my-profile or /{profileId}
    UPDATE_PROFILE: `${USER_SVC}/users/my-profile`,
    UPDATE_AVATAR: `${USER_SVC}/users/avatar`,
    SEARCH_USERS: `${USER_SVC}/users/search`,
    LIST_CUSTOMER: `${USER_SVC}/api/admin/customers`,

    // ── Product-service ──────────────────────────────────────────────────────
    PRODUCTS: `${PRODUCT_SVC}/products`,
    PRODUCT_DETAIL: `${PRODUCT_SVC}/product-detail`,
    LIST_PRODUCT: `${PRODUCT_SVC}/products`,
    ADD_PRODUCT: `${PRODUCT_SVC}/products/add`,
    UPDATE_PRODUCT: `${PRODUCT_SVC}/products/update`, // append /{productId}
    DELETE_PRODUCT: `${PRODUCT_SVC}/products/delete`, // append /{productId}

    // ── Order-service ────────────────────────────────────────────────────────
    ORDER: `${ORDER_SVC}/api/orders`,
    LIST_ORDER: `${ORDER_SVC}/api/orders`,
    ORDER_STATS: `${ORDER_SVC}/api/orders/stats`,
    UPDATE_PAYMENT_STATUS: `${ORDER_SVC}/api/orders`, // PUT /{orderId}?status=...
    PAYPAL: `${ORDER_SVC}/api/payment/create_payment`,
    PAYMENT_STATUS: `${ORDER_SVC}/api/payment`, // append /{paymentId}

    // ── Admin stats ──────────────────────────────────────────────────────────
    CUSTOMER_COUNT: `${USER_SVC}/api/admin/customers/count`,
    PRODUCT_COUNT: `${PRODUCT_SVC}/products/count`,
    CHAT_ONLINE_USER_IDS: `${BASE_URL}/api-gateway/chat-service/conversations/managers/online`,
    CHAT_MANAGERS: `${BASE_URL}/api-gateway/chat-service/conversations/managers`,

    // ── Chat-service ─────────────────────────────────────────────────────────
    CHAT: {
        MY_CONVERSATIONS: `${CHAT_SVC}/conversations/my-conversations`,
        CREATE_CONVERSATION: `${CHAT_SVC}/conversations/create`,
        CREATE_MESSAGE: `${CHAT_SVC}/messages/create`,
        GET_CONVERSATION_MESSAGES: (conversationId: string) =>
            `${CHAT_SVC}/messages?conversationId=${conversationId}`,
    },

    // ── File-service ─────────────────────────────────────────────────────────
    FILE: {
        UPLOAD: `${FILE_SVC}/media/upload`,
        DOWNLOAD: (fileName: string) => `${FILE_SVC}/media/download/${fileName}`,
    },

    // ── Cart-service (not yet in API spec — paths TBD) ───────────────────────
    CART: {
        CART_COUNT: `${BASE_URL}/api/cart`,
        COUNT: `${BASE_URL}/api/cart/countOfItems`,
        CREATE: (customerId: string) => `${BASE_URL}/api/cart/createCart/${customerId}`,
        ADD: (customerId: string) => `${BASE_URL}/api/cart/${customerId}/addCart`,
        INCREASE: `${BASE_URL}/api/cart/increaseQuantity`,
        DECREASE: `${BASE_URL}/api/cart/decreaseQuantity`,
        DELETE_ITEM: `${BASE_URL}/api/cart/deleteItem`,
        DELETE_ALL: `${BASE_URL}/api/cart/deleteCart`,
        GET_PRODUCT_IDS: (customerId: string) => `${BASE_URL}/api/cart/productIds/${customerId}`,
        GET_ITEMS: (customerId: string) => `${BASE_URL}/api/cart/items/${customerId}`,
    },
};

export const buildProductsUrl = (page: number = 0, size: number = 10) => {
    return `${ENDPOINT.PRODUCTS}?page=${page}&size=${size}`;
};

export const buildProductDetailUrl = (id: string) => {
    return `${ENDPOINT.PRODUCT_DETAIL}/${id}`;
};

export default ENDPOINT;
