import { ENDPOINTS } from "@/constants";
import { get, put } from "../api.service";

export const userApi = {
    // GET /api-gateway/user-service/api/customers/info — auth via Bearer header
    getUserInfo: () => {
        return get(ENDPOINTS.USER_INFO);
    },

    // GET /api-gateway/user-service/users/my-profile
    getMyProfile: () => {
        return get(`${ENDPOINTS.USER_PROFILE}/my-profile`);
    },

    // GET /api-gateway/user-service/users/{profileId}
    getUserProfile: (profileId: string) => {
        return get(`${ENDPOINTS.USER_PROFILE}/${profileId}`);
    },

    // PUT /api-gateway/user-service/users/my-profile
    updateMyProfile: (data: any) => {
        return put(ENDPOINTS.UPDATE_PROFILE, data);
    },

    // POST /api-gateway/user-service/users/search
    searchUsers: (keyword: string) => {
        return get(ENDPOINTS.SEARCH_USERS, { keyword });
    },
};
