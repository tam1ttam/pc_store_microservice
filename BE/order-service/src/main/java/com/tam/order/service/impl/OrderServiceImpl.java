package com.tam.order.service.impl;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

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
        log.info(
                "👉 BƯỚC 1 - NHẬN REQUEST THÊM GIỎ HÀNG: customerId={}, orderStatus={}, items={}",
                request.getCustomerId(),
                request.getOrderStatus(),
                request.getItems() != null ? request.getItems().size() + " món" : "0 món");

        if (request.getOrderDate() == null) {
            request.setOrderDate(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                    .format(LocalDateTime.now(ZoneId.systemDefault())));
        }

        String statusSafe =
                (request.getOrderStatus() != null && !request.getOrderStatus().isBlank())
                        ? request.getOrderStatus()
                        : "CART";
        boolean isPaidSafe =
                request.getIsPaid() != null && request.getIsPaid().toString().equalsIgnoreCase("true");

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .shipAddress(request.getShipAddress())
                .items(request.getItems())
                .totalPrice(request.getTotalPrice())
                .orderDate(request.getOrderDate())
                .orderStatus(OrderStatus.valueOf(statusSafe))
                .isPaid(isPaidSafe)
                .build();

        order = orderRepository.save(order);

        log.info(
                "👉 BƯỚC 2 - ĐÃ LƯU XUỐNG MONGODB THÀNH CÔNG: orderId={}, của customerId={}",
                order.getId(),
                order.getCustomerId());

        publishOrderCreatedEvent(order, request);
        publishOrderConfirmationEmail(order, request);

        // 👉 Nếu đây là một đơn hàng thực sự (không phải CART), ta sẽ dọn sạch giỏ hàng của user
        if (!OrderStatus.CART.equals(order.getOrderStatus())) {
            String customerIdStr = order.getCustomerId();
            orderRepository
                    .findFirstByCustomerIdAndOrderStatus(customerIdStr, OrderStatus.CART)
                    .ifPresent(cart -> {
                        cart.setItems(new java.util.ArrayList<>());
                        orderRepository.save(cart);
                        log.info("Đã xóa sạch giỏ hàng của customerId={} sau khi đặt hàng", customerIdStr);
                    });
        }

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
                    .orderId(order.getId() != null ? order.getId().toString() : "")
                    .customerId(order.getCustomerId())
                    .customerEmail(request.getCustomerEmail())
                    .customerName(request.getCustomerName())
                    .items(itemEvents)
                    .totalPrice(order.getTotalPrice())
                    .orderDate(order.getOrderDate())
                    .shipAddress(order.getShipAddress())
                    .build();

            kafkaTemplate.send("order.created", event);
        } catch (Exception e) {
            log.error("Failed to publish order.created event for orderId={}: {}", order.getId(), e.getMessage());
        }
    }

    private void publishOrderConfirmationEmail(Order order, OrderCreationRequest request) {
        if (request.getCustomerEmail() == null || request.getCustomerEmail().isBlank()) {
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
        } catch (Exception e) {
            log.error("Failed to publish notification for orderId={}: {}", order.getId(), e.getMessage());
        }
    }

    @Override
    public List<Order> getAllOrders(String customerId) {
        log.info("👉 TÌM KIẾM: Frontend đang yêu cầu lấy TẤT CẢ giỏ hàng của customerId={}", customerId);
        List<Order> results = orderRepository.findAllByCustomerId(customerId);
        log.info("👉 KẾT QUẢ TÌM ĐƯỢC: {} giỏ hàng", results.size());
        return results;
    }

    @Override
    public Optional<Order> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }

    @Override
    public Order updateOrderStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(OrderStatus.valueOf(status));
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getOrdersByStatus(String customerId, String status) {
        log.info("👉 TÌM KIẾM TRẠNG THÁI: Lấy giỏ hàng '{}' của customerId={}", status, customerId);
        List<Order> results = orderRepository.findByCustomerIdAndOrderStatus(customerId, status);
        log.info("👉 KẾT QUẢ TÌM ĐƯỢC: {} giỏ hàng", results.size());
        return results;
    }

    @Override
    public boolean deleteOrder(String orderId) {
        orderRepository.deleteById(orderId);
        return true;
    }

    @Override
    public Optional<OrderResponse> getOrderResponse(String orderId) {
        return orderRepository.findById(orderId).map(orderMapper::toOrderResponse);
    }

    @Override
    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    // --- HÀM XÓA SẢN PHẨM TRONG GIỎ HÀNG ---
    @Override
    public boolean deleteItemInCart(String customerId, String productId) {
        log.info("Bắt đầu xử lý xóa sản phẩm {} trong giỏ hàng của khách {}", productId, customerId);

        List<Order> carts = orderRepository.findByCustomerIdAndOrderStatus(customerId, OrderStatus.CART.name());
        boolean anyRemoved = false;

        for (Order cart : carts) {
            if (cart.getItems() != null) {
                boolean removed =
                        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
                if (removed) {
                    orderRepository.save(cart);
                    log.info("Xóa thành công sản phẩm {} khỏi MongoDB orderId={}", productId, cart.getId());
                    anyRemoved = true;
                }
            }
        }

        if (!anyRemoved) {
            log.warn("Không tìm thấy sản phẩm {} hoặc giỏ hàng để xóa cho khách {}", productId, customerId);
        }
        return anyRemoved;
    }

    // --- HÀM TĂNG SỐ LƯỢNG SẢN PHẨM TRONG GIỎ HÀNG ---
    @Override
    public boolean increaseItemQuantity(String customerId, String productId) {
        log.info("Tăng số lượng sản phẩm {} cho khách hàng {}", productId, customerId);
        List<Order> carts = orderRepository.findByCustomerIdAndOrderStatus(customerId, OrderStatus.CART.name());
        boolean updated = false;

        for (Order cart : carts) {
            if (cart.getItems() != null) {
                for (com.tam.order.entity.CartItem item : cart.getItems()) {
                    if (item.getProductId().equals(productId)) {
                        item.setQuantity(item.getQuantity() + 1);
                        orderRepository.save(cart);
                        log.info("Tăng thành công số lượng sản phẩm {} trong orderId={}", productId, cart.getId());
                        updated = true;
                        break;
                    }
                }
            }
            if (updated) break;
        }
        if (!updated) log.warn("Không tìm thấy sản phẩm {} để tăng số lượng", productId);
        return updated;
    }

    // --- HÀM GIẢM SỐ LƯỢNG SẢN PHẨM TRONG GIỎ HÀNG ---
    @Override
    public boolean decreaseItemQuantity(String customerId, String productId) {
        log.info("Giảm số lượng sản phẩm {} cho khách hàng {}", productId, customerId);
        List<Order> carts = orderRepository.findByCustomerIdAndOrderStatus(customerId, OrderStatus.CART.name());
        boolean updated = false;

        for (Order cart : carts) {
            if (cart.getItems() != null) {
                for (com.tam.order.entity.CartItem item : cart.getItems()) {
                    if (item.getProductId().equals(productId)) {
                        if (item.getQuantity() > 1) {
                            item.setQuantity(item.getQuantity() - 1);
                            orderRepository.save(cart);
                            log.info("Giảm thành công số lượng sản phẩm {} trong orderId={}", productId, cart.getId());
                            updated = true;
                            break;
                        }
                    }
                }
            }
            if (updated) break;
        }
        if (!updated) log.warn("Không tìm thấy sản phẩm {} để giảm số lượng", productId);
        return updated;
    }
}
