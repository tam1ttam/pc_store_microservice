package tam.order.dto.req;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import tam.order.constrant.VoucherType;

import java.time.Instant;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateVoucherRequest {
    String code;
    String description;
    Double discountAmount;
    Double discountPercent;
    Integer maxUsage;
    Instant expiredAt;
    VoucherType voucherType; // STACKABLE, NON_STACKABLE
}
