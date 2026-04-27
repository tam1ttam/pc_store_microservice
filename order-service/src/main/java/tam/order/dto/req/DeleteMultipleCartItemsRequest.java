package tam.order.dto.req;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DeleteMultipleCartItemsRequest {
    List<Integer> itemIds;
}
