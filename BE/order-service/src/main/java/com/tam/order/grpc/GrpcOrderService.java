package com.tam.order.grpc;

import java.util.List;

import com.tam.order.dto.request.CartItemRequest;
import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.entity.Order;
import com.tam.order.entity.OrderStatus;
import com.tam.order.repository.OrderRepository;
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
    private final OrderRepository orderRepository;

    @Override
    public void createOrder(CreateOrderRequest request, StreamObserver<OrderResponse> responseObserver) {
        try {
            List<CartItemRequest> items = request.getItemsList().stream()
                    .map(i -> CartItemRequest.builder()
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
            List<Order> orders = orderRepository.findByCustomerId(request.getCustomerId());
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
            orderRepository
                    .findById(Long.parseLong(request.getOrderId()))
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
            OrderStatus status = OrderStatus.valueOf(request.getStatus());
            List<Order> orders = orderRepository.findByCustomerIdAndOrderStatus(request.getCustomerId(), status);
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
            Order order = orderService.updateOrderStatus(Long.parseLong(request.getOrderId()), request.getStatus());
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
            boolean deleted = orderService.deleteOrder(Long.parseLong(request.getOrderId()));
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
                .setCustomerId(o.getCustomerId() != null ? o.getCustomerId() : "")
                .setShipAddress(o.getShipAddress() != null ? o.getShipAddress() : "")
                .setOrderDate(o.getOrderDate() != null ? o.getOrderDate().toString() : "")
                .setCurrency(o.getCurrency() != null ? o.getCurrency() : "")
                .setTotalPrice(o.getTotalPrice())
                .setIsPaid(o.isPaid())
                .setOrderStatus(com.tam.proto.order.v1.OrderStatus.forNumber(
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
