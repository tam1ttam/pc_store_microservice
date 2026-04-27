package tam.order.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tam.order.dto.req.CreateOrderRequest;
import tam.order.dto.res.OrderPreviewResponse;
import tam.order.dto.res.OrderResponse;
import tam.order.entity.Cart;
import tam.order.entity.CartItem;
import tam.order.entity.Order;
import tam.order.constrant.OrderStatus;
import tam.order.repository.CartRepository;
import tam.order.repository.OrderRepository;
import tam.order.service.OrderService;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {

    CartRepository cartRepository;
    OrderRepository orderRepository;

    @Override
    public OrderPreviewResponse previewOrder(String userId, CreateOrderRequest request) {
        //TODO: Gọi user service để lấy thông tin address và validate
        //TODO: Gọi product service để validate stock
        //TODO: Gọi shipping service để tính shipping fee
        //TODO: Gọi voucher/discount service để apply discount

        Cart cart = cartRepository.findByUserId(userId)
                .orElse(null);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Tính toán giá
        Double subtotal = cart.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        Double shippingFee = 30000.0; //TODO: Replace với ShippingService call
        Double discount = 0.0; //TODO: Replace với VoucherService call
        Double total = subtotal + shippingFee - discount;

        return OrderPreviewResponse.builder()
                .subtotal(subtotal)
                .shippingFee(shippingFee)
//                .discount(discount)
                .totalAmount(total)
//                .items(cart.getItems().stream()
//                        .map(item -> new OrderPreviewResponse.ItemPreview(
//                                item.getProductId(),
//                                item.getProductName(),
//                                item.getQuantity(),
//                                item.getPrice()
//                        ))
//                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public OrderResponse createOrder(String userId, CreateOrderRequest request) {
        //TODO: Validate user payment method
        //TODO: Process payment via payment service
        //TODO: Update product stock via product service
        //TODO: Create shipment via shipping service
        //TODO: Send notification via notification service

        Cart cart = cartRepository.findByUserId(userId)
                .orElse(null);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Tạo order từ cart items
        Set<CartItem> orderItems = cart.getItems().stream()
                .map(item -> CartItem.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .thumbnail(item.getThumbnail())
                        .build())
                .collect(Collectors.toSet());

        double subtotal = orderItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        double shippingFee = 30000.0; //TODO: Calculate via ShippingService
        double total = subtotal + shippingFee;

        Order order = Order.builder()
                .userId(userId)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(tam.order.constrant.PaymentStatus.UNPAID)
                .status(OrderStatus.PENDING)
                .note(request.getNote())
                .orderItems(orderItems)
                .build();

        Order savedOrder = orderRepository.save(order);
        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("Created order {} for user: {}", savedOrder.getOrderId(), userId);
        return buildOrderResponse(savedOrder);
    }

    @Override
    public Page<OrderResponse> getOrders(String userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserId(userId, pageable);
        return orders.map(this::buildOrderResponse);
    }

    @Override
    public OrderResponse getOrderDetail(String orderId, String userId) {
        Order order = orderRepository.findByOrderIdAndUserId(orderId, userId);
        return buildOrderResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(String orderId, String userId) {
        Order order = orderRepository.findByOrderIdAndUserId(orderId, userId);

        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new RuntimeException("Can only cancel pending orders");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        log.info("Cancelled order {} for user: {}", orderId, userId);
        return buildOrderResponse(cancelledOrder);
    }

    private OrderResponse buildOrderResponse(Order order) {
        double total = order.getOrderItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum() + 30000.0;

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUserId())
//                .orderStatus(order.getStatus().toString())
                .paymentMethod(order.getPaymentMethod())
//                .paymentStatus(order.getPaymentStatus().toString())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
//                .totalPrice(total)
//                .createdAt(order.getCreatedAt())
//                .updatedAt(order.getUpdatedAt())
//                .items(order.getOrderItems().stream()
//                        .map(item -> new OrderResponse.ItemInfo(
//                                item.getProductId(),
//                                item.getProductName(),
//                                item.getQuantity(),
//                                item.getPrice()
//                        ))
//                        .collect(Collectors.toList()))
                .build();
    }
}
