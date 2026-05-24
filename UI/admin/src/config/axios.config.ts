// axios.config.ts
import axios from "axios";
import { toast } from "@/hooks/use-toast";

const BASE = import.meta.env.VITE_API_URL;
const REFRESH_URL = `${BASE}/api-gateway/identity-service/auth/refresh`;

// ─── In-memory access token (không lưu localStorage) ─────────────────────────
let inMemoryToken: string | null = null;
export const setAccessToken = (t: string | null) => {
    inMemoryToken = t;
};
export const getAccessToken = () => inMemoryToken;

// ─── Queue để gom các request bị 401 trong lúc đang refresh ────────────────
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let isRefreshing = false;
let pendingQueue: QueueEntry[] = [];

const flushQueue = (token: string | null, err: unknown = null) => {
    pendingQueue.forEach((e) => (token ? e.resolve(token) : e.reject(err)));
    pendingQueue = [];
};

// ─── Axios instance ─────────────────────────────────────────────────────────
const instance = axios.create({
    baseURL: BASE,
    withCredentials: true,
    headers: { "ngrok-skip-browser-warning": "true" },
});

// Request interceptor — đính token vào header từ bộ nhớ
instance.interceptors.request.use(
    (config) => {
        if (inMemoryToken) config.headers["Authorization"] = `Bearer ${inMemoryToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — silent refresh khi 401, redirect nếu refresh thất bại
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            // Đang refresh rồi → xếp hàng chờ token mới
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                }).then((newToken) => {
                    original.headers["Authorization"] = `Bearer ${newToken}`;
                    return instance(original);
                });
            }

            original._retry = true;
            isRefreshing = true;

            try {
                // Dùng raw axios để tránh vòng lặp interceptor
                const res = await axios.post(
                    REFRESH_URL,
                    {},
                    { withCredentials: true, headers: { "ngrok-skip-browser-warning": "true" } }
                );
                const newToken: string = res.data?.result?.token;
                if (!newToken) throw new Error("Refresh response missing token");

                inMemoryToken = newToken;
                flushQueue(newToken);
                original.headers["Authorization"] = `Bearer ${newToken}`;
                return instance(original);
            } catch {
                flushQueue(null, error);
                inMemoryToken = null;
                window.location.href = "/login";
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 403) {
            toast({
                variant: "destructive",
                title: "Không có quyền truy cập",
                description: "Bạn không có quyền thực hiện thao tác này.",
            });
        }

        return Promise.reject(error);
    }
);

export default instance;
