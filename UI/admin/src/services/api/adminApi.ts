import ENDPOINT from "@/constants/endpoint";
import { get, post, put, del } from "../api.service";

export const adminApi = {
    // Products
    listProducts: (page: number = 0) => {
        return get(`${ENDPOINT.LIST_PRODUCT}?page=${page}`);
    },

    getProductDetail: (productId: string) => {
        return get(`${ENDPOINT.PRODUCT_DETAIL}/${productId}`);
    },

    addProduct: (productData: any) => {
        return post(ENDPOINT.ADD_PRODUCT, productData);
    },

    updateProduct: (productId: string, formData: any) => {
        return put(`${ENDPOINT.UPDATE_PRODUCT}/${productId}`, formData);
    },

    updateProductDetail: (productId: string, updateData: any) => {
        return put(`${ENDPOINT.PRODUCT_DETAIL}/${productId}`, updateData);
    },

    deleteProduct: (productId: string, token: string) => {
        return del(`${ENDPOINT.DELETE_PRODUCT}/${productId}`, {}, token);
    },

    // Orders
    listOrders: (page: number = 0) => {
        return get(`${ENDPOINT.LIST_ORDER}?page=${page}`);
    },

    updatePaymentStatus: (orderId: string, status: string) => {
        return put(`${ENDPOINT.UPDATE_PAYMENT_STATUS}/${orderId}?status=${status}`, {});
    },

    getOrderStats: () => {
        return get(ENDPOINT.ORDER_STATS);
    },

    // Customers/Users
    getCustomers: (page: number = 0, size: number = 20) => {
        return get(`${ENDPOINT.LIST_CUSTOMER}?page=${page}&size=${size}`);
    },

    searchCustomers: (searchKey: string, page: number = 0, size: number = 20) => {
        return get(`${ENDPOINT.LIST_CUSTOMER}/search?searchKey=${searchKey}&page=${page}&size=${size}`);
    },

    getCustomerCount: () => {
        return get(ENDPOINT.CUSTOMER_COUNT);
    },

    // Products count
    getProductCount: () => {
        return get(ENDPOINT.PRODUCT_COUNT);
    },

    // Online users (existing chat-service endpoints)
    getChatOnlineUserIds: () => {
        return get(ENDPOINT.CHAT_ONLINE_USER_IDS);
    },

    getChatManagers: () => {
        return get(ENDPOINT.CHAT_MANAGERS);
    },

    // Roles
    getRoles: () => {
        return get(`${ENDPOINT.ADMIN}/roles`);
    },

    updateUserRole: (userName: string, roleName: string) => {
        return post(`${ENDPOINT.ADMIN}/update-role/${userName}?roleName=${roleName}`, {});
    },

    updateUserProfile: (userName: string, profileData: any) => {
        return put(`${ENDPOINT.LIST_CUSTOMER}/${userName}`, profileData);
    },

    logout: () => {
        return post(ENDPOINT.LOGOUT, {});
    },

    // Audit history
    getAuditHistory: (params?: { search?: string; from?: string; to?: string }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.from) query.set("from", params.from);
        if (params?.to) query.set("to", params.to);
        const qs = query.toString();
        return get(`${ENDPOINT.ADMIN}/history${qs ? `?${qs}` : ""}`);
    },
};
