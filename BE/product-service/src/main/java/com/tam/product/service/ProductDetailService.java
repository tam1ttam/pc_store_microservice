package com.tam.product.service;

import com.tam.product.dto.request.ProductDetailCreationRequest;
import com.tam.product.dto.request.UpdateProductDetailReq;
import com.tam.product.dto.response.ProductDetailResponse;
import com.tam.product.entity.Product;

public interface ProductDetailService {
    ProductDetailResponse getProductDetailById(String productId);

    ProductDetailResponse addProductDetail(Product product, ProductDetailCreationRequest request);

    ProductDetailResponse updateProductDetail(String productId, UpdateProductDetailReq request);

    boolean deleteProductDetailByProductId(String productId);
}
