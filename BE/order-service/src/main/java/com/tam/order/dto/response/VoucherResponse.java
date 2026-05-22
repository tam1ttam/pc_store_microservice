package com.tam.order.dto.response;

import java.time.LocalDateTime;

import com.tam.order.entity.VoucherType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherResponse {
    Long id;
    String code;
    String description;
    Double discountAmount;
    Double discountPercent;
    Integer maxUsage;
    Integer usedCount;
    LocalDateTime expiredAt;
    Boolean isActive;
    VoucherType voucherType;
}
