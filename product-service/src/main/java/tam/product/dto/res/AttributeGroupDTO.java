package tam.product.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class AttributeGroupDTO {
    String name; // Tên nhóm (e.g., "Thông số kỹ thuật")
    List<AttributeValueDTO> productAttributeValues;
}
