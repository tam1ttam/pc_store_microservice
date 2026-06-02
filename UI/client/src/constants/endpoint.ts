// src/constants/endpoint.ts

const BASE_URL  = import.meta.env.VITE_API_URL;
const CART_URL  = import.meta.env.VITE_CART_URL ?? BASE_URL;

const IDENTITY    = `${BASE_URL}/api-gateway/identity-service`;
const USER_SVC    = `${BASE_URL}/api-gateway/user-service`;
const PRODUCT_SVC = `${BASE_URL}/api-gateway/product-service`;
const ORDER_SVC   = `${BASE_URL}/api-gateway/order-service`;
const CHAT_SVC    = `${BASE_URL}/api-gateway/chat-service`;
const FILE_SVC    = `${BASE_URL}/api-gateway/file-service`;
const NOTIF_SVC   = `${BASE_URL}/api-gateway/notification-service`;

const ENDPOINT = {
    // ── Auth (identity-service / client portal) ──────────────────────────────
    LOGIN:         `${IDENTITY}/client/auth/token`,
    REGISTER:      `${IDENTITY}/users/registration`,
    LOGOUT:        `${IDENTITY}/client/auth/logout`,
    REFRESH_TOKEN: `${IDENTITY}/client/auth/refresh`,
    INTROSPECT:    `${IDENTITY}/client/auth/introspect`,
    MY_INFO:       `${IDENTITY}/users/my-info`,

    // Identity-admin base (append e.g. /update-role/{userName})
    ADMIN: `${IDENTITY}/api/admin`,

    // ── User-service ─────────────────────────────────────────────────────────
    USER_INFO:      `${USER_SVC}/api/customers/info`,
    USER_PROFILE:   `${USER_SVC}/users`,           // /my-profile or /{profileId}
    UPDATE_PROFILE: `${USER_SVC}/users/my-profile`,
    UPDATE_AVATAR:      `${USER_SVC}/api/customers/avatar`,
    COMPLETE_PROFILE:   `${USER_SVC}/api/customers/complete-profile`,
    SEARCH_USERS:   `${USER_SVC}/users/search`,
    LIST_CUSTOMER:  `${USER_SVC}/api/admin/customers`,

    // ── Product-service ──────────────────────────────────────────────────────
    PRODUCTS:          `${PRODUCT_SVC}/products`,
    CATEGORIES:          `${PRODUCT_SVC}/categories`,
    PRODUCTS_CATEGORY: `${PRODUCT_SVC}/products/category`,
    PRODUCTS_BY_CATEGORIES: `${PRODUCT_SVC}/products/by-categories`,
    PRODUCT_DETAIL:    `${PRODUCT_SVC}/product-detail`,
    LIST_PRODUCT:      `${PRODUCT_SVC}/products`,
    ADD_PRODUCT:       `${PRODUCT_SVC}/products/add`,
    UPDATE_PRODUCT:    `${PRODUCT_SVC}/products/update`, // append /{productId}
    DELETE_PRODUCT:    `${PRODUCT_SVC}/products/delete`, // append /{productId}

    // ── Order-service ────────────────────────────────────────────────────────
    ORDER:                `${ORDER_SVC}/api/orders`,
    ORDER_STATUS:        (id: number) => `${ORDER_SVC}/api/orders/${id}`,
    ORDER_CANCEL:         (id: number) => `${ORDER_SVC}/api/orders/${id}/cancel`,
    PAYMENT_STATUS:       `${ORDER_SVC}/api/payment`, // append /{paymentId}

    // ── Chat-service ─────────────────────────────────────────────────────────
    CHAT: {
        MY_CONVERSATIONS: `${CHAT_SVC}/conversations/my-conversations`,
        CREATE_CONVERSATION: `${CHAT_SVC}/conversations/create`,
        WITH_STORE: `${CHAT_SVC}/conversations/with-store`,
        CREATE_MESSAGE: `${CHAT_SVC}/messages/create`,
        GET_CONVERSATION_MESSAGES: (conversationId: string) =>
            `${CHAT_SVC}/messages?conversationId=${conversationId}`,
        MANAGERS_ONLINE: `${CHAT_SVC}/conversations/managers/online`,
        USER_ONLINE: (userId: string) => `${CHAT_SVC}/conversations/users/${userId}/online`,
        AI_CHAT: `${CHAT_SVC}/ai/ask`,
        AI_HISTORY: `${CHAT_SVC}/ai/history`,
    },

    // ── Notification-service ─────────────────────────────────────────────────
    NOTIFICATION: {
        LIST: `${NOTIF_SVC}/api/notifications`,
        COUNT: `${NOTIF_SVC}/api/notifications/count`,
        MARK_READ: (id: string) => `${NOTIF_SVC}/api/notifications/${id}/read`,
        MARK_ALL_READ: `${NOTIF_SVC}/api/notifications/read-all`,
        MARK_ACTION_DONE: (id: string) => `${NOTIF_SVC}/api/notifications/${id}/action-done`,
    },

    // ── File-service ─────────────────────────────────────────────────────────
    FILE: {
        UPLOAD: `${FILE_SVC}/media/upload`,
        DOWNLOAD: (fileName: string) => `${FILE_SVC}/media/download/${fileName}`,
    },

    // ── Cart (order-service) ─────────────────────────────────────────────────
    CART: {
        GET:         `${ORDER_SVC}/cart`,
        UPDATE_ITEM: `${ORDER_SVC}/cart/items`,
        DELETE_ITEM: (itemId: number) => `${ORDER_SVC}/cart/items/${itemId}`,
        CLEAR:       `${ORDER_SVC}/cart/clear`,
    },

    CHECKOUT: `${ORDER_SVC}/api/orders/checkout`,

    // ── Voucher (order-service) ──────────────────────────────────────────────
    VOUCHER: {
        LIST:  `${ORDER_SVC}/vouchers`,
        APPLY: `${ORDER_SVC}/vouchers/apply`,
    },
};

export const buildProductsUrl = (page: number = 0, size: number = 10) => {
    return `${ENDPOINT.PRODUCTS}?page=${page}&size=${size}`;
};

export const buildProductDetailUrl = (id: string) => {
    return `${ENDPOINT.PRODUCT_DETAIL}/${id}`;
};

export default ENDPOINT;
