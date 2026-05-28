import ENDPOINT from "@/constants/endpoint";
import { get, patch } from "../api.service";

export const orderApi = {
    getOrders: () => get(ENDPOINT.ORDER),

    getOrderById: (id: number) => get(`${ENDPOINT.ORDER}/${id}`),

    cancelOrder: (id: number) => patch(ENDPOINT.ORDER_CANCEL(id), {}),

    getPaymentStatus: (paymentId: string) => get(`${ENDPOINT.PAYMENT_STATUS}/${paymentId}`),
};
