// axios.config.ts
import { isTokenValid } from "@/utils/token";
import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // thử đổi thành true
    headers: {
        "ngrok-skip-browser-warning": "true"
    }
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && isTokenValid(token)) {
            config.headers["Authorization"] = `Bearer ${token}`;
        } else {
            localStorage.removeItem("token");
        }
        return config;
    },
    (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error("Response Error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default instance;
