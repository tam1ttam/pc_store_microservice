import ENDPOINT from "@/constants/endpoint";
import { get, post, del } from "../api.service";

export const authApi = {
    login: (credentials: any) => {
        console.log("LOGIN URL:", ENDPOINT.LOGIN); // ← xác nhận URL
        return post(ENDPOINT.LOGIN, credentials);
    },
    register: (credentials: any) => {
        return post(ENDPOINT.REGISTER, credentials);
    },
    checkTokenValid: (token: string) => {
        return post(ENDPOINT.INTROSPECT, { token });
    },
    logout: (token: string) => {
        return post(ENDPOINT.LOGOUT, { token });
    },
    refreshToken: (token: string) => {
        return post(ENDPOINT.REFRESH_TOKEN, { token });
    }
};