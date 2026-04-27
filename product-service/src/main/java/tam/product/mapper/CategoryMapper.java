package tam.product.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tam.product.dto.req.CategoryRequest;
import tam.product.dto.res.CategoryResponse;
import tam.product.entity.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    /**
     * Chuyển đổi từ CategoryRequest sang Category entity
     */
    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "categoryName", source = "name")
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "keyword", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Category toEntity(CategoryRequest request);

    /**
     * Chuyển đổi từ Category entity sang CategoryResponse DTO
     */
    @Mapping(target = "id", source = "categoryId")
    @Mapping(target = "categoryImage", ignore = true)
    CategoryResponse toResponse(Category category);

    /**
     * Cập nhật Category entity từ CategoryRequest
     */
    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "categoryName", source = "name")
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    void updateEntity(@MappingTarget Category category, CategoryRequest request);
}
