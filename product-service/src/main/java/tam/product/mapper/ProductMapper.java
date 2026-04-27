package tam.product.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tam.product.dto.req.ProductRequest;
import tam.product.dto.res.ProductResponse;
import tam.product.entity.Product;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    /**
     * Chuyển đổi từ ProductRequest sang Product entity
     */
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "thumbnailUrl", source = "thumbnailMediaUrl")
    @Mapping(target = "imageMediaUrls", source = "productImageMediaUrls")
    @Mapping(target = "attributeGroups", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Product toEntity(ProductRequest request);

    /**
     * Chuyển đổi từ Product entity sang ProductResponse DTO
     */
    @Mapping(target = "productAttributeGroups", source = "attributeGroups")
    ProductResponse toResponse(Product product);

    /**
     * Cập nhật Product entity từ ProductRequest
     */
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "thumbnailUrl", source = "thumbnailMediaUrl")
    @Mapping(target = "imageMediaUrls", source = "productImageMediaUrls")
    @Mapping(target = "attributeGroups", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    void updateEntity(@MappingTarget Product product, ProductRequest request);
}
