import ENDPOINT from "@/constants/endpoint";
import { get, post } from "../api.service";

export const voucherApi = {
    getAvailable: () => get(ENDPOINT.VOUCHER.LIST),
    apply: (orderId: number, voucherCode: string) =>
        post(ENDPOINT.VOUCHER.APPLY, { orderId, voucherCode }),
};
