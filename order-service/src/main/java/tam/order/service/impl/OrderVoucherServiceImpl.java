package tam.order.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tam.order.dto.req.AttachVoucherToOrderRequest;
import tam.order.dto.req.RemoveVoucherFromOrderRequest;
import tam.order.dto.res.CartItemResponse;
import tam.order.dto.res.OrderResponse;
import tam.order.entity.Order;
import tam.order.entity.OrderVoucher;
import tam.order.entity.OrderVoucherID;
import tam.order.entity.Voucher;
import tam.order.repository.OrderRepository;
import tam.order.repository.OrderVoucherRepository;
import tam.order.repository.VoucherRepository;
import tam.order.service.OrderVoucherService;

import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderVoucherServiceImpl implements OrderVoucherService {

    OrderRepository orderRepository;
    VoucherRepository voucherRepository;
    OrderVoucherRepository orderVoucherRepository;

    @Override
    public OrderResponse attachVoucherToOrder(String userId, AttachVoucherToOrderRequest request) {
        Order order = orderRepository.findByOrderIdAndUserId(request.getOrderId(), userId);

        Voucher voucher = voucherRepository.findByCode(request.getVoucherCode())
                .orElseThrow(() -> new RuntimeException("Voucher code not found"));

        if (!voucher.getIsActive()) {
            throw new RuntimeException("Voucher is not active");
        }

        if (voucher.getAmount() >= voucher.getMaxUsage()) {
            throw new RuntimeException("Voucher usage limit exceeded");
        }

        // Kiểm tra voucher đã attach chưa
        boolean alreadyAttached = orderVoucherRepository.existsById(
                OrderVoucherID.builder()
                        .orderId(order.getOrderId())
                        .voucherId(voucher.getVoucherId())
                        .build()
        );

        if (alreadyAttached) {
            throw new RuntimeException("Voucher already attached to this order");
        }

        // Attach voucher
        OrderVoucher orderVoucher = OrderVoucher.builder()
                .id(OrderVoucherID.builder()
                        .orderId(order.getOrderId())
                        .voucherId(voucher.getVoucherId())
                        .build())
                .order(order)
                .voucher(voucher)
                .build();

        orderVoucherRepository.save(orderVoucher);
        voucher.setAmount(voucher.getAmount() + 1);
        voucherRepository.save(voucher);

        log.info("Attached voucher {} to order {}", voucher.getCode(), order.getOrderId());
        return buildOrderResponse(order);
    }

    @Override
    public OrderResponse removeVoucherFromOrder(String userId, RemoveVoucherFromOrderRequest request) {
        Order order = orderRepository.findByOrderIdAndUserId(request.getOrderId(), userId);

        Voucher voucher = voucherRepository.findById(request.getVoucherId())
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        OrderVoucherID id = OrderVoucherID.builder()
                .orderId(order.getOrderId())
                .voucherId(voucher.getVoucherId())
                .build();

        OrderVoucher orderVoucher = orderVoucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order voucher mapping not found"));

        orderVoucherRepository.delete(orderVoucher);
        voucher.setAmount(Math.max(0, voucher.getAmount() - 1));
        voucherRepository.save(voucher);

        log.info("Removed voucher {} from order {}", voucher.getCode(), order.getOrderId());
        return buildOrderResponse(order);
    }

    private OrderResponse buildOrderResponse(Order order) {
        double total = order.getOrderItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum() + 30000.0;

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
//                .totalAmount()
//                .createdAt(order.getCreatedAt())
//                .updatedAt(order.getUpdatedAt())
//                .items(order.getOrderItems().stream()
//                        .map(item -> new CartItemResponse()
//                                .
//                        ))
//                        .collect(Collectors.toList()))
                .build();
    }
}
