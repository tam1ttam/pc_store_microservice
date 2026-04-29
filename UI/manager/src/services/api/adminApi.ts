import { ENDPOINTS } from "@/constants";
import { get, post, put, del } from "../api.service";

export const adminApi = {
    // Products
    listProducts: (page: number = 0) => {
        return get(`${ENDPOINTS.LIST_PRODUCT}?page=${page}`);
    },

    getProductDetail: (productId: string) => {
        return get(`${ENDPOINTS.PRODUCT_DETAIL}/${productId}`);
    },

    addProduct: (productData: any) => {
        return post(ENDPOINTS.ADD_PRODUCT, productData);
    },

    updateProduct: (productId: string, formData: any) => {
        return put(`${ENDPOINTS.UPDATE_PRODUCT}/${productId}`, formData);
    },

    updateProductDetail: (updateData: any) => {
        return put(ENDPOINTS.UPDATE_PRODUCT_DETAIL, updateData);
    },

    deleteProduct: (productId: string, token: string) => {
        return del(`${ENDPOINTS.DELETE_PRODUCT}/${productId}`, {}, token);
    },

    // Orders
    listOrders: (page: number = 0) => {
        return get(`${ENDPOINTS.LIST_ORDER}?page=${page}`);
    },

    updatePaymentStatus: (orderId: string) => {
        return put(ENDPOINTS.UPDATE_PAYMENT_STATUS + `/${orderId}`, {});
    },

    // Customers/Users
    getCustomers: () => {
        return get(ENDPOINTS.LIST_CUSTOMER);
    },

    // Roles
    updateUserRole: (userName: string, token: string) => {
        return post(ENDPOINTS.ADMIN + `/update-role/${userName}`, {}, token);
    }
};

