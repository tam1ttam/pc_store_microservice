package tam.order.dto.res;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderPreviewResponse {
    List<CartItemResponse> items;
    Double subtotal;
    Double shippingFee;
    Double discountAmount;  // dựa trên voucherCode
    Double totalAmount;
    String message;
}
