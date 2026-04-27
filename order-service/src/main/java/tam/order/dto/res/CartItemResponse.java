package tam.order.dto.res;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    Integer itemId;
    String productId;
    String productName;
    String thumbnail;
    Integer quantity;
    Double price;
    Double subtotal;  // price * quantity
}
