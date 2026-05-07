package com.tam.product.mapper;

import org.bson.types.ObjectId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tam.product.dto.request.ProductDetailCreationRequest;
import com.tam.product.dto.response.ProductDetailResponse;
import com.tam.product.entity.ProductDetail;

@Mapper(componentModel = "spring")
public interface ProductDetailMapper {

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "id", ignore = true)
    ProductDetail toProductDetail(ProductDetailCreationRequest request);

    @Mapping(target = "productId", expression = "java(objectIdToString(productDetail.getProductId()))")
    ProductDetailResponse toProductDetailResponse(ProductDetail productDetail);

    default String objectIdToString(ObjectId objectId) {
        return objectId != null ? objectId.toHexString() : null;
    }
}
