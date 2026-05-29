import { ENDPOINTS } from "@/constants";
import { CustomerUpdateRequest, CustomerUpdateResponse } from "@/types";
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

    getUserRole: (userName: string) => {
        return get(`/api-gateway/identity-service/users/role/${userName}`);
    },

    // PUT /api-gateway/user-service/users/my-profile
    updateMyProfile: (data: any) => {
        return put(ENDPOINTS.UPDATE_PROFILE, data);
    },
    updateUserInfo: (
        userName: string,
        data: CustomerUpdateRequest
    ): Promise<{ data: CustomerUpdateResponse }> => {
        return put(`${ENDPOINTS.CUSTOMERS}/${userName}`, data);
    },

    // POST /api-gateway/user-service/users/search
    searchUsers: (keyword: string) => {
        return get(ENDPOINTS.SEARCH_USERS, { keyword });
    },
};
