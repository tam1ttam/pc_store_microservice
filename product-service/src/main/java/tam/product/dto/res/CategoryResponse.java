package tam.product.dto.res;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    String categoryId;
    String categoryName;
    String name;
    String slug;
    String description;
    String imageUrl;
    String keyword;
}
