package tam.order.grpc;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import tam.order.dto.req.CreateOrderRequest;
import tam.order.dto.res.OrderPreviewResponse;
import tam.order.dto.res.OrderResponse;
import tam.order.service.OrderService;
import iuh.fit.pc_store.grpc.order.v1.*;

import java.time.ZoneOffset;

import static tam.order.constrant.PaymentMethod.MOMO;
import static tam.order.constrant.PaymentMethod.VNPAY;

@Component
@RequiredArgsConstructor
@GrpcService
public class GrpcOrderService extends OrderServiceGrpc.OrderServiceImplBase {

    private final OrderService orderService;

    @Override
    public void previewOrder(
            PreviewOrderRequest request,
            StreamObserver<iuh.fit.pc_store.grpc.order.v1.OrderPreviewResponse> responseObserver) {
        try {
            tam.order.dto.req.CreateOrderRequest orderRequest = tam.order.dto.req.CreateOrderRequest.builder()
                    .shippingAddress(request.getShippingAddress())
                    .paymentMethod(mapPaymentMethod(request.getPaymentMethod()))
                    .voucherCode(request.getVoucherCode())
                    .build();

            OrderPreviewResponse response = orderService.previewOrder(request.getUserId(), orderRequest);

            iuh.fit.pc_store.grpc.order.v1.OrderPreviewResponse grpcResponse =
                    iuh.fit.pc_store.grpc.order.v1.OrderPreviewResponse.newBuilder()
                            .setSubtotal(response.getSubtotal())
                            .setShippingFee(response.getShippingFee())
                            .setDiscount(response.getDiscountAmount())
                            .setTotal(response.getTotalAmount())
                            .build();

            responseObserver.onNext(grpcResponse);
            responseObserver.onCompleted();
        } catch (Exception ex) {
            responseObserver.onError(
                    Status.INTERNAL.withDescription("Unable to preview order: " + ex.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void createOrder(
            iuh.fit.pc_store.grpc.order.v1.CreateOrderRequest request,
            StreamObserver<iuh.fit.pc_store.grpc.order.v1.OrderResponse> responseObserver) {
        try {
            tam.order.dto.req.CreateOrderRequest orderRequest = tam.order.dto.req.CreateOrderRequest.builder()
                    .userId(request.getUserId())
                    .shippingAddress(request.getShippingAddress())
                    .paymentMethod(mapPaymentMethod(request.getPaymentMethod())) // ← sửa: grpc→domain
                    .voucherCode(request.getVoucherCode())
                    .note(request.getNote())
                    .build();

            OrderResponse response = orderService.createOrder(request.getUserId(), orderRequest);
            responseObserver.onNext(buildGrpcOrderResponse(response));
            responseObserver.onCompleted();
        } catch (Exception ex) {
            responseObserver.onError(
                    Status.INTERNAL.withDescription("Unable to create order: " + ex.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getOrders(
            GetOrdersRequest request,
            StreamObserver<GetOrdersResponse> responseObserver) {
        try {
            Pageable pageable = PageRequest.of(request.getPage(), request.getPageSize());
            Page<OrderResponse> pageResponse = orderService.getOrders(request.getUserId(), pageable);

            GetOrdersResponse.Builder responseBuilder = GetOrdersResponse.newBuilder()
                    .setTotalPages(pageResponse.getTotalPages())
                    .setCurrentPage(pageResponse.getNumber())
                    .setTotalItems(pageResponse.getTotalElements());

            pageResponse.getContent().forEach(order -> responseBuilder.addOrders(buildGrpcOrderResponse(order)));

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        } catch (Exception ex) {
            responseObserver.onError(
                    Status.INTERNAL.withDescription("Unable to get orders: " + ex.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getOrderDetail(
            GetOrderDetailRequest request,
            StreamObserver<iuh.fit.pc_store.grpc.order.v1.OrderResponse> responseObserver) {
        try {
            OrderResponse response = orderService.getOrderDetail(request.getOrderId(), request.getUserId());
            responseObserver.onNext(buildGrpcOrderResponse(response));
            responseObserver.onCompleted();
        } catch (Exception ex) {
            responseObserver.onError(
                    Status.NOT_FOUND.withDescription("Order not found: " + ex.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void cancelOrder(
            CancelOrderRequest request,
            StreamObserver<iuh.fit.pc_store.grpc.order.v1.OrderResponse> responseObserver) {
        try {
            OrderResponse response = orderService.cancelOrder(request.getOrderId(), request.getUserId());
            responseObserver.onNext(buildGrpcOrderResponse(response));
            responseObserver.onCompleted();
        } catch (Exception ex) {
            responseObserver.onError(
                    Status.INTERNAL.withDescription("Unable to cancel order: " + ex.getMessage()).asRuntimeException());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private iuh.fit.pc_store.grpc.order.v1.OrderResponse buildGrpcOrderResponse(OrderResponse response) {
        iuh.fit.pc_store.grpc.order.v1.OrderResponse.Builder builder =
                iuh.fit.pc_store.grpc.order.v1.OrderResponse.newBuilder()
                        .setOrderId(response.getOrderId() != null ? response.getOrderId() : "")
                        .setUserId(response.getUserId() != null ? response.getUserId() : "")
                        .setStatus(mapOrderStatus(response.getStatus()))
                        .setPaymentMethod(mapPaymentMethodToGrpc(response.getPaymentMethod()))
                        .setPaymentStatus(mapPaymentStatus(response.getPaymentStatus()))
                        .setShippingAddress(response.getShippingAddress() != null ? response.getShippingAddress() : "")
                        .setNote(response.getNote() != null ? response.getNote() : "")
                        .setTotalPrice(response.getTotalAmount() != null ? response.getTotalAmount() : 0)
                        .setCreatedAt(response.getCreatedAt() != null ? response.getCreatedAt().toEpochSecond(ZoneOffset.UTC) : 0)
                        .setUpdatedAt(response.getUpdatedAt() != null ? response.getUpdatedAt().toEpochSecond(ZoneOffset.UTC) : 0);

        if (response.getItems() != null) {
            response.getItems().forEach(item ->
                    builder.addItems(
                            iuh.fit.pc_store.grpc.order.v1.OrderResponse.ItemInfo.newBuilder()
                                    .setProductId(item.getProductId() != null ? item.getProductId() : "")
                                    .setProductName(item.getProductName() != null ? item.getProductName() : "")
                                    .setQuantity(item.getQuantity() != null ? item.getQuantity() : 0)
                                    .setPrice(item.getPrice() != null ? item.getPrice() : 0)
                                    .build()));
        }

        return builder.build();
    }

    // grpc → domain
    private tam.order.constrant.PaymentMethod mapPaymentMethod(iuh.fit.pc_store.grpc.order.v1.PaymentMethod grpcMethod) {
        if (grpcMethod == null) return tam.order.constrant.PaymentMethod.COD;
        return switch (grpcMethod) {
            case PAYMENT_METHOD_VNPAY -> tam.order.constrant.PaymentMethod.VNPAY;
            case PAYMENT_METHOD_MOMO  -> tam.order.constrant.PaymentMethod.MOMO;
            default                   -> tam.order.constrant.PaymentMethod.COD;
        };
    }

    // domain → grpc
    private iuh.fit.pc_store.grpc.order.v1.PaymentMethod mapPaymentMethodToGrpc(tam.order.constrant.PaymentMethod method) {
        if (method == null) return iuh.fit.pc_store.grpc.order.v1.PaymentMethod.PAYMENT_METHOD_COD;
        return switch (method) {
            case COD   -> iuh.fit.pc_store.grpc.order.v1.PaymentMethod.PAYMENT_METHOD_COD;
            case VNPAY -> iuh.fit.pc_store.grpc.order.v1.PaymentMethod.PAYMENT_METHOD_VNPAY;
            case MOMO  -> iuh.fit.pc_store.grpc.order.v1.PaymentMethod.PAYMENT_METHOD_MOMO;
        };
    }

    private iuh.fit.pc_store.grpc.order.v1.OrderStatus mapOrderStatus(tam.order.constrant.OrderStatus status) {
        if (status == null) return iuh.fit.pc_store.grpc.order.v1.OrderStatus.ORDER_STATUS_PENDING;
        return switch (status) {
            case PENDING   -> iuh.fit.pc_store.grpc.order.v1.OrderStatus.ORDER_STATUS_PENDING;
            case SHIPPING  -> iuh.fit.pc_store.grpc.order.v1.OrderStatus.ORDER_STATUS_SHIPPING;
            case SHIPPED   -> iuh.fit.pc_store.grpc.order.v1.OrderStatus.ORDER_STATUS_SHIPPED;
            case COMPLETED -> iuh.fit.pc_store.grpc.order.v1.OrderStatus.ORDER_STATUS_COMPLETED;
            case CANCELLED -> iuh.fit.pc_store.grpc.order.v1.OrderStatus.ORDER_STATUS_CANCELLED;
        };
    }

    private iuh.fit.pc_store.grpc.order.v1.PaymentStatus mapPaymentStatus(tam.order.constrant.PaymentStatus status) {
        if (status == null) return iuh.fit.pc_store.grpc.order.v1.PaymentStatus.PAYMENT_STATUS_UNPAID;
        return switch (status) {
            case UNPAID   -> iuh.fit.pc_store.grpc.order.v1.PaymentStatus.PAYMENT_STATUS_UNPAID;
            case PAID     -> iuh.fit.pc_store.grpc.order.v1.PaymentStatus.PAYMENT_STATUS_PAID;
            case REFUNDED -> iuh.fit.pc_store.grpc.order.v1.PaymentStatus.PAYMENT_STATUS_REFUNDED;
        };
    }
}