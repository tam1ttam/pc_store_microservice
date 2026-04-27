package tam.order.dto.res;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import tam.order.constrant.OrderStatus;
import tam.order.constrant.PaymentMethod;
import tam.order.constrant.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    String orderId;
    String userId;
    OrderStatus status;
    String shippingAddress;
    PaymentMethod paymentMethod;
    PaymentStatus paymentStatus;
    String note;
    List<CartItemResponse> items;
    Double subtotal;
    Double shippingFee;
    Double discountAmount;
    Double totalAmount;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
