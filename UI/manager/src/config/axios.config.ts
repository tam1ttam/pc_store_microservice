// axios.config.ts
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false,
    headers: {
        "ngrok-skip-browser-warning": "true"
    }
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
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
    (response) => response,
    (error) => {
        console.log("error: ", error);
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        if (error.response?.status === 403) {
            toast({
                variant: "destructive",
                title: "Không có quyền truy cập",
                description: "Bạn không có quyền thực hiện thao tác này."
            });
        }
        return Promise.reject(error);
    }
);

export default instance;
