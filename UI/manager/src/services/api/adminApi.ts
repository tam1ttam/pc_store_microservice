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

    updateProductDetail: (productId: string, updateData: any) => {
        return put(`${ENDPOINTS.PRODUCT_DETAIL}/${productId}`, updateData);
    },

    deleteProduct: (productId: string, token: string) => {
        return del(`${ENDPOINTS.DELETE_PRODUCT}/${productId}`, {}, token);
    },

    // Categories
    listCategories: () => get(ENDPOINTS.CATEGORIES),
    createCategory: (name: string) => post(ENDPOINTS.CATEGORIES, { name }),
    deleteCategory: (id: string) => del(`${ENDPOINTS.CATEGORIES}/${id}`, {}),
    listProductsByCategories: (categories: string[], page: number = 0) => {
        const qs = categories.map(c => `names=${encodeURIComponent(c)}`).join("&");
        return get(`${ENDPOINTS.PRODUCTS_BY_CATEGORIES}?${qs}&page=${page}`);
    },
    getCategoryCounts: (categoryNames: string[]) => {
        const qs = categoryNames.map(c => `names=${encodeURIComponent(c)}`).join("&");
        return get(`${ENDPOINTS.PRODUCTS_CATEGORY_COUNTS}?${qs}`);
    },

    // Vouchers
    listVouchers: () => get(ENDPOINTS.VOUCHER.LIST),
    getVoucher: (id: number) => get(ENDPOINTS.VOUCHER.GET_BY_ID(id)),
    createVoucher: (data: any) => post(ENDPOINTS.VOUCHER.CREATE, data),
    updateVoucher: (id: number, data: any) => put(ENDPOINTS.VOUCHER.UPDATE(id), data),
    deleteVoucher: (id: number) => del(ENDPOINTS.VOUCHER.DELETE(id), {}),

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
