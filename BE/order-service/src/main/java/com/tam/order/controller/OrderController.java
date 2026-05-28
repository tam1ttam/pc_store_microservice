package com.tam.order.controller;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import com.tam.order.dto.request.ApiResponse;
import com.tam.order.dto.request.CheckoutRequest;
import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.dto.response.OrderResponse;
import com.tam.order.dto.response.OrderStatsResponse;
import com.tam.order.entity.Order;
import com.tam.order.entity.OrderStatus;
import com.tam.order.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    OrderService orderService;

    // ── Client endpoints ───────────────────────────────────────────────────────

    @PostMapping("/api/orders/checkout")
    public ApiResponse<OrderResponse> checkout(
            @AuthenticationPrincipal Jwt jwt, @RequestBody @Valid CheckoutRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.checkout(jwt.getSubject(), request))
                .build();
    }

    @GetMapping("/api/orders/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<OrderStatsResponse> getStats() {
        return ApiResponse.<OrderStatsResponse>builder()
                .result(orderService.getStats())
                .build();
    }

    @GetMapping("/api/orders/all")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<List<Order>> getAllOrders() {
        return ApiResponse.<List<Order>>builder().result(orderService.getAll()).build();
    }

    @GetMapping("/api/orders/admin/all")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGER')")
    public ApiResponse<Page<Order>> getAllOrdersPaginated(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<Page<Order>>builder()
                .result(orderService.getAllOrders(PageRequest.of(page, size)))
                .build();
    }

    @GetMapping("/api/orders/{id}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Long id) {
        return orderService
                .getOrderById(id)
                .map(o -> ApiResponse.<OrderResponse>builder().result(o).build())
                .orElseGet(() -> ApiResponse.<OrderResponse>builder()
                        .code(404)
                        .message("Order not found")
                        .build());
    }

    @GetMapping("/api/orders")
    public ApiResponse<List<OrderResponse>> getOrders(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        OrderStatus orderStatus = status != null ? OrderStatus.valueOf(status) : null;
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getOrdersFiltered(jwt.getSubject(), orderStatus, from, to))
                .build();
    }

    @PatchMapping("/api/orders/{id}/cancel")
    public ApiResponse<Boolean> cancelOrder(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.<Boolean>builder()
                .result(orderService.cancelOrder(id, jwt.getSubject()))
                .build();
    }

    // ── Manager endpoints ──────────────────────────────────────────────────────

    @PatchMapping("/api/orders/{id}/status")
    @PreAuthorize("hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ApiResponse.<Order>builder()
                .result(orderService.updateOrderStatus(id, status))
                .build();
    }

    @DeleteMapping("/manager/orders/{id}")
    @PreAuthorize("hasAuthority('MANAGER') or hasAuthority('ADMIN')")
    public ApiResponse<Boolean> deleteOrder(@PathVariable Long id) {
        return ApiResponse.<Boolean>builder()
                .result(orderService.deleteOrder(id))
                .build();
    }

    // ── Legacy endpoint (used by gRPC/saga-orchestrator) ──────────────────────

    @PostMapping("/api/orders")
    public ApiResponse<Boolean> saveOrder(@RequestBody OrderCreationRequest request) {
        orderService.saveOrder(request);
        return ApiResponse.<Boolean>builder().result(true).build();
    }
}
