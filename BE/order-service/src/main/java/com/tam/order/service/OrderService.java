package com.devteria.order.service;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;

import com.devteria.order.dto.request.OrderCreationRequest;
import com.devteria.order.dto.response.OrderResponse;
import com.devteria.order.entity.Order;

public interface OrderService {
    boolean saveOrder(OrderCreationRequest request);

    List<Order> getAllOrders(ObjectId customerId);

    Optional<Order> getOrderById(ObjectId orderId);

    Order updateOrderStatus(ObjectId orderId, String status);

    List<Order> getOrdersByStatus(ObjectId customerId, String status);

    boolean deleteOrder(ObjectId orderId);

    Optional<OrderResponse> getOrderResponse(ObjectId orderId);
}
