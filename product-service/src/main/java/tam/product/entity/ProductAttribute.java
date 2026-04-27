package tam.product.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_attribute")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductAttribute extends AbstractMappedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String name; // Ví dụ: "Độ phân giải", "Chip xử lý"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_group_id")
    ProductAttributeGroup attributeGroup;
}