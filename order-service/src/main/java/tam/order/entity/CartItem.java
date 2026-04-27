package tam.order.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem extends AbstractMappedEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    Integer itemId;
    String productId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartId")
    Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderId")
    Order order;
     LocalDateTime orderDate;
     String orderDesc;
     Double orderFee;
     Integer quantity;
     Double price;      // giá tại thời điểm đặt hàng — quan trọng vì giá có thể thay đổi
     String productName; // snapshot tên SP lúc đặt
     String thumbnail;   // snapshot ảnh lúc đặt
}
