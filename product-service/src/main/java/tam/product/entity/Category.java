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
@Table(name = "categories")
public final class Category extends AbstractMappedEntity {

    @Id
    @Column(name = "category_id", unique = true, nullable = false, updatable = false)
    private String id;
}