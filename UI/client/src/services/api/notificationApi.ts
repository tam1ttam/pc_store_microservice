import ENDPOINT from "@/constants/endpoint";
import { get, put } from "@/services/api.service";

export const notificationApi = {
    getNotifications: (unreadOnly = false) =>
        get(`${ENDPOINT.NOTIFICATION.LIST}?unreadOnly=${unreadOnly}`),

    getUnreadCount: () => get(ENDPOINT.NOTIFICATION.COUNT),

    markAsRead: (id: string) => put(ENDPOINT.NOTIFICATION.MARK_READ(id), {}),

    markAllAsRead: () => put(ENDPOINT.NOTIFICATION.MARK_ALL_READ, {}),

    markActionDone: (id: string) => put(ENDPOINT.NOTIFICATION.MARK_ACTION_DONE(id), {}),
};
