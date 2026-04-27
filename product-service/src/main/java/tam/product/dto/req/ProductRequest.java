package tam.product.dto.req;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductRequest {
    String name;
    Long categoryId; // ID của category
    String brandName;
    String shortDescription;
    String description;
    String specification;
    Double price;
    String thumbnailMediaUrl;
    List<String> productImageMediaUrls;

    // Quản lý trạng thái
    boolean isPublished;
    boolean isFeatured;
    boolean isAllowedToOrder;

    // Danh sách các thông số kỹ thuật (Attribute Values)
    // Client gửi lên: [{ "attributeId": 1, "value": "16GB" }, ...]
    List<ProductAttributeValueRequest> attributes;
}

@Data
class ProductAttributeValueRequest {
    Long attributeId; // ID của "RAM", "CPU", ...
    String value;     // "16GB", "Intel i7", ...
}