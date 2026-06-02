package com.tam.order.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tam.order.entity.Order;
import com.tam.order.entity.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByIdentityUserId(String identityUserId);

    List<Order> findByCustomerId(String customerId);

    List<Order> findByCustomerIdAndOrderStatus(String customerId, OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.identityUserId = :uid"
            + " AND (:status IS NULL OR o.orderStatus = :status)"
            + " AND (:from IS NULL OR o.orderDate >= :from)"
            + " AND (:to IS NULL OR o.orderDate <= :to)"
            + " ORDER BY o.orderDate DESC")
    List<Order> findFiltered(
            @Param("uid") String identityUserId,
            @Param("status") OrderStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
