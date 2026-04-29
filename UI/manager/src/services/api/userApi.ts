import { ENDPOINTS } from "@/constants";
import { get } from "../api.service";

export const userApi = {
    getUserInfo: (token: string) => {
        return get(ENDPOINTS.USER_INFO, { token });
    },

    getUserProfile: (userId: string) => {
        return get(`${ENDPOINTS.USER_PROFILE}/${userId}`);
    }
};
