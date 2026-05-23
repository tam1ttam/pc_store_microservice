package com.tam.order.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;

import com.tam.order.entity.VoucherAccessType;
import com.tam.order.entity.VoucherType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherRequest {
    @NotBlank
    String code;

    String description;
    Double discountAmount;
    Double discountPercent;
    Integer maxUsage;
    LocalDateTime expiredAt;
    Boolean isActive;
    VoucherType voucherType;
    VoucherAccessType accessType;
    String userId;
    Integer maxUsagePerUser;
}
