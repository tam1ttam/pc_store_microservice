package tam.order.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tam.order.dto.req.AddToCartRequest;
import tam.order.dto.req.DeleteMultipleCartItemsRequest;
import tam.order.dto.req.UpdateCartItemRequest;
import tam.order.dto.res.CartResponse;

import java.util.List;

public interface CartService {

    CartResponse getCart(String userId);
    CartResponse createCart(String userId);
    CartResponse addToCart(String userId, AddToCartRequest request);
    CartResponse updateCartItem(String userId, Integer itemId, UpdateCartItemRequest request);
    CartResponse removeFromCart(String userId, Integer itemId);
    CartResponse removeMultipleFromCart(String userId, List<Integer> itemIds);

    /**
     * Xóa toàn bộ giỏ hàng
     */
    void emptyCart(String userId);
}

