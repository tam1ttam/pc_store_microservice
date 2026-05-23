package com.tam.order.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(unique = true, nullable = false)
    String code;

    String description;

    @Column(name = "discount_amount")
    Double discountAmount;

    @Column(name = "discount_percent")
    Double discountPercent;

    @Column(name = "max_usage")
    Integer maxUsage;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    Integer usedCount = 0;

    @Column(name = "expired_at")
    LocalDateTime expiredAt;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_type")
    VoucherType voucherType;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_type", nullable = false)
    @Builder.Default
    VoucherAccessType accessType = VoucherAccessType.PUBLIC;

    @Column(name = "user_id")
    String userId;

    @Column(name = "max_usage_per_user")
    Integer maxUsagePerUser;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    List<OrderVoucher> orderVouchers = new ArrayList<>();
}
