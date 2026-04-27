package tam.product.dto.res;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    Long id;
    String name;
    String description;
    String slug;
    CategoryImageDTO categoryImage;

    @Data
    @Builder
    public static class CategoryImageDTO {
        Long id;
        String url;
    }
}
