package tam.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "carts")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
public final class Cart extends AbstractMappedEntity {

    @Id
    @Column(name = "cart_id", unique = true, nullable = false, updatable = false)
    private String id;
}
