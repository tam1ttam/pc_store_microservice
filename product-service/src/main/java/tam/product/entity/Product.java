package tam.product.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@Entity
@Table(name = "products")
public final class Product extends AbstractMappedEntity {

    @Id
    @Column(name = "product_id", unique = true, nullable = false, updatable = false)
    private String id;
}
