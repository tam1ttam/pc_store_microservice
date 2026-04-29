package com.devteria.order.service.impl;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.order.dto.request.OrderCreationRequest;
import com.devteria.order.dto.response.OrderResponse;
import com.devteria.order.entity.Order;
import com.devteria.order.entity.OrderStatus;
import com.devteria.order.mapper.OrderMapper;
import com.devteria.order.repository.OrderRepository;
import com.devteria.order.service.OrderService;

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

    @Override
    public boolean saveOrder(OrderCreationRequest request) {
        // TODO: Gọi Product Service để cập nhật stock cho từng product trong order
        // ProductService.updateInStockProduct(item.getProductId(), item.getQuantity())

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

        orderRepository.save(order);

        // TODO: Gửi email xác nhận đơn hàng
        // emailService.sendOrderConfirmation(customer.getEmail(), "Order Confirmation",
        // emailBody);

        // TODO: Xóa cart sau khi tạo order
        // cartRepository.findByCustomerId(customerId).ifPresent(cart -> {
        // cart.getItems().clear();
        // cartRepository.save(cart);
        // });

        return true;
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
}
