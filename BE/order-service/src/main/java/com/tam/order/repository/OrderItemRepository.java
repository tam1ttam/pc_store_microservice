package com.tam.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tam.order.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {}
