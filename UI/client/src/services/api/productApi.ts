import ENDPOINT from "@/constants/endpoint";
import { get } from "../api.service";

export const productApi = {
    getCategories: () => {
        return get(ENDPOINT.CATEGORIES);
    },
    getNewest: (limit = 10) => {
        return get(`${ENDPOINT.PRODUCTS}/newest?limit=${limit}`);
    },
    getBestSelling: (limit = 10) => {
        return get(`${ENDPOINT.PRODUCTS}/best-selling?limit=${limit}`);
    },
};
