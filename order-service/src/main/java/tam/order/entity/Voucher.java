package tam.order.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import tam.order.constrant.VoucherType;

import java.time.Instant;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@Entity
@Table(name = "vouchers")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Voucher extends AbstractMappedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String voucherId;

    String code;

    String description;

    Double discountAmount;

    Double discountPercent;

    Integer maxUsage;

    @Builder.Default
    @Column(nullable = false)
    Integer amount = 1;

    Instant expiredAt;

    Boolean isActive;

    @Enumerated(EnumType.STRING)
    VoucherType voucherType; // STACKABLE, NON_STACKABLE

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<OrderVoucher> orderVouchers;


}