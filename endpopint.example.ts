// filepath: src/constants/endpoint.ts
// Generated from PC Store Microservice API structure
// Updated: April 27, 2026

// Get API base URL from environment variables or defaults
const getBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
        // Client-side: Try to get from window object or use default
        return (window as any).__API_URL__ || 'http://localhost:6060';
    }
    // Server-side fallback
    return 'http://localhost:6060';
};

const BASE_URL = getBaseUrl();

/**
 * API Endpoints for PC Store Microservice
 * All endpoints use /api/v1/ base path
 */
const ENDPOINT = {
    // ==================== AUTHENTICATION (Identity Service) ====================
    AUTH: {
        LOGIN: `${BASE_URL}/api/v1/auth/login`,
        LOGOUT: `${BASE_URL}/api/v1/auth/logout`,
        REFRESH: `${BASE_URL}/api/v1/auth/refresh`,
        ME: `${BASE_URL}/api/v1/auth/me`,
        CALLBACK_LOGIN: `${BASE_URL}/api/v1/auth/callback/login`,
        CALLBACK_DELETE_ACCOUNT: `${BASE_URL}/api/v1/auth/callback/delete-account`,
    },

    // ==================== USER PROFILE (User Service) ====================
    USER: {
        GET_PROFILE: (userId: string) => `${BASE_URL}/api/v1/user/profile/${userId}`,
        CREATE_PROFILE: `${BASE_URL}/api/v1/user/profile/create`,
        UPDATE_PROFILE: (userId: string) => `${BASE_URL}/api/v1/user/profile/update/${userId}`,
        DELETE_PROFILE: (userId: string) => `${BASE_URL}/api/v1/user/profile/delete/${userId}`,
        UPDATE_ADDRESS: (userId: string) => `${BASE_URL}/api/v1/user/profile/update-address/${userId}`,
    },

    // ==================== PRODUCTS (Product Service) ====================
    PRODUCTS: {
        BASE: `${BASE_URL}/api/v1/products`,
        CREATE: `${BASE_URL}/api/v1/products`,
        GET_ALL: `${BASE_URL}/api/v1/products`,
        GET_BY_ID: (productId: string) => `${BASE_URL}/api/v1/products/${productId}`,
        UPDATE: (productId: string) => `${BASE_URL}/api/v1/products/${productId}`,
        DELETE: (productId: string) => `${BASE_URL}/api/v1/products/${productId}`,
        GET_BY_CATEGORY: (categoryId: string) => `${BASE_URL}/api/v1/products/category/${categoryId}`,
        SEARCH: `${BASE_URL}/api/v1/products/search`,
        SEARCH_BY_NAME: (name: string) => `${BASE_URL}/api/v1/products/${name}`,
        NEWEST: `${BASE_URL}/api/v1/products/newest`,
        BEST_SELLING: `${BASE_URL}/api/v1/products/best-selling`,
        FEATURED: `${BASE_URL}/api/v1/products/featured`,
        PUBLISHED: `${BASE_URL}/api/v1/products/published`,
        HEALTH: `${BASE_URL}/api/v1/products/health`,
    },

    // ==================== CATEGORIES (Product Service) ====================
    CATEGORIES: {
        BASE: `${BASE_URL}/api/v1/categories`,
        GET_ALL: `${BASE_URL}/api/v1/categories`,
        CREATE: `${BASE_URL}/api/v1/categories`,
        GET_BY_ID: (categoryId: string) => `${BASE_URL}/api/v1/categories/${categoryId}`,
        UPDATE: (categoryId: string) => `${BASE_URL}/api/v1/categories/${categoryId}`,
        DELETE: (categoryId: string) => `${BASE_URL}/api/v1/categories/${categoryId}`,
    },

    // ==================== SHOPPING CART (Order Service) ====================
    CART: {
        BASE: `${BASE_URL}/api/v1/carts`,
        CREATE: `${BASE_URL}/api/v1/carts/create`,
        GET_ITEMS: (userId: string) => `${BASE_URL}/api/v1/carts/${userId}`,
        ADD_ITEM: `${BASE_URL}/api/v1/carts/items`,
        UPDATE_ITEM: (itemId: string) => `${BASE_URL}/api/v1/carts/items/${itemId}`,
        DELETE_ITEMS: `${BASE_URL}/api/v1/carts/items`,
        DELETE_ALL: `${BASE_URL}/api/v1/carts/empty`,
    },

    // ==================== VOUCHERS (Order Service) ====================
    VOUCHERS: {
        BASE: `${BASE_URL}/api/v1/vouchers`,
        CREATE: `${BASE_URL}/api/v1/vouchers`,
        GET_ALL: `${BASE_URL}/api/v1/vouchers`,
        GET_BY_ID: (voucherId: string) => `${BASE_URL}/api/v1/vouchers/${voucherId}`,
        UPDATE: (voucherId: string) => `${BASE_URL}/api/v1/vouchers/${voucherId}`,
        DELETE: (voucherId: string) => `${BASE_URL}/api/v1/vouchers/${voucherId}`,
        VALIDATE: (code: string) => `${BASE_URL}/api/v1/vouchers/validate/${code}`,
    },

    // ==================== ORDERS (Order Service) ====================
    ORDERS: {
        BASE: `${BASE_URL}/api/v1/orders`,
        CREATE: `${BASE_URL}/api/v1/orders`,
        GET_ALL: `${BASE_URL}/api/v1/orders`,
        GET_BY_ID: (orderId: string) => `${BASE_URL}/api/v1/orders/${orderId}`,
        PREVIEW: `${BASE_URL}/api/v1/orders/preview`,
        CANCEL: (orderId: string) => `${BASE_URL}/api/v1/orders/${orderId}/cancel`,
        HEALTH: `${BASE_URL}/api/v1/orders/health`,
        // Order-Voucher endpoints
        ATTACH_VOUCHER: `${BASE_URL}/api/v1/orders/vouchers/attach`,
        REMOVE_VOUCHER: `${BASE_URL}/api/v1/orders/vouchers/remove`,
    },

    // ==================== PAYMENTS (Payment Service) ====================
    PAYMENT: {
        HEALTH: `${BASE_URL}/api/v1/payment/health`,
        // Add payment endpoints as they are implemented
        // CREATE_PAYPAL: `${BASE_URL}/api/v1/payment/create_payment`,
        // STATUS: `${BASE_URL}/api/v1/payment/status`,
    },

    // ==================== MEDIA (Media Service) ====================
    MEDIA: {
        HEALTH: `${BASE_URL}/api/v1/media/health`,
        // Add media upload/download endpoints as they are implemented
    },

    // ==================== CHAT & CONVERSATIONS (TODO: Not Yet Implemented) ====================
    CONVERSATIONS: {
        GET_MY_CONVERSATIONS: `${BASE_URL}/api/v1/conversations/my-conversations`,
        CREATE_CONVERSATION: `${BASE_URL}/api/v1/conversations/create`,
        GET_MESSAGES: (conversationId: string) => `${BASE_URL}/api/v1/messages/get/${conversationId}`,
        CREATE_MESSAGE: `${BASE_URL}/api/v1/messages/create`,
    },

    // ==================== RECOMMENDATIONS (TODO: Not Yet Implemented) ====================
    RECOMMENDATIONS: {
        GET_RECOMMENDATIONS: (customerId: string) => `${BASE_URL}/api/v1/recommendations/${customerId}`,
    },

    // ==================== AI (TODO: Not Yet Implemented) ====================
    AI: {
        ASK: `${BASE_URL}/api/v1/ai/ask`,
        STATS: `${BASE_URL}/api/v1/ai/stats`,
    },

    // ==================== ADMIN (TODO: Not Yet Implemented) ====================
    ADMIN: {
        GET_CUSTOMERS: `${BASE_URL}/api/v1/admin/customers`,
        UPDATE_USER_ROLE: (userName: string) => `${BASE_URL}/api/v1/admin/update-role/${userName}`,
        ADD_PRODUCT: `${BASE_URL}/api/v1/admin/add-product`,
        UPDATE_PRODUCT: (productId: string) => `${BASE_URL}/api/v1/admin/update-product/${productId}`,
        UPDATE_PRODUCT_DETAIL: `${BASE_URL}/api/v1/admin/update-product-detail`,
    },

    // ==================== PRODUCT DETAILS (TODO: Not Yet Implemented) ====================
    PRODUCT_DETAIL: {
        GET_BY_ID: (productId: string) => `${BASE_URL}/api/v1/product-detail/${productId}`,
        UPDATE: `${BASE_URL}/api/v1/admin/update-product-detail`,
    },
};

/**
 * Helper Functions for Building URLs
 */

/**
 * Build products URL with pagination
 * @param page - Page number (0-indexed)
 * @param size - Page size (default: 10)
 * @param sortBy - Sort field (default: id)
 * @param direction - Sort direction ASC/DESC (default: ASC)
 */
export const buildProductsUrl = (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    direction: 'ASC' | 'DESC' = 'ASC'
): string => {
    return `${ENDPOINT.PRODUCTS.GET_ALL}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
};

/**
 * Build newest products URL
 * @param limit - Number of products to fetch (default: 10)
 */
export const buildNewestProductsUrl = (limit: number = 10): string => {
    return `${ENDPOINT.PRODUCTS.NEWEST}?limit=${limit}`;
};

/**
 * Build best-selling products URL
 * @param limit - Number of products to fetch (default: 10)
 */
export const buildBestSellingProductsUrl = (limit: number = 10): string => {
    return `${ENDPOINT.PRODUCTS.BEST_SELLING}?limit=${limit}`;
};

/**
 * Build product search by name URL with pagination
 * @param name - Product name to search
 * @param page - Page number (0-indexed)
 * @param size - Page size (default: 10)
 */
export const buildProductSearchByNameUrl = (name: string, page: number = 0, size: number = 10): string => {
    return `${ENDPOINT.PRODUCTS.SEARCH_BY_NAME(encodeURIComponent(name))}?page=${page}&size=${size}`;
};

/**
 * Build product search URL
 * @param keyword - Search keyword
 */
export const buildProductSearchUrl = (keyword: string): string => {
    return `${ENDPOINT.PRODUCTS.SEARCH}?keyword=${encodeURIComponent(keyword)}`;
};

/**
 * Build categories URL with pagination
 * @param page - Page number (0-indexed)
 * @param size - Page size (default: 10)
 * @param sortBy - Sort field (default: id)
 * @param direction - Sort direction ASC/DESC (default: ASC)
 */
export const buildCategoriesUrl = (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    direction: 'ASC' | 'DESC' = 'ASC'
): string => {
    return `${ENDPOINT.CATEGORIES.GET_ALL}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
};

/**
 * Build voucher validation URL
 * @param code - Voucher code
 */
export const buildVoucherValidationUrl = (code: string): string => {
    return `${ENDPOINT.VOUCHERS.VALIDATE(code)}`;
};

/**
 * Build orders URL with pagination
 * @param page - Page number (0-indexed)
 * @param size - Page size (default: 10)
 */
export const buildOrdersUrl = (page: number = 0, size: number = 10): string => {
    return `${ENDPOINT.ORDERS.GET_ALL}?page=${page}&size=${size}`;
};

/**
 * Build cart items URL
 * @param userId - User ID
 */
export const buildCartItemsUrl = (userId: string): string => {
    return ENDPOINT.CART.GET_ITEMS(userId);
};

export default ENDPOINT;
