package com.tam.order.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.tam.order.dto.request.CheckoutRequest;
import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.dto.response.OrderResponse;
import com.tam.order.dto.response.OrderStatsResponse;
import com.tam.order.dto.response.ProductAnalyticsResponse;
import com.tam.order.entity.Order;
import com.tam.order.entity.OrderStatus;

public interface OrderService {
    OrderResponse checkout(String identityUserId, CheckoutRequest request);

    Optional<OrderResponse> getOrderById(Long orderId);

    List<OrderResponse> getOrdersFiltered(
            String identityUserId, OrderStatus status, LocalDateTime from, LocalDateTime to);

    Order updateOrderStatus(Long orderId, String status);

    boolean cancelOrder(Long orderId, String identityUserId);

    boolean deleteOrder(Long orderId);

    OrderStatsResponse getStats();

    Order saveOrder(OrderCreationRequest request);

    List<Order> getAll();

    Page<Order> getAllOrders(Pageable pageable);

    List<ProductAnalyticsResponse> getProductAnalytics();

    void confirmPayment(Long orderId, double amount);

    List<Order> getPendingOrders();

    Order confirmOrder(Long orderId);
}
