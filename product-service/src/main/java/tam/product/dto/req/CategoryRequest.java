package tam.product.dto.req;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryRequest {
    String name;
    String description;
    String parentId; // Nếu bạn muốn làm category đa cấp
    String imageUrl;
}