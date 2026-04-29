import { get } from "../api.service";

export const productApi = {
    getRecommendations: (customerId: string) => {
        return get(`/api/recommendations/${customerId}`);
    },
    getNewest: (limit = 10) => {
        return get(`/api/products/newest?limit=${limit}`);
    },
    getBestSelling: (limit = 10) => {
        return get(`/api/products/best-selling?limit=${limit}`);
    }
};
