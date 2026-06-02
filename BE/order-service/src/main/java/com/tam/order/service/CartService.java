package com.tam.order.service;

import com.tam.order.dto.request.CartItemRequest;
import com.tam.order.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(String identityUserId);

    CartResponse upsertItem(String identityUserId, CartItemRequest request);

    CartResponse deleteItem(String identityUserId, Long itemId);

    void clearCart(String identityUserId);

    void createCartForUser(String identityUserId);
}
