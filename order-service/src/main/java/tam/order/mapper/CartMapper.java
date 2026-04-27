package tam.order.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tam.order.dto.res.CartItemResponse;
import tam.order.dto.res.CartResponse;
import tam.order.entity.Cart;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CartMapper {

    private final CartItemMapper cartItemMapper;

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cartItemMapper.toResponseList(cart.getItems());

        double totalPrice = items.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUserId())
                .items(items)
                .totalPrice(totalPrice)
                .totalItems(items.size())
                .build();
    }
}
