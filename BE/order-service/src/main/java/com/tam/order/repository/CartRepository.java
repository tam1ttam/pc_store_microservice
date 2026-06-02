package com.tam.order.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tam.order.entity.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByIdentityUserId(String identityUserId);
}
