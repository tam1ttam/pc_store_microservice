package com.tam.order.service;

import java.util.List;
import java.util.Optional;

import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.dto.response.OrderResponse;
import com.tam.order.entity.Order;

public interface OrderService {
    Order saveOrder(OrderCreationRequest request);

    List<Order> getAllOrders(String customerId);

    Optional<Order> getOrderById(String orderId);

    Order updateOrderStatus(String orderId, String status);

    List<Order> getOrdersByStatus(String customerId, String status);

    boolean deleteOrder(String orderId);

    Optional<OrderResponse> getOrderResponse(String orderId);

    List<Order> getAll();

    // 👉 THÊM DÒNG NÀY VÀO:
    boolean deleteItemInCart(String customerId, String productId);
}