package com.tam.product.mapper;

import org.mapstruct.Mapper;

import com.tam.product.dto.request.ProductDetailCreationRequest;
import com.tam.product.dto.response.ProductDetailResponse;
import com.tam.product.entity.ProductDetail;

@Mapper(componentModel = "spring")
public interface ProductDetailMapper {
    ProductDetail toProductDetail(ProductDetailCreationRequest request);

    ProductDetailResponse toProductDetailResponse(ProductDetail productDetail);
}
