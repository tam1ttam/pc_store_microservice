package com.tam.product.service;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;

import com.tam.product.dto.request.ProductCreationRequest;
import com.tam.product.dto.response.ProductResponse;
import com.tam.product.entity.Product;

public interface ProductService {
    List<Product> getNewestProducts(int limit);

    List<Product> getBestSellingProducts(int limit);

    Optional<ProductResponse> addProduct(ProductCreationRequest request);

    List<ProductResponse> getProductByNameOrSupplier(String keyword);

    ProductResponse getProductById(String productId);

    Optional<ProductResponse> updateProduct(String productId, ProductCreationRequest request);

    boolean deleteProductById(String productId);

    Page<Product> getProductsByPage(int page, int size);

    Page<Product> getProductsByPageAsc(int page, int size);

    Page<Product> getProductsByPageDesc(int page, int size);

    boolean updateInStockProduct(ObjectId productId, int quantity);

    Page<Product> getProductByName(String name, int page, int size);

    Page<Product> getProductByName(String name);
}
