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

    // Backend has no standalone "update product detail" endpoint.
    // Product detail is included in the full product update request body.
    updateProductDetail: (productId: string, updateData: any) => {
        return put(`${ENDPOINTS.UPDATE_PRODUCT}/${productId}`, updateData);
    },

    deleteProduct: (productId: string, token: string) => {
        return del(`${ENDPOINTS.DELETE_PRODUCT}/${productId}`, {}, token);
    },

    // Orders
    listOrders: (page: number = 0) => {
        return get(`${ENDPOINTS.LIST_ORDER}?page=${page}`);
    },

    updatePaymentStatus: (orderId: string, status: string) => {
        return put(`${ENDPOINTS.UPDATE_PAYMENT_STATUS}/${orderId}?status=${status}`, {});
    },

    // Customers/Users
    getCustomers: (page: number = 0, size: number = 20) => {
        return get(`${ENDPOINTS.LIST_CUSTOMER}?page=${page}&size=${size}`);
    },

    searchCustomers: (searchKey: string, page: number = 0, size: number = 20) => {
        return get(`${ENDPOINTS.LIST_CUSTOMER}/search?searchKey=${searchKey}&page=${page}&size=${size}`);
    },

    // Roles
    updateUserRole: (userName: string) => {
        return post(`${ENDPOINTS.ADMIN}/update-role/${userName}`, {});
    },
};
