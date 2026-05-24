/**
 * Cache thông tin user cơ bản vào localStorage để tránh gọi API mỗi lần load.
 * TTL mặc định: 30 phút.
 */

const KEY = "user_cache";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface CachedUser {
    userId: string;
    name: string;
    avatar?: string;
}

interface CacheEntry {
    data: CachedUser;
    expiresAt: number;
}

export const saveUserCache = (user: CachedUser): void => {
    const entry: CacheEntry = {
        data: user,
        expiresAt: Date.now() + TTL_MS,
    };
    localStorage.setItem(KEY, JSON.stringify(entry));
};

export const getUserCache = (): CachedUser | null => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() > entry.expiresAt) {
            localStorage.removeItem(KEY);
            return null;
        }
        return entry.data;
    } catch {
        return null;
    }
};

export const clearUserCache = (): void => {
    localStorage.removeItem(KEY);
};
