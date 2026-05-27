package com.tam.order.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.event.dto.NotificationEvent;
import com.devteria.event.dto.StoreNotificationEvent;
import com.tam.order.dto.request.CheckoutRequest;
import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.dto.response.OrderItemResponse;
import com.tam.order.dto.response.OrderResponse;
import com.tam.order.dto.response.OrderStatsResponse;
import com.tam.order.entity.Cart;
import com.tam.order.entity.CartItem;
import com.tam.order.entity.Order;
import com.tam.order.entity.OrderItem;
import com.tam.order.entity.OrderStatus;
import com.tam.order.event.OrderCreatedEvent;
import com.tam.order.event.OrderItemEvent;
import com.tam.order.repository.CartRepository;
import com.tam.order.repository.OrderRepository;
import com.tam.order.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    OrderRepository orderRepository;
    CartRepository cartRepository;
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public OrderResponse checkout(String identityUserId, CheckoutRequest request) {
        Cart cart = cartRepository
                .findByIdentityUserId(identityUserId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> selectedItems = cart.getItems().stream()
                .filter(i -> request.getCartItemIds().contains(i.getId()))
                .toList();

        if (selectedItems.isEmpty()) {
            throw new RuntimeException("No valid cart items selected");
        }

        double total = selectedItems.stream()
                .mapToDouble(i -> i.getProductPrice() * i.getQuantity())
                .sum();

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .identityUserId(identityUserId)
                .shipAddress(request.getShipAddress())
                .orderDate(LocalDateTime.now())
                .currency("VND")
                .totalPrice(total)
                .isPaid(false)
                .orderStatus(OrderStatus.PENDING) // Changed from DELIVERING to PENDING for Saga
                .build();

        for (CartItem ci : selectedItems) {
            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .productId(ci.getProductId())
                    .productName(ci.getProductName())
                    .productPrice(ci.getProductPrice())
                    .quantity(ci.getQuantity())
                    .build();
            order.getItems().add(oi);
        }

        order = orderRepository.save(order);
        log.info("Checkout order saved (PENDING): orderId={}", order.getId());

        cart.getItems().removeAll(selectedItems);
        cartRepository.save(cart);

        // Start Saga
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", order.getId());
        payload.put("userId", identityUserId);
        payload.put(
                "items",
                order.getItems().stream()
                        .map(i -> Map.of("productId", i.getProductId(), "quantity", i.getQuantity()))
                        .toList());

        kafkaTemplate.send("checkout.started", payload);

        return toResponse(order);
    }

    @Override
    public Order saveOrder(OrderCreationRequest request) {
        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .identityUserId(request.getIdentityUserId())
                .shipAddress(request.getShipAddress())
                .orderDate(LocalDateTime.now())
                .totalPrice(request.getTotalPrice())
                .orderStatus(
                        request.getOrderStatus() != null
                                ? OrderStatus.valueOf(request.getOrderStatus())
                                : OrderStatus.DELIVERING)
                .isPaid("true".equalsIgnoreCase(request.getIsPaid()))
                .build();

        if (request.getItems() != null) {
            for (var ri : request.getItems()) {
                OrderItem oi = OrderItem.builder()
                        .order(order)
                        .productId(ri.getProductId())
                        .productName(ri.getProductName())
                        .productPrice(ri.getProductPrice())
                        .quantity(ri.getQuantity())
                        .build();
                order.getItems().add(oi);
            }
        }

        order = orderRepository.save(order);
        log.info("Order saved (legacy): orderId={}", order.getId());
        publishOrderCreatedEvent(order, request);
        return order;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrderResponse> getOrderById(Long orderId) {
        return orderRepository.findById(orderId).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersFiltered(
            String identityUserId, OrderStatus status, LocalDateTime from, LocalDateTime to) {
        return orderRepository.findFiltered(identityUserId, status, from, to).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        OrderStatus newStatus = OrderStatus.valueOf(status);
        order.setOrderStatus(newStatus);
        order = orderRepository.save(order);
        publishOrderStatusNotification(order, newStatus);
        return order;
    }

    @Override
    public boolean cancelOrder(Long orderId, String identityUserId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getIdentityUserId().equals(identityUserId)) {
            throw new RuntimeException("Not authorized to cancel this order");
        }
        if (order.getOrderStatus() != OrderStatus.DELIVERING) {
            throw new RuntimeException("Order cannot be cancelled at this stage");
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        publishOrderStatusNotification(order, OrderStatus.CANCELLED);
        return true;
    }

    @Override
    public boolean deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderStatsResponse getStats() {
        List<Order> all = orderRepository.findAll();
        long total = all.size();
        double revenue = all.stream().mapToDouble(Order::getTotalPrice).sum();
        long paid = all.stream().filter(Order::isPaid).count();
        long delivering = all.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERING)
                .count();
        long delivered = all.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED)
                .count();
        long cancelled = all.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.CANCELLED)
                .count();
        return OrderStatsResponse.builder()
                .totalOrders(total)
                .totalRevenue(revenue)
                .paidOrders(paid)
                .pendingOrders(delivering)
                .completedOrders(delivered)
                .cancelledOrders(cancelled)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .productPrice(i.getProductPrice())
                        .quantity(i.getQuantity())
                        .subtotal(i.getProductPrice() * i.getQuantity())
                        .build())
                .toList();
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .identityUserId(order.getIdentityUserId())
                .shipAddress(order.getShipAddress())
                .orderDate(order.getOrderDate())
                .currency(order.getCurrency())
                .totalPrice(order.getTotalPrice())
                .isPaid(order.isPaid())
                .orderStatus(order.getOrderStatus())
                .items(items)
                .build();
    }

    private void publishCheckoutEvents(Order order, CheckoutRequest request) {
        try {
            List<OrderItemEvent> itemEvents = order.getItems().stream()
                    .map(i -> OrderItemEvent.builder()
                            .productId(i.getProductId())
                            .quantity(i.getQuantity())
                            .build())
                    .toList();
            kafkaTemplate.send(
                    "order.created",
                    OrderCreatedEvent.builder()
                            .orderId(order.getId().toString())
                            .customerId(order.getCustomerId())
                            .customerEmail(request.getCustomerEmail())
                            .customerName(request.getCustomerName())
                            .items(itemEvents)
                            .totalPrice(order.getTotalPrice())
                            .orderDate(order.getOrderDate().toString())
                            .shipAddress(order.getShipAddress())
                            .build());
        } catch (Exception e) {
            log.error("Failed to publish order.created for orderId={}: {}", order.getId(), e.getMessage());
        }

        if (order.getIdentityUserId() != null && !order.getIdentityUserId().isBlank()) {
            try {
                kafkaTemplate.send(
                        "notification.store",
                        StoreNotificationEvent.builder()
                                .userId(order.getIdentityUserId())
                                .type("ORDER_PLACED")
                                .title("Đặt hàng thành công")
                                .body(String.format(
                                        "Đơn hàng #%s của bạn đã được đặt. Tổng tiền: %.0f VNĐ.",
                                        order.getId(), order.getTotalPrice()))
                                .isSystem(false)
                                .actionRequired(false)
                                .referenceId(order.getId().toString())
                                .referenceType("ORDER")
                                .build());
            } catch (Exception e) {
                log.warn("Failed to publish ORDER_PLACED for orderId={}", order.getId(), e);
            }
        }
    }

    private void publishOrderCreatedEvent(Order order, OrderCreationRequest request) {
        try {
            List<OrderItemEvent> itemEvents = order.getItems() == null
                    ? List.of()
                    : order.getItems().stream()
                            .map(i -> OrderItemEvent.builder()
                                    .productId(i.getProductId())
                                    .quantity(i.getQuantity())
                                    .build())
                            .toList();
            kafkaTemplate.send(
                    "order.created",
                    OrderCreatedEvent.builder()
                            .orderId(order.getId().toString())
                            .customerId(order.getCustomerId())
                            .customerEmail(request.getCustomerEmail())
                            .customerName(request.getCustomerName())
                            .items(itemEvents)
                            .totalPrice(order.getTotalPrice())
                            .orderDate(
                                    order.getOrderDate() != null
                                            ? order.getOrderDate().toString()
                                            : "")
                            .shipAddress(order.getShipAddress())
                            .build());

            if (request.getIdentityUserId() != null
                    && !request.getIdentityUserId().isBlank()) {
                kafkaTemplate.send(
                        "notification.store",
                        StoreNotificationEvent.builder()
                                .userId(request.getIdentityUserId())
                                .type("ORDER_PLACED")
                                .title("Đặt hàng thành công")
                                .body(String.format(
                                        "Đơn hàng #%s của bạn đã được đặt. Tổng tiền: %.0f VNĐ.",
                                        order.getId(), order.getTotalPrice()))
                                .isSystem(false)
                                .actionRequired(false)
                                .referenceId(order.getId().toString())
                                .referenceType("ORDER")
                                .build());
            }
        } catch (Exception e) {
            log.error("Failed to publish events for orderId={}: {}", order.getId(), e.getMessage());
        }

        if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
            try {
                String name = request.getCustomerName() != null ? request.getCustomerName() : request.getCustomerId();
                kafkaTemplate.send(
                        "notification-delivery",
                        NotificationEvent.builder()
                                .channel("EMAIL")
                                .recipient(request.getCustomerEmail())
                                .subject("Xác nhận đơn hàng #" + order.getId())
                                .body(String.format(
                                        "Xin chào %s, đơn hàng #%s đã được đặt thành công. Tổng tiền: %.0f VNĐ.",
                                        name, order.getId(), order.getTotalPrice()))
                                .build());
            } catch (Exception e) {
                log.error("Failed to publish email for orderId={}", order.getId(), e);
            }
        }
    }

    private void publishOrderStatusNotification(Order order, OrderStatus status) {
        if (order.getIdentityUserId() == null || order.getIdentityUserId().isBlank()) return;
        String body =
                switch (status) {
                    case DELIVERING -> String.format("Đơn hàng #%s đang được giao đến bạn.", order.getId());
                    case DELIVERED -> String.format("Đơn hàng #%s đã được giao thành công.", order.getId());
                    case CANCELLED -> String.format("Đơn hàng #%s đã bị huỷ.", order.getId());
                    default -> String.format("Trạng thái đơn hàng #%s đã thay đổi.", order.getId());
                };
        try {
            kafkaTemplate.send(
                    "notification.store",
                    StoreNotificationEvent.builder()
                            .userId(order.getIdentityUserId())
                            .type("ORDER_STATUS_CHANGED")
                            .title(status.getStatus())
                            .body(body)
                            .isSystem(false)
                            .actionRequired(false)
                            .referenceId(order.getId().toString())
                            .referenceType("ORDER")
                            .build());
        } catch (Exception e) {
            log.warn("Failed to publish ORDER_STATUS_CHANGED for orderId={}", order.getId(), e);
        }
    }
}
