package tam.shipping.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "order_items")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
public final class OrderItem extends AbstractMappedEntity {

    @Id
    @Column(name = "order_item_id", unique = true, nullable = false, updatable = false)
    private String id;
}