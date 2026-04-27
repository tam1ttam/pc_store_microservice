package tam.order.service;

import tam.order.dto.req.AttachVoucherToOrderRequest;
import tam.order.dto.req.RemoveVoucherFromOrderRequest;
import tam.order.dto.res.OrderResponse;

public interface OrderVoucherService {
    /**
     * Attach voucher vào order
     */
    OrderResponse attachVoucherToOrder(String userId, AttachVoucherToOrderRequest request);

    /**
     * Remove voucher khỏi order
     */
    OrderResponse removeVoucherFromOrder(String userId, RemoveVoucherFromOrderRequest request);
}
