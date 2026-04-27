package tam.order.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tam.order.dto.req.CreateOrderRequest;
import tam.order.dto.res.OrderPreviewResponse;
import tam.order.dto.res.OrderResponse;
import tam.order.service.OrderService;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/orders")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    /**
     * POST /api/v1/orders/preview
     * Xem trước đơn hàng trước khi tạo
     */
    @PostMapping("/preview")
    public ResponseEntity<OrderPreviewResponse> previewOrder(@RequestBody CreateOrderRequest request) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        OrderPreviewResponse response = orderService.previewOrder(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/orders
     * Tạo đơn hàng mới
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/orders
     * Lấy danh sách đơn hàng của user
     */
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> response = orderService.getOrders(userId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/orders/{orderId}
     * Lấy chi tiết đơn hàng
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetail(@PathVariable String orderId) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        OrderResponse response = orderService.getOrderDetail(orderId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/orders/{orderId}/cancel
     * Hủy đơn hàng
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable String orderId) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        OrderResponse response = orderService.cancelOrder(orderId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public String health() {
        return "Order Service is running";
    }
}
