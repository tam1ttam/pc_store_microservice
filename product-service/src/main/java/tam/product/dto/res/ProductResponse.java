package tam.product.dto.res;

import jakarta.persistence.*;
import lombok.*;
import tam.product.entity.Category;

import java.util.List;
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    private String productId;
    private Category category;
    String name;
    String slug;
    String brandName;
    String shortDescription;
    String description;
    String specification;
    Double price;
    Double averageStar = 0.0;
    String thumbnailUrl; // Main image for listing
    List<String> imageMediaUrls;
    boolean isAllowedToOrder = true;
    boolean isPublished = true;
    boolean isFeatured = false;
    boolean hasOptions = false;
    List<AttributeGroupDTO> productAttributeGroups;
}
