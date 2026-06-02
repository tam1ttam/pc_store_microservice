package com.tam.order.entity;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "voucher_usage", uniqueConstraints = @UniqueConstraint(columnNames = {"voucher_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "voucher_id", nullable = false)
    Long voucherId;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Builder.Default
    @Column(name = "usage_count", nullable = false)
    int usageCount = 0;
}
