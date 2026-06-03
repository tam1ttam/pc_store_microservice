/**
 * Cache địa chỉ giao hàng gần nhất để điền sẵn khi vào trang Checkout.
 */

const KEY = "addressShipping";

export interface ShippingAddress {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
}

export const saveShippingAddress = (addr: ShippingAddress): void => {
    localStorage.setItem(KEY, JSON.stringify(addr));
};

export const getShippingAddress = (): ShippingAddress | null => {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearShippingAddress = (): void => {
    localStorage.removeItem(KEY);
};
