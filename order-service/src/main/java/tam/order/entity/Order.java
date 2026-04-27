package tam.order.entity;

import iuh.fit.pc_store.grpc.saga.v1.OrderItem;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import tam.order.constrant.OrderStatus;
import tam.order.constrant.PaymentMethod;
import tam.order.constrant.PaymentStatus;

import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@Entity
@Table(name = "orders") // Bảng này lưu thông tin tổng quát
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order extends AbstractMappedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String orderId;

    String userId;
    @Enumerated(EnumType.STRING)
    OrderStatus status; // Ví dụ: PENDING, PAID, SHIPPED, CANCELLED

    String shippingAddress;

    @Enumerated(EnumType.STRING)
     PaymentMethod paymentMethod;   // COD, VNPAY, MOMO
    @Enumerated(EnumType.STRING)
    PaymentStatus paymentStatus;   // UNPAID, PAID, REFUNDED
     String note;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<CartItem> orderItems;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<OrderVoucher> orderVouchers;
}