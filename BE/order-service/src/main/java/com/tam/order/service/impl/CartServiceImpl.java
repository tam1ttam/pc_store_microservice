package com.tam.order.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tam.order.dto.request.CartItemRequest;
import com.tam.order.dto.response.CartItemResponse;
import com.tam.order.dto.response.CartResponse;
import com.tam.order.entity.Cart;
import com.tam.order.entity.CartItem;
import com.tam.order.repository.CartItemRepository;
import com.tam.order.repository.CartRepository;
import com.tam.order.service.CartService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CartServiceImpl implements CartService {

    CartRepository cartRepository;
    CartItemRepository cartItemRepository;

    @Override
    public CartResponse getCart(String identityUserId) {
        Cart cart = cartRepository
                .findByIdentityUserId(identityUserId)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder().identityUserId(identityUserId).build()));
        return toResponse(cart);
    }

    @Override
    public CartResponse upsertItem(String identityUserId, CartItemRequest request) {
        Cart cart = cartRepository
                .findByIdentityUserId(identityUserId)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder().identityUserId(identityUserId).build()));

        cartItemRepository
                .findByCartIdAndProductId(cart.getId(), request.getProductId())
                .ifPresentOrElse(
                        existing -> {
                            existing.setQuantity(request.getQuantity());
                            existing.setProductName(request.getProductName());
                            existing.setProductPrice(request.getProductPrice());
                            existing.setProductImage(request.getProductImage());
                            cartItemRepository.save(existing);
                        },
                        () -> {
                            CartItem item = CartItem.builder()
                                    .cart(cart)
                                    .productId(request.getProductId())
                                    .productName(request.getProductName())
                                    .productPrice(request.getProductPrice())
                                    .productImage(request.getProductImage())
                                    .quantity(request.getQuantity())
                                    .build();
                            cartItemRepository.save(item);
                        });

        return toResponse(cartRepository.findByIdentityUserId(identityUserId).orElseThrow());
    }

    @Override
    public CartResponse deleteItem(String identityUserId, Long itemId) {
        Cart cart = cartRepository
                .findByIdentityUserId(identityUserId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        boolean removed = cart.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            log.warn("CartItem {} not found in cart {}", itemId, cart.getId());
        }
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Override
    public void clearCart(String identityUserId) {
        cartRepository.findByIdentityUserId(identityUserId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    @Override
    public void createCartForUser(String identityUserId) {
        if (cartRepository.findByIdentityUserId(identityUserId).isEmpty()) {
            cartRepository.save(Cart.builder().identityUserId(identityUserId).build());
            log.info("Created cart for user {}", identityUserId);
        }
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(i -> CartItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .productPrice(i.getProductPrice())
                        .productImage(i.getProductImage())
                        .quantity(i.getQuantity())
                        .subtotal(i.getProductPrice() * i.getQuantity())
                        .build())
                .toList();
        double total = itemResponses.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();
        int count =
                itemResponses.stream().mapToInt(CartItemResponse::getQuantity).sum();
        return CartResponse.builder()
                .id(cart.getId())
                .identityUserId(cart.getIdentityUserId())
                .items(itemResponses)
                .totalItems(count)
                .totalPrice(total)
                .build();
    }
}
