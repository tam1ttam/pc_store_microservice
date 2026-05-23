package com.tam.product.grpc;

import java.util.List;

import org.bson.types.ObjectId;

import com.tam.product.dto.response.ProductResponse;
import com.tam.product.entity.Product;
import com.tam.product.service.ProductService;
import com.tam.proto.product.v1.CheckProductAvailabilityRequest;
import com.tam.proto.product.v1.CheckProductAvailabilityResponse;
import com.tam.proto.product.v1.CheckRemainingStockRequest;
import com.tam.proto.product.v1.CheckRemainingStockResponse;
import com.tam.proto.product.v1.CreateProductRequest;
import com.tam.proto.product.v1.CreateProductResponse;
import com.tam.proto.product.v1.DeleteProductRequest;
import com.tam.proto.product.v1.DeleteProductResponse;
import com.tam.proto.product.v1.GetBestSellingProductsRequest;
import com.tam.proto.product.v1.GetBestSellingProductsResponse;
import com.tam.proto.product.v1.GetNewestProductsRequest;
import com.tam.proto.product.v1.GetNewestProductsResponse;
import com.tam.proto.product.v1.GetProductDetailRequest;
import com.tam.proto.product.v1.GetProductDetailResponse;
import com.tam.proto.product.v1.GetProductRequest;
import com.tam.proto.product.v1.GetProductResponse;
import com.tam.proto.product.v1.GetProductsByIdsRequest;
import com.tam.proto.product.v1.GetProductsByIdsResponse;
import com.tam.proto.product.v1.ProductInfo;
import com.tam.proto.product.v1.ProductServiceGrpc;
import com.tam.proto.product.v1.SearchProductsRequest;
import com.tam.proto.product.v1.SearchProductsResponse;
import com.tam.proto.product.v1.SupplierInfo;
import com.tam.proto.product.v1.UpdateProductRequest;
import com.tam.proto.product.v1.UpdateProductResponse;
import com.tam.proto.product.v1.UpdateStockRequest;
import com.tam.proto.product.v1.UpdateStockResponse;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcProductService extends ProductServiceGrpc.ProductServiceImplBase {

    private final ProductService productService;

    @Override
    public void getNewestProducts(
            GetNewestProductsRequest request, StreamObserver<GetNewestProductsResponse> responseObserver) {
        try {
            List<Product> products = productService.getNewestProducts(request.getLimit());
            GetNewestProductsResponse.Builder builder = GetNewestProductsResponse.newBuilder();
            products.forEach(p -> builder.addProducts(toProductInfo(p)));
            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getNewestProducts gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getBestSellingProducts(
            GetBestSellingProductsRequest request, StreamObserver<GetBestSellingProductsResponse> responseObserver) {
        try {
            List<Product> products = productService.getBestSellingProducts(request.getLimit());
            GetBestSellingProductsResponse.Builder builder = GetBestSellingProductsResponse.newBuilder();
            products.forEach(p -> builder.addProducts(toProductInfo(p)));
            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getBestSellingProducts gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getProduct(GetProductRequest request, StreamObserver<GetProductResponse> responseObserver) {
        try {
            ProductResponse product = productService.getProductById(request.getProductId());
            GetProductResponse.Builder builder = GetProductResponse.newBuilder()
                    .setId(product.getId() != null ? product.getId().toString() : "")
                    .setName(product.getName())
                    .setImg(product.getImg() != null ? product.getImg() : "")
                    .setPrice(product.getPrice())
                    .setUnit(product.getUnit() != null ? product.getUnit() : "");
            if (product.getSupplier() != null) {
                builder.setSupplier(toSupplierInfo(
                        product.getSupplier().getName(), product.getSupplier().getAddress()));
            }
            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getProduct gRPC error", e);
            responseObserver.onError(
                    Status.NOT_FOUND.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getProductsByIds(
            GetProductsByIdsRequest request, StreamObserver<GetProductsByIdsResponse> responseObserver) {
        try {
            GetProductsByIdsResponse.Builder builder = GetProductsByIdsResponse.newBuilder();
            request.getProductIdsList().forEach(id -> {
                try {
                    ProductResponse p = productService.getProductById(id);
                    builder.addProducts(toProductInfoFromResponse(p));
                } catch (Exception ignored) {
                    // skip products not found
                }
            });
            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getProductsByIds gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void createProduct(CreateProductRequest request, StreamObserver<CreateProductResponse> responseObserver) {
        responseObserver.onError(Status.UNIMPLEMENTED
                .withDescription("Use REST API to create products")
                .asRuntimeException());
    }

    @Override
    public void updateProduct(UpdateProductRequest request, StreamObserver<UpdateProductResponse> responseObserver) {
        responseObserver.onError(Status.UNIMPLEMENTED
                .withDescription("Use REST API to update products")
                .asRuntimeException());
    }

    @Override
    public void deleteProduct(DeleteProductRequest request, StreamObserver<DeleteProductResponse> responseObserver) {
        try {
            boolean deleted = productService.deleteProductById(request.getProductId());
            responseObserver.onNext(DeleteProductResponse.newBuilder()
                    .setSuccess(deleted)
                    .setMessage(deleted ? "Deleted" : "Not found")
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("deleteProduct gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void searchProducts(SearchProductsRequest request, StreamObserver<SearchProductsResponse> responseObserver) {
        try {
            List<ProductResponse> products = productService.getProductByNameOrSupplier(request.getKeyword());
            SearchProductsResponse.Builder builder = SearchProductsResponse.newBuilder();
            products.forEach(p -> builder.addProducts(toProductInfoFromResponse(p)));
            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("searchProducts gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void checkProductAvailability(
            CheckProductAvailabilityRequest request,
            StreamObserver<CheckProductAvailabilityResponse> responseObserver) {
        try {
            ProductResponse product = productService.getProductById(request.getProductId());
            boolean available = product.getInStock() >= request.getQuantity();
            responseObserver.onNext(CheckProductAvailabilityResponse.newBuilder()
                    .setAvailable(available)
                    .setProductId(request.getProductId())
                    .setRequestedQuantity(request.getQuantity())
                    .setMessage(available ? "In stock" : "Insufficient stock")
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("checkProductAvailability gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void updateStock(UpdateStockRequest request, StreamObserver<UpdateStockResponse> responseObserver) {
        try {
            boolean updated =
                    productService.updateInStockProduct(new ObjectId(request.getProductId()), request.getQuantity());
            responseObserver.onNext(UpdateStockResponse.newBuilder()
                    .setSuccess(updated)
                    .setProductId(request.getProductId())
                    .setMessage(updated ? "Stock updated" : "Update failed")
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("updateStock gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void checkRemainingStock(
            CheckRemainingStockRequest request, StreamObserver<CheckRemainingStockResponse> responseObserver) {
        try {
            ProductResponse product = productService.getProductById(request.getProductId());
            int stock = product.getInStock();
            responseObserver.onNext(CheckRemainingStockResponse.newBuilder()
                    .setProductId(request.getProductId())
                    .setRemainingStock(stock)
                    .setAvailable(stock > 0)
                    .setMessage(stock > 0 ? "In stock" : "Out of stock")
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("checkRemainingStock gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getProductDetail(
            GetProductDetailRequest request, StreamObserver<GetProductDetailResponse> responseObserver) {
        responseObserver.onError(Status.UNIMPLEMENTED
                .withDescription("Use REST API to get product detail")
                .asRuntimeException());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private ProductInfo toProductInfo(Product p) {
        ProductInfo.Builder builder = ProductInfo.newBuilder()
                .setId(p.getId().toString())
                .setName(p.getName())
                .setImg(p.getImg() != null ? p.getImg() : "")
                .setPrice(p.getPrice())
                .setUnit(p.getUnit() != null ? p.getUnit() : "");
        if (p.getSupplier() != null) {
            builder.setSupplier(
                    toSupplierInfo(p.getSupplier().getName(), p.getSupplier().getAddress()));
        }
        return builder.build();
    }

    private ProductInfo toProductInfoFromResponse(ProductResponse p) {
        ProductInfo.Builder builder = ProductInfo.newBuilder()
                .setId(p.getId() != null ? p.getId().toString() : "")
                .setName(p.getName())
                .setImg(p.getImg() != null ? p.getImg() : "")
                .setPrice(p.getPrice())
                .setUnit(p.getUnit() != null ? p.getUnit() : "");
        if (p.getSupplier() != null) {
            builder.setSupplier(
                    toSupplierInfo(p.getSupplier().getName(), p.getSupplier().getAddress()));
        }
        return builder.build();
    }

    private SupplierInfo toSupplierInfo(String name, String address) {
        return SupplierInfo.newBuilder()
                .setName(name != null ? name : "")
                .setAddress(address != null ? address : "")
                .build();
    }
}
