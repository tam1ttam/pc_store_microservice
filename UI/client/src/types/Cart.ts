export interface CartItem {
    id: number;
    productId: string;
    productName: string;
    productPrice: number;
    productImage?: string;
    quantity: number;
    subtotal: number;
}

export interface CartItemWithProduct extends CartItem {
    product: {
        id: string;
        name: string;
        img?: string;
        supplier?: { name: string };
        priceAfterDiscount: number;
        originalPrice?: number;
    };
}

export interface CartResponse {
    id: number;
    identityUserId: string;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}
