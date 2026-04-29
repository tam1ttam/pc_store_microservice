package com.devteria.order.controller;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.web.bind.annotation.*;

import com.devteria.order.dto.request.ApiResponse;
import com.devteria.order.dto.request.OrderCreationRequest;
import com.devteria.order.entity.Order;
import com.devteria.order.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/orders")
public class OrderController {
    OrderService orderService;

    @PostMapping
    public ApiResponse<Boolean> saveOrder(@RequestBody OrderCreationRequest request) {
        // TODO: Cập nhật stock product từ Product Service
        // request.getItems().forEach(item -> {
        // try {
        // productService.updateInStockProduct(item.getProductId(), item.getQuantity());
        // } catch (Exception e) {
        // log.error("Error: {}", e.getMessage());
        // }
        // });

        if (request.getOrderDate() == null) {
            request.setOrderDate(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                    .format(LocalDateTime.now(ZoneId.systemDefault())));
        }

        boolean result = orderService.saveOrder(request);
        return ApiResponse.<Boolean>builder().result(result).build();
    }

    @GetMapping("/{customerId}")
    public ApiResponse<List<Order>> getOrders(@PathVariable String customerId) {
        return ApiResponse.<List<Order>>builder()
                .result(orderService.getAllOrders(new ObjectId(customerId)))
                .build();
    }

    @GetMapping("/{customerId}/status/{status}")
    public ApiResponse<List<Order>> getOrdersByStatus(@PathVariable String customerId, @PathVariable String status) {
        return ApiResponse.<List<Order>>builder()
                .result(orderService.getOrdersByStatus(new ObjectId(customerId), status))
                .build();
    }

    @GetMapping("/id/{orderId}")
    public ApiResponse<Order> getOrderById(@PathVariable String orderId) {
        return orderService
                .getOrderById(new ObjectId(orderId))
                .map(order -> ApiResponse.<Order>builder().result(order).build())
                .orElseGet(() -> ApiResponse.<Order>builder()
                        .code(404)
                        .message("Order not found")
                        .build());
    }

    @PutMapping("/{orderId}")
    public ApiResponse<Order> updateOrderStatus(@PathVariable String orderId, @RequestParam String status) {
        Order result = orderService.updateOrderStatus(new ObjectId(orderId), status);
        return ApiResponse.<Order>builder().result(result).build();
    }

    @DeleteMapping("/{orderId}")
    public ApiResponse<Boolean> deleteOrder(@PathVariable String orderId) {
        boolean result = orderService.deleteOrder(new ObjectId(orderId));
        return ApiResponse.<Boolean>builder().result(result).build();
    }
}
