package com.tam.product.mapper;

import org.mapstruct.Mapper;

import com.tam.product.dto.request.CreationProductRequest;
import com.tam.product.dto.request.ProductCreationRequest;
import com.tam.product.dto.response.ProductResponse;
import com.tam.product.entity.Product;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toProductV1(ProductCreationRequest response);

    Product toProductV2(CreationProductRequest response);

    ProductResponse toProductResponse(Product product);
}
