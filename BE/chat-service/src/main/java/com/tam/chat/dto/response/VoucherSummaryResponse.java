package com.tam.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class VoucherSummaryResponse {
    Long id;
    String code;
    String description;
    Double discountAmount;
    Double discountPercent;
    Integer maxUsage;
    Integer usedCount;
    String expiredAt;
    Boolean isActive;
    String voucherType;
    String accessType;
    String userId;
    Integer maxUsagePerUser;
}
