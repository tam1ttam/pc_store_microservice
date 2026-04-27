package tam.product.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryRequest {
    
    @NotBlank(message = "Category name is required")
    String name;
    
    String description;
    
    String imageUrl;
    
    String keyword;
}