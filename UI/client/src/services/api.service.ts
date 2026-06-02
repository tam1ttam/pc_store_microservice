import { AxiosResponse } from "axios";
import instance from "../config/axios.config";

export const get = async <T>(uri: string, params?: any): Promise<AxiosResponse<T>> => {
    const res = await instance.get<T>(uri, { params });
    return res;
};

export const post = async <T>(uri: string, data?: any, params?: any, headers?: any): Promise<AxiosResponse<T>> => {
    try {
        const res = await instance.post<T>(uri, data, { params, headers });
        return res;
    } catch (error: any) {
        console.error("API Error:", {
            uri,
            data,
            params,
            error: error.response?.data || error.message
        });
        throw error;
    }
};
export const put = async <T>(uri: string, data?: any): Promise<AxiosResponse<T>> => {
    const res = await instance.put<T>(uri, data);
    return res;
};

export const del = async <T>(uri: string, params?: any, headers?: any): Promise<AxiosResponse<T>> => {
    // use params for query string on DELETE (backend uses @RequestParam)
    // allow optional headers (e.g., Authorization)
    const res = await instance.delete<T>(uri, { params, headers });
    return res;
};
export const patch = async <T>(uri: string, data?: any, headers?: any): Promise<AxiosResponse<T>> => {
    const res = await instance.patch<T>(uri, data, { headers });
    return res;
};

// Example usage functions
// export const fetchBannerData = () => api.get<{ result: BannerData[] }>(ENDPOINTS.BANNER);
// export const getCategories = () => api.get<{ result: Category[] }>(ENDPOINTS.CATEGORIES);
// export const loginUser = (credentials: Credentials) => api.post<LoginResponse>(ENDPOINTS.LOGIN, credentials);
// export const getAdvertisementById = (id: number) => api.get(`${ENDPOINTS.ADVERTISEMENT}/${id}`);
// export const getAllReviewsAdvertisementById = (id: number) => api.get(`${ENDPOINTS.REVIEWS}/${id}`);
