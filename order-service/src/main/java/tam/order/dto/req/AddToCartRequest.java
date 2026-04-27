package tam.order.dto.req;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddToCartRequest {
    String productId;
    Integer quantity;
    Double price;           // giá hiện tại của sản phẩm
    String productName;     // snapshot tên
    String thumbnail;       // snapshot ảnh
}
