import axios from "axios";
import { getAccessToken } from "@/config/axios.config";

const api = axios.create({
    baseURL: "http://localhost:6060/api-gateway/identity-service",
});

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
