import { ENDPOINTS } from "@/constants";
import { get, post, del } from "../api.service";

export const authApi = {
    login: (credentials: any) => {
        return post(ENDPOINTS.LOGIN, credentials);
    },

    register: (credentials: any) => {
        return post(ENDPOINTS.REGISTER, credentials);
    },

    checkTokenValid: (token: string) => {
        return post(ENDPOINTS.INTROSPECT, { token });
    },

    // Cookie tự động gửi — không cần truyền token
    logout: () => {
        return post(ENDPOINTS.LOGOUT, {});
    },

    // Cookie tự động gửi — không cần request body
    refreshToken: () => {
        return post(ENDPOINTS.REFRESH_TOKEN, {});
    }
};
