package tam.order.dto.res;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import tam.order.constrant.VoucherType;

import java.time.Instant;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherResponse {
    String voucherId;
    String code;
    String description;
    Double discountAmount;
    Double discountPercent;
    Integer maxUsage;
    Integer usedCount;
    Instant expiredAt;
    Boolean isActive;
    VoucherType voucherType;
}
