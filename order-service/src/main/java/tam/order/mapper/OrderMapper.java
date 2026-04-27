package tam.order.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tam.order.constrant.OrderStatus;
import tam.order.constrant.PaymentStatus;
import tam.order.dto.req.CreateOrderRequest;
import tam.order.dto.res.CartItemResponse;
import tam.order.dto.res.OrderResponse;
import tam.order.entity.Order;
import tam.order.entity.Voucher;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final CartItemMapper cartItemMapper;

    public OrderResponse toResponse(Order order) {
        List<CartItemResponse> items = cartItemMapper.toResponseList(order.getOrderItems());

        double subtotal = items.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();

        double discountAmount = order.getOrderVouchers() == null ? 0 :
                order.getOrderVouchers().stream()
                        .mapToDouble(ov -> {
                            Voucher v = ov.getVoucher();
                            if (v.getDiscountAmount() != null) return v.getDiscountAmount();
                            if (v.getDiscountPercent() != null) return subtotal * v.getDiscountPercent() / 100;
                            return 0;
                        })
                        .sum();

        double shippingFee = 0; // tính sau hoặc lấy từ field nếu có
        double totalAmount = subtotal - discountAmount + shippingFee;

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .note(order.getNote())
                .items(items)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .createdAt(order.getCreatedAt() != null ?
                        LocalDateTime.ofInstant(order.getCreatedAt(), ZoneId.systemDefault()) : null)
                .updatedAt(order.getUpdatedAt() != null ?
                        LocalDateTime.ofInstant(order.getUpdatedAt(), ZoneId.systemDefault()) : null)
                .build();
    }

    public Order toEntity(CreateOrderRequest request, String userId) {
        return Order.builder()
                .userId(userId)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.UNPAID)
                .status(OrderStatus.PENDING)
                .note(request.getNote())
                .build();
    }
}