package tam.order.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tam.order.dto.req.AddToCartRequest;
import tam.order.dto.req.UpdateCartItemRequest;
import tam.order.dto.res.CartItemResponse;
import tam.order.dto.res.CartResponse;
import tam.order.entity.Cart;
import tam.order.entity.CartItem;
import tam.order.repository.CartRepository;
import tam.order.repository.OrderRepository;
import tam.order.service.CartService;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartServiceImpl implements CartService {

    CartRepository cartRepository;
    OrderRepository orderRepository;

    @Override
    public CartResponse getCart(String userId) {
        //TODO: Gọi user service để validate userId
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(Cart.builder().userId(userId).build());

        return buildCartResponse(cart);
    }

    @Override
    public CartResponse createCart(String userId) {
        var cartResponse = cartRepository.save(Cart.builder().userId(userId).build());
        return CartResponse.builder()
                .cartId(cartResponse.getCartId())
                .userId(cartResponse.getUserId())
                .build();
    }

    @Override
    public CartResponse addToCart(String userId, AddToCartRequest request) {
        //TODO: Gọi product service để validate productId và kiểm tra stock

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().userId(userId).build();
                    return cartRepository.save(newCart);
                });

        // Kiểm tra nếu sản phẩm đã có trong giỏ
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .productId(request.getProductId())
                    .quantity(request.getQuantity())
                    .price(request.getPrice())
                    .productName(request.getProductName())
                    .thumbnail(request.getThumbnail())
                    .cart(cart)
                    .build();
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        log.info("Added product {} to cart for user: {}", request.getProductId(), userId);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse updateCartItem(String userId, Integer itemId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(null);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        item.setQuantity(request.getQuantity());
        cartRepository.save(cart);
        log.info("Updated cart item {} quantity to {} for user: {}", itemId, request.getQuantity(), userId);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse removeFromCart(String userId, Integer itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(null);

        cart.getItems().removeIf(item -> item.getItemId().equals(itemId));
        cartRepository.save(cart);
        log.info("Removed cart item {} for user: {}", itemId, userId);
        return buildCartResponse(cart);
    }

    @Override
    public CartResponse removeMultipleFromCart(String userId, List<Integer> itemIds) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(null);

        cart.getItems().removeIf(item -> itemIds.contains(item.getItemId()));
        cartRepository.save(cart);
        log.info("Removed {} cart items for user: {}", itemIds.size(), userId);
        return buildCartResponse(cart);
    }

    @Override
    public void emptyCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(null);

        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("Emptied cart for user: {}", userId);
    }

    private CartResponse buildCartResponse(Cart cart) {
        Set<CartItem> items = cart.getItems() != null ? cart.getItems() : Set.of();
        
        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> CartItemResponse.builder()
                        .itemId(item.getItemId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .thumbnail(item.getThumbnail())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice() * item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        Double totalPrice = itemResponses.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();

        Integer totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUserId())
                .items(itemResponses)
                .totalPrice(totalPrice)
                .totalItems(totalItems)
                .build();
    }
}
