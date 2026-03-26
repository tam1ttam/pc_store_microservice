package tam.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "orders")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
public final class Order extends AbstractMappedEntity {

    @Id
    @Column(name = "order_id", unique = true, nullable = false, updatable = false)
    private String id;
}
