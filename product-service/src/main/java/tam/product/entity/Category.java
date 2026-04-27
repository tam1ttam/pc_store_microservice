package tam.product.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class Category extends AbstractMappedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(unique = true, nullable = false, updatable = false)
    String categoryId;
    String categoryName;
    String keyword;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    java.util.Set<Product> products;
    @Column(nullable = false)
    String name;

    @Column(unique = true, nullable = false)
    String slug;

    String description;

    String imageUrl;
}