package com.tam.order.grpc;

import org.springframework.stereotype.Component;

import com.tam.proto.product.v1.CheckProductAvailabilityRequest;
import com.tam.proto.product.v1.CheckProductAvailabilityResponse;
import com.tam.proto.product.v1.ProductServiceGrpc;
import com.tam.proto.product.v1.UpdateStockRequest;
import com.tam.proto.product.v1.UpdateStockResponse;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ProductGrpcClient {

    private final ProductServiceGrpc.ProductServiceBlockingStub stub;

    public ProductGrpcClient() {
        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 6167)
                .usePlaintext()
                .build();
        this.stub = ProductServiceGrpc.newBlockingStub(channel);
    }

    public boolean checkStockAvailability(String productId, int requestedQty) {
        try {
            CheckProductAvailabilityResponse resp =
                    stub.checkProductAvailability(CheckProductAvailabilityRequest.newBuilder()
                            .setProductId(productId)
                            .setQuantity(requestedQty)
                            .build());
            return resp.getAvailable();
        } catch (Exception e) {
            log.error("gRPC checkStockAvailability failed for product {}: {}", productId, e.getMessage());
            return false;
        }
    }

    public int getRemainingStock(String productId) {
        try {
            com.tam.proto.product.v1.CheckRemainingStockResponse resp =
                    stub.checkRemainingStock(com.tam.proto.product.v1.CheckRemainingStockRequest.newBuilder()
                            .setProductId(productId)
                            .build());
            return resp.getRemainingStock();
        } catch (Exception e) {
            log.error("gRPC getRemainingStock failed for product {}: {}", productId, e.getMessage());
            return -1;
        }
    }

    public boolean deductStock(String productId, int quantity) {
        try {
            UpdateStockResponse resp = stub.updateStock(UpdateStockRequest.newBuilder()
                    .setProductId(productId)
                    .setQuantity(-quantity)
                    .build());
            return resp.getSuccess();
        } catch (Exception e) {
            log.error("gRPC deductStock failed for product {} qty {}: {}", productId, quantity, e.getMessage());
            return false;
        }
    }
}
