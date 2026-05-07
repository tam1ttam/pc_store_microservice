package com.tam.order.service.impl;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.event.dto.NotificationEvent;
import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.dto.response.OrderResponse;
import com.tam.order.entity.Order;
import com.tam.order.entity.OrderStatus;
import com.tam.order.event.OrderCreatedEvent;
import com.tam.order.event.OrderItemEvent;
import com.tam.order.mapper.OrderMapper;
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
    OrderMapper orderMapper;
    KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public Order saveOrder(OrderCreationRequest request) {
        if (request.getOrderDate() == null) {
            request.setOrderDate(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                    .format(LocalDateTime.now(ZoneId.systemDefault())));
        }

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .shipAddress(request.getShipAddress())
                .items(request.getItems())
                .totalPrice(request.getTotalPrice())
                .orderDate(request.getOrderDate())
                .orderStatus(OrderStatus.valueOf(request.getOrderStatus()))
                .isPaid(request.getIsPaid().equals("true"))
                .build();

        order = orderRepository.save(order);
        log.info("Order saved: orderId={}, customerId={}", order.getId(), order.getCustomerId());

        publishOrderCreatedEvent(order, request);
        publishOrderConfirmationEmail(order, request);

        return order;
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

            OrderCreatedEvent event = OrderCreatedEvent.builder()
                    .orderId(order.getId().toString())
                    .customerId(order.getCustomerId())
                    .customerEmail(request.getCustomerEmail())
                    .customerName(request.getCustomerName())
                    .items(itemEvents)
                    .totalPrice(order.getTotalPrice())
                    .orderDate(order.getOrderDate())
                    .shipAddress(order.getShipAddress())
                    .build();

            kafkaTemplate.send("order.created", event);
            log.info("Published order.created event for orderId={}", order.getId());
        } catch (Exception e) {
            log.error("Failed to publish order.created event for orderId={}: {}", order.getId(), e.getMessage());
        }
    }

    private void publishOrderConfirmationEmail(Order order, OrderCreationRequest request) {
        if (request.getCustomerEmail() == null || request.getCustomerEmail().isBlank()) {
            log.warn("No customerEmail in request, skipping order confirmation email for orderId={}", order.getId());
            return;
        }

        try {
            String name = request.getCustomerName() != null ? request.getCustomerName() : request.getCustomerId();
            String body = String.format(
                    "Xin chào %s, đơn hàng #%s của bạn đã được đặt thành công. Tổng tiền: %.0f VNĐ. Địa chỉ giao: %s.",
                    name, order.getId(), order.getTotalPrice(), order.getShipAddress());

            NotificationEvent notification = NotificationEvent.builder()
                    .channel("EMAIL")
                    .recipient(request.getCustomerEmail())
                    .subject("Xác nhận đơn hàng #" + order.getId())
                    .body(body)
                    .build();

            kafkaTemplate.send("notification-delivery", notification);
            log.info("Published order confirmation email for orderId={}", order.getId());
        } catch (Exception e) {
            log.error("Failed to publish notification for orderId={}: {}", order.getId(), e.getMessage());
        }
    }

    @Override
    public List<Order> getAllOrders(ObjectId customerId) {
        return orderRepository.findAllByCustomerId(customerId);
    }

    @Override
    public Optional<Order> getOrderById(ObjectId orderId) {
        return orderRepository.findById(orderId);
    }

    @Override
    public Order updateOrderStatus(ObjectId orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(OrderStatus.valueOf(status));
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getOrdersByStatus(ObjectId customerId, String status) {
        return orderRepository.findByCustomerIdAndStatus(customerId, status);
    }

    @Override
    public boolean deleteOrder(ObjectId orderId) {
        orderRepository.deleteById(orderId);
        return true;
    }

    @Override
    public Optional<OrderResponse> getOrderResponse(ObjectId orderId) {
        return orderRepository.findById(orderId).map(orderMapper::toOrderResponse);
    }

    @Override
    public List<Order> getAll() {
        List<Order> result;
        result = orderRepository.findAll();
        return result;
    }
}
