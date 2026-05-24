import ENDPOINT from "@/constants/endpoint";
import { get, post, del } from "../api.service";

export const authApi = {
    login: (credentials: any) => {
        return post(ENDPOINT.LOGIN, credentials);
    },
    register: (credentials: any) => {
        return post(ENDPOINT.REGISTER, credentials);
    },
    checkTokenValid: (token: string) => {
        return post(ENDPOINT.INTROSPECT, { token });
    },

    // Cookie tự động gửi — không cần truyền token
    logout: () => {
        return post(ENDPOINT.LOGOUT, {});
    },

    // Cookie tự động gửi — không cần request body
    refreshToken: () => {
        return post(ENDPOINT.REFRESH_TOKEN, {});
    }
};
