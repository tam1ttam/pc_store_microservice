package tam.order.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tam.order.dto.req.CreateOrderRequest;
import tam.order.dto.res.OrderPreviewResponse;
import tam.order.dto.res.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderPreviewResponse previewOrder(String userId, CreateOrderRequest request);

    OrderResponse createOrder(String userId, CreateOrderRequest request);

    Page<OrderResponse> getOrders(String userId, Pageable pageable);

    OrderResponse getOrderDetail(String orderId, String userId);

    OrderResponse cancelOrder(String orderId, String userId);
}

