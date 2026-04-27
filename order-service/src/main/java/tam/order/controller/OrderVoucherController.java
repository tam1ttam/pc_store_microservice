package tam.order.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tam.order.dto.req.AttachVoucherToOrderRequest;
import tam.order.dto.req.RemoveVoucherFromOrderRequest;
import tam.order.dto.res.OrderResponse;
import tam.order.service.OrderVoucherService;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/orders/vouchers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderVoucherController {

    OrderVoucherService orderVoucherService;

    /**
     * POST /api/v1/orders/vouchers/attach
     * Attach voucher vào order
     */
    @PostMapping("/attach")
    public ResponseEntity<OrderResponse> attachVoucherToOrder(
            @RequestBody AttachVoucherToOrderRequest request) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        OrderResponse response = orderVoucherService.attachVoucherToOrder(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/orders/vouchers/remove
     * Remove voucher khỏi order
     */
    @PostMapping("/remove")
    public ResponseEntity<OrderResponse> removeVoucherFromOrder(
            @RequestBody RemoveVoucherFromOrderRequest request) {
        //TODO: Extract user ID từ JWT token hoặc SecurityContext
        String userId = "current_user_id";
        OrderResponse response = orderVoucherService.removeVoucherFromOrder(userId, request);
        return ResponseEntity.ok(response);
    }
}
