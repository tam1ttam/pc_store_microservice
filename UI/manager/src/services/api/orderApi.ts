import { ENDPOINTS } from "@/constants";
import ENDPOINT from "@/constants/endpoint";
import { get, put } from "../api.service";

export const orderApi = {
    getOrders: (userId: string) => {
        return get(`${ENDPOINTS.ORDER}/${userId}`);
    },

    updateOrderStatus: (orderId: string, status: string) => {
        return put(`${ENDPOINT.ORDER}/${orderId}?status=${status}`, {});
    },

    getPaymentStatus: (paymentId: string) => {
        return get(`${ENDPOINTS.PAYMENT_STATUS}/${paymentId}`);
    }
};
