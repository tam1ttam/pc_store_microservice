package com.tam.chat.repository.grpc;

import java.util.List;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.tam.proto.product.v1.CheckRemainingStockRequest;
import com.tam.proto.product.v1.CheckRemainingStockResponse;
import com.tam.proto.product.v1.GetProductDetailRequest;
import com.tam.proto.product.v1.GetProductDetailResponse;
import com.tam.proto.product.v1.GetProductRequest;
import com.tam.proto.product.v1.GetProductResponse;
import com.tam.proto.product.v1.ProductAttributeProto;
import com.tam.proto.product.v1.ProductInfo;
import com.tam.proto.product.v1.ProductServiceGrpc;
import com.tam.proto.product.v1.SearchProductsRequest;
import com.tam.proto.product.v1.SearchProductsResponse;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ProductGrpcClient {

    @Value("${app.services.product.grpc-host:localhost}")
    private String host;

    @Value("${app.services.product.grpc-port:6167}")
    private int port;

    private ProductServiceGrpc.ProductServiceBlockingStub stub;

    @PostConstruct
    public void init() {
        ManagedChannel channel =
                ManagedChannelBuilder.forAddress(host, port).usePlaintext().build();
        stub = ProductServiceGrpc.newBlockingStub(channel);
        log.info("gRPC ProductClient connected to {}:{}", host, port);
    }

    public GetProductResponse getProduct(String productId) {
        try {
            GetProductResponse resp = stub.getProduct(
                    GetProductRequest.newBuilder().setProductId(productId).build());
            return resp.getId().isBlank() ? null : resp;
        } catch (StatusRuntimeException e) {
            log.warn("gRPC getProduct failed for id={}: {}", productId, e.getMessage());
            return null;
        }
    }

    public GetProductResponse getProductByName(String name) {
        try {
            SearchProductsRequest req =
                    SearchProductsRequest.newBuilder().setKeyword(name).build();
            SearchProductsResponse resp = stub.searchProducts(req);
            List<ProductInfo> list = resp.getProductsList();
            if (list.isEmpty()) return null;
            String bestId = list.get(0).getId();
            return getProduct(bestId);
        } catch (StatusRuntimeException e) {
            log.warn("gRPC searchProducts failed for keyword={}: {}", name, e.getMessage());
            return null;
        }
    }

    public List<ProductInfo> searchProducts(String keyword, int limit) {
        try {
            SearchProductsRequest req =
                    SearchProductsRequest.newBuilder().setKeyword(keyword).build();
            SearchProductsResponse resp = stub.searchProducts(req);
            return resp.getProductsList().stream().limit(limit).toList();
        } catch (StatusRuntimeException e) {
            log.warn("gRPC searchProducts failed for keyword={}: {}", keyword, e.getMessage());
            return List.of();
        }
    }

    public List<ProductAttributeProto> getProductDetail(String productId) {
        try {
            GetProductDetailResponse resp = stub.getProductDetail(
                    GetProductDetailRequest.newBuilder().setProductId(productId).build());
            return resp.getProductId().isBlank() ? List.of() : resp.getAttributesList();
        } catch (StatusRuntimeException e) {
            log.warn("gRPC getProductDetail failed for id={}: {}", productId, e.getMessage());
            return List.of();
        }
    }

    public int getRemainingStock(String productId) {
        try {
            CheckRemainingStockResponse resp = stub.checkRemainingStock(CheckRemainingStockRequest.newBuilder()
                    .setProductId(productId)
                    .build());
            return resp.getRemainingStock();
        } catch (StatusRuntimeException e) {
            log.warn("gRPC checkRemainingStock failed for id={}: {}", productId, e.getMessage());
            return -1;
        }
    }
}
