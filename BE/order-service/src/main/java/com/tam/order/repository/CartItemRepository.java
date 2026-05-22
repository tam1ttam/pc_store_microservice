package com.tam.order.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tam.order.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductId(Long cartId, String productId);
}
