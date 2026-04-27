package tam.order.mapper;

import org.springframework.stereotype.Component;
import tam.order.dto.req.AddToCartRequest;
import tam.order.dto.res.CartItemResponse;
import tam.order.entity.CartItem;

import java.util.Collection;
import java.util.List;

@Component
public class CartItemMapper {

    public CartItemResponse toResponse(CartItem item) {
        return CartItemResponse.builder()
                .itemId(item.getItemId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .thumbnail(item.getThumbnail())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getPrice() * item.getQuantity())
                .build();
    }

    public List<CartItemResponse> toResponseList(Collection<CartItem> items) {
        if (items == null) return List.of();
        return items.stream().map(this::toResponse).toList();
    }

    public CartItem toCartItem(AddToCartRequest request) {
        return CartItem.builder()
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .productName(request.getProductName())
                .thumbnail(request.getThumbnail())
                .build();
    }
}