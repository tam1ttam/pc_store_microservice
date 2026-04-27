package tam.order.dto.req;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import tam.order.constrant.PaymentMethod;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateOrderRequest {
    String userId;
    List<Integer> cartItemIds;      // danh sách item được chọn từ giỏ
    String shippingAddress;
    PaymentMethod paymentMethod;    // COD, VNPAY, MOMO
    String note;
    String voucherCode;             // mã giảm giá (nếu có)
}
