package com.tam.order.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tam.order.entity.VoucherUsage;

public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    Optional<VoucherUsage> findByVoucherIdAndUserId(Long voucherId, String userId);
}
