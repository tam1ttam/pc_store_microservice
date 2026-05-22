package com.tam.order.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tam.order.entity.OrderVoucher;

public interface OrderVoucherRepository extends JpaRepository<OrderVoucher, Long> {
    Optional<OrderVoucher> findByOrderIdAndVoucherId(Long orderId, Long voucherId);

    boolean existsByOrderIdAndVoucherId(Long orderId, Long voucherId);
}
