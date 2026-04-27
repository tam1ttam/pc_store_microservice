package tam.product.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AttributeValueDTO {
    String name;  // Tên thuộc tính (e.g., "CPU")
    String value; // Giá trị (e.g., "Intel i9")
}