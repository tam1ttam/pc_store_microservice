package tam.product.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class Product extends AbstractMappedEntity {

    @Id
    @Column(unique = true, nullable = false, updatable = false)
    private String productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoryId")
    private Category category;
    @Column(nullable = false)
    String name;

    @Column(unique = true, nullable = false)
    String slug;

    String brandName;

    @Column(columnDefinition = "TEXT")
    String shortDescription;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(columnDefinition = "TEXT")
    String specification;

    Double price;

    Double averageStar = 0.0;

    String thumbnailUrl; // Main image for listing

    @ElementCollection
    @CollectionTable(name = "product_media", joinColumns = @JoinColumn(name = "product_id"))
    List<String> imageMediaUrls; // Gallery images

    boolean isAllowedToOrder = true;
    boolean isPublished = true;
    boolean isFeatured = false;
    boolean hasOptions = false;
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    List<ProductAttributeGroup> attributeGroups;


}
