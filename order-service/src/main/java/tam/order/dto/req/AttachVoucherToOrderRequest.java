package tam.order.dto.req;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttachVoucherToOrderRequest {
    String orderId;
    String voucherCode;
}
