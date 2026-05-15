package com.tam.order.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.tam.order.dto.request.ApiResponse;
import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.entity.Order;
import com.tam.order.service.OrderService;

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
        try {
            orderService.saveOrder(request);
            return ApiResponse.<Boolean>builder().result(true).build();
        } catch (Exception e) {
            log.error("Lỗi hệ thống khi lưu đơn hàng: ", e);
            return ApiResponse.<Boolean>builder()
                    .code(500)
                    .message("Lỗi Server: " + e.getMessage())
                    .result(false)
                    .build();
        }
    }

    @GetMapping("/{customerId}")
    public ApiResponse<List<Order>> getOrders(@PathVariable String customerId) {
        try {
            // Đã bỏ new ObjectId() để chấp nhận chuỗi ID từ MySQL/Identity Service
            return ApiResponse.<List<Order>>builder()
                    .result(orderService.getAllOrders(customerId))
                    .build();
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách đơn hàng: ", e);
            return ApiResponse.<List<Order>>builder()
                    .code(500)
                    .message("Lỗi khi lấy dữ liệu")
                    .build();
        }
    }

    @GetMapping("/{customerId}/status/{status}")
    public ApiResponse<List<Order>> getOrdersByStatus(@PathVariable String customerId, @PathVariable String status) {
        try {
            return ApiResponse.<List<Order>>builder()
                    .result(orderService.getOrdersByStatus(customerId, status))
                    .build();
        } catch (Exception e) {
            return ApiResponse.<List<Order>>builder()
                    .code(500)
                    .message("Lỗi truy vấn theo status")
                    .build();
        }
    }

    @GetMapping("/id/{orderId}")
    public ApiResponse<Order> getOrderById(@PathVariable String orderId) {
        try {
            return orderService
                    .getOrderById(orderId)
                    .map(order -> ApiResponse.<Order>builder().result(order).build())
                    .orElseGet(() -> ApiResponse.<Order>builder()
                            .code(404)
                            .message("Order not found")
                            .build());
        } catch (Exception e) {
            return ApiResponse.<Order>builder()
                    .code(500)
                    .message("Lỗi lấy chi tiết đơn hàng")
                    .build();
        }
    }

    @PutMapping("/{orderId}")
    public ApiResponse<Order> updateOrderStatus(@PathVariable String orderId, @RequestParam String status) {
        try {
            Order result = orderService.updateOrderStatus(orderId, status);
            return ApiResponse.<Order>builder().result(result).build();
        } catch (Exception e) {
            return ApiResponse.<Order>builder()
                    .code(500)
                    .message("Lỗi cập nhật trạng thái")
                    .build();
        }
    }

    @DeleteMapping("/{orderId}")
    public ApiResponse<Boolean> deleteOrder(@PathVariable String orderId) {
        try {
            boolean result = orderService.deleteOrder(orderId);
            return ApiResponse.<Boolean>builder().result(result).build();
        } catch (Exception e) {
            return ApiResponse.<Boolean>builder()
                    .code(500)
                    .message("Lỗi khi xóa")
                    .result(false)
                    .build();
        }
    }
    // API mới để xóa 1 sản phẩm cụ thể trong giỏ hàng
    @DeleteMapping("/delete-item")
    public ApiResponse<Boolean> deleteCartItem(@RequestParam String customerId, @RequestParam String productId) {
        try {
            log.info("Yêu cầu xóa sản phẩm {} cho khách hàng {}", productId, customerId);
            boolean result = orderService.deleteItemInCart(customerId, productId);
            return ApiResponse.<Boolean>builder().code(1000).result(result).build();
        } catch (Exception e) {
            log.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng: ", e);
            return ApiResponse.<Boolean>builder()
                    .code(500)
                    .message("Lỗi khi xóa sản phẩm: " + e.getMessage())
                    .result(false)
                    .build();
        }
    }

    @GetMapping
    public ApiResponse<List<Order>> getAllOrder() {
        return com.tam.order.dto.request.ApiResponse.<List<Order>>builder()
                .result(orderService.getAll())
                .build();
    }
}
