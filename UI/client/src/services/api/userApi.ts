import { ENDPOINTS } from "@/constants";
import { get, put } from "../api.service";

export interface AddressRequest {
    country: string;
    province: string;
    city: string;
    ward: string;
    street: string;
    isDefault: boolean;
    phoneContacts: string[];
}

export interface ProfileCompletionData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dob?: string;
    city?: string;
    gender?: string;
    defaultPhoneNumber?: string;
    defaultEmail?: string;
    addresses: AddressRequest[];
}

export const userApi = {
    getUserInfo: () => {
        return get(ENDPOINTS.USER_INFO);
    },

    getMyProfile: () => {
        return get(`${ENDPOINTS.USER_PROFILE}/my-profile`);
    },

    getUserProfile: (profileId: string) => {
        return get(`${ENDPOINTS.USER_PROFILE}/${profileId}`);
    },

    updateMyProfile: (data: any) => {
        return put(ENDPOINTS.UPDATE_PROFILE, data);
    },

    completeProfile: (data: ProfileCompletionData) => {
        return put(ENDPOINTS.COMPLETE_PROFILE, data);
    },

    updateAvatar: (avatarUrl: string) => {
        return put(ENDPOINTS.UPDATE_AVATAR, { avatar: avatarUrl });
    },

    searchUsers: (keyword: string) => {
        return get(ENDPOINTS.SEARCH_USERS, { keyword });
    },
};
