package com.tam.order.service;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;

import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.dto.response.OrderResponse;
import com.tam.order.entity.Order;

public interface OrderService {
    Order saveOrder(OrderCreationRequest request);

    List<Order> getAllOrders(ObjectId customerId);

    Optional<Order> getOrderById(ObjectId orderId);

    Order updateOrderStatus(ObjectId orderId, String status);

    List<Order> getOrdersByStatus(ObjectId customerId, String status);

    boolean deleteOrder(ObjectId orderId);

    Optional<OrderResponse> getOrderResponse(ObjectId orderId);

    List<Order> getAll();
}
