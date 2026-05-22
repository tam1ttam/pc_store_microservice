package com.tam.product.mapper;

import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tam.product.dto.request.ProductAttributeRequest;
import com.tam.product.dto.request.ProductDetailCreationRequest;
import com.tam.product.dto.response.ProductAttributeResponse;
import com.tam.product.dto.response.ProductDetailResponse;
import com.tam.product.entity.ProductAttribute;
import com.tam.product.entity.ProductDetail;

@Mapper(componentModel = "spring")
public interface ProductDetailMapper {

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "id", ignore = true)
    ProductDetail toProductDetail(ProductDetailCreationRequest request);

    @Mapping(target = "productId", expression = "java(objectIdToString(productDetail.getProductId()))")
    ProductDetailResponse toProductDetailResponse(ProductDetail productDetail);

    ProductAttribute toProductAttribute(ProductAttributeRequest request);

    ProductAttributeResponse toProductAttributeResponse(ProductAttribute attribute);

    default List<ProductAttribute> toProductAttributeList(List<ProductAttributeRequest> requests) {
        if (requests == null) return new ArrayList<>();
        return requests.stream().map(this::toProductAttribute).toList();
    }

    default List<ProductAttributeResponse> toProductAttributeResponseList(List<ProductAttribute> attributes) {
        if (attributes == null) return new ArrayList<>();
        return attributes.stream().map(this::toProductAttributeResponse).toList();
    }

    default String objectIdToString(ObjectId objectId) {
        return objectId != null ? objectId.toHexString() : null;
    }
}
