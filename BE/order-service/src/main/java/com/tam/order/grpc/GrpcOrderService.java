package com.tam.order.grpc;

import java.util.List;

import org.bson.types.ObjectId;

import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.entity.Order;
import com.tam.order.service.OrderService;
import com.tam.proto.order.v1.CancelOrderRequest;
import com.tam.proto.order.v1.CancelOrderResponse;
import com.tam.proto.order.v1.CartItem;
import com.tam.proto.order.v1.CreateOrderRequest;
import com.tam.proto.order.v1.GetOrderDetailRequest;
import com.tam.proto.order.v1.GetOrdersByStatusRequest;
import com.tam.proto.order.v1.GetOrdersRequest;
import com.tam.proto.order.v1.GetOrdersResponse;
import com.tam.proto.order.v1.OrderResponse;
import com.tam.proto.order.v1.OrderServiceGrpc;
import com.tam.proto.order.v1.OrderStatus;
import com.tam.proto.order.v1.UpdateOrderStatusRequest;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcOrderService extends OrderServiceGrpc.OrderServiceImplBase {

    private final OrderService orderService;

    @Override
    public void createOrder(CreateOrderRequest request, StreamObserver<OrderResponse> responseObserver) {
        try {
            List<com.tam.order.entity.CartItem> items = request.getItemsList().stream()
                    .map(i -> com.tam.order.entity.CartItem.builder()
                            .productId(i.getProductId())
                            .productName(i.getProductName())
                            .productPrice(i.getProductPrice())
                            .quantity(i.getQuantity())
                            .build())
                    .toList();

            OrderCreationRequest creationRequest = OrderCreationRequest.builder()
                    .customerId(request.getCustomerId())
                    .shipAddress(request.getShipAddress())
                    .items(items)
                    .totalPrice(request.getTotalPrice())
                    .orderDate(request.getOrderDate())
                    .isPaid(request.getIsPaid())
                    .orderStatus(request.getOrderStatus())
                    .build();

            Order saved = orderService.saveOrder(creationRequest);
            responseObserver.onNext(toOrderResponse(saved));
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("createOrder gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getOrders(GetOrdersRequest request, StreamObserver<GetOrdersResponse> responseObserver) {
        try {
            List<Order> orders = orderService.getAllOrders(new ObjectId(request.getCustomerId()));
            GetOrdersResponse.Builder builder = GetOrdersResponse.newBuilder()
                    .setTotalPages(1)
                    .setCurrentPage(0)
                    .setTotalItems(orders.size());
            orders.forEach(o -> builder.addOrders(toOrderResponse(o)));
            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getOrders gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getOrderDetail(GetOrderDetailRequest request, StreamObserver<OrderResponse> responseObserver) {
        try {
            orderService
                    .getOrderById(new ObjectId(request.getOrderId()))
                    .ifPresentOrElse(
                            o -> {
                                responseObserver.onNext(toOrderResponse(o));
                                responseObserver.onCompleted();
                            },
                            () -> responseObserver.onError(Status.NOT_FOUND
                                    .withDescription("Order not found")
                                    .asRuntimeException()));
        } catch (Exception e) {
            log.error("getOrderDetail gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getOrdersByStatus(
            GetOrdersByStatusRequest request, StreamObserver<GetOrdersResponse> responseObserver) {
        try {
            List<Order> orders =
                    orderService.getOrdersByStatus(new ObjectId(request.getCustomerId()), request.getStatus());
            GetOrdersResponse.Builder builder = GetOrdersResponse.newBuilder()
                    .setTotalPages(1)
                    .setCurrentPage(0)
                    .setTotalItems(orders.size());
            orders.forEach(o -> builder.addOrders(toOrderResponse(o)));
            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getOrdersByStatus gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void updateOrderStatus(UpdateOrderStatusRequest request, StreamObserver<OrderResponse> responseObserver) {
        try {
            Order order = orderService.updateOrderStatus(new ObjectId(request.getOrderId()), request.getStatus());
            responseObserver.onNext(toOrderResponse(order));
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("updateOrderStatus gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void cancelOrder(CancelOrderRequest request, StreamObserver<CancelOrderResponse> responseObserver) {
        try {
            boolean deleted = orderService.deleteOrder(new ObjectId(request.getOrderId()));
            responseObserver.onNext(CancelOrderResponse.newBuilder()
                    .setSuccess(deleted)
                    .setOrderId(request.getOrderId())
                    .setMessage(deleted ? "Order cancelled" : "Order not found")
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("cancelOrder gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    private OrderResponse toOrderResponse(Order o) {
        OrderResponse.Builder builder = OrderResponse.newBuilder()
                .setId(o.getId().toString())
                .setCustomerId(o.getCustomerId())
                .setShipAddress(o.getShipAddress() != null ? o.getShipAddress() : "")
                .setOrderDate(o.getOrderDate() != null ? o.getOrderDate() : "")
                .setCurrency(o.getCurrency() != null ? o.getCurrency() : "")
                .setTotalPrice(o.getTotalPrice())
                .setIsPaid(o.isPaid())
                .setOrderStatus(OrderStatus.forNumber(
                        o.getOrderStatus() != null ? o.getOrderStatus().ordinal() : 0));

        if (o.getItems() != null) {
            o.getItems()
                    .forEach(item -> builder.addItems(CartItem.newBuilder()
                            .setProductId(item.getProductId() != null ? item.getProductId() : "")
                            .setProductName(item.getProductName() != null ? item.getProductName() : "")
                            .setProductPrice(item.getProductPrice())
                            .setQuantity(item.getQuantity())
                            .build()));
        }
        return builder.build();
    }
}
