export interface CartItem {
    productId: string;
    quantity: number;
}

export interface Cart {
    id: string;
    customer: {
        id: string;
        name: string;
        email: string;
    };
    items: CartItem[];
}

export interface CartItemWithProduct extends CartItem {
    product: {
        id: string;
        name: string;
        img: string;
        priceAfterDiscount: number;
        originalPrice: number;
        discountPercent: number;
        priceDiscount?: number;
        inStock?: number;
        supplier?: {
            name?: string;
            address?: string;
        };
    };
}

export interface CartState {
    cart: Cart | null;
    cartItems: CartItemWithProduct[];
    totalQuantity: number;
    totalPrice: number;
    loading: boolean;
    error: string | null;
}
