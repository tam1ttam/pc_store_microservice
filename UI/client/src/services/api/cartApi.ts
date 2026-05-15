import { ENDPOINTS } from "@/constants";
import ENDPOINT from "@/constants/endpoint";
import { del, get, post } from "../api.service";

export const cartApi = {
    // 1. Lấy danh sách sản phẩm để hiển thị trong giỏ hàng
    getCartItems: (userId: string) => {
        // Gọi đúng đường dẫn /api/orders/${userId}
        return get(ENDPOINTS.CART.GET_ITEMS(userId));
    },

    // 2. Lấy số lượng sản phẩm trong giỏ (hiện số ở icon giỏ hàng)
    getCartCount: (userId: string) => {
        // Vì dùng chung với Order, ta lấy danh sách về rồi đếm
        return get(ENDPOINTS.CART.GET_ITEMS(userId));
    },

    // 3. Thêm sản phẩm vào giỏ hàng
    addToCart: (userId: string, productId: string, quantity: number = 1) => {
        return post(ENDPOINTS.CART.ADD(userId), {
            // Thông tin bắt buộc cho OrderCreationRequest ở Backend
            customerId: userId,
            customerEmail: "user@example.com", 
            customerName: "Khách hàng",
            shipAddress: "Hồ Chí Minh",
            orderDate: new Date().toISOString(),
            isPaid: "false",
            orderStatus: "CART",
            totalPrice: 0,
            
            // Danh sách sản phẩm (items) khớp với List<CartItem>
            items: [
                {
                    productId: productId,
                    productName: "Sản phẩm",
                    productPrice: 0,
                    quantity: quantity
                }
            ]
        });
    },

    deleteCartItem: (customerId: string, productId: string) => {
        return del(`${ENDPOINTS.CART.DELETE_ITEM}?customerId=${customerId}&productId=${productId}`, {});
    },

    deleteAllCart: (customerId: string, headers?: any) => {
        return del(ENDPOINT.CART.DELETE_ALL, { customerId }, headers);
    },

    decreaseQuantity: (customerId: string, productId: string) => {
        return post(`${ENDPOINTS.CART.DECREASE}?customerId=${customerId}&productId=${productId}`, {});
    },

    increaseQuantity: (customerId: string, productId: string) => {
        return post(`${ENDPOINTS.CART.INCREASE}?customerId=${customerId}&productId=${productId}`, {});
    }
};