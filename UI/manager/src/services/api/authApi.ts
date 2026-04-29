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

    logout: (token: string) => {
        return post(ENDPOINTS.LOGOUT, { token });
    },

    refreshToken: (token: string) => {
        return post(ENDPOINTS.REFRESH_TOKEN, { token });
    }
};
