package tam.product.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tam.product.entity.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    
    /**
     * Find products by featured flag
     */
    List<Product> findByIsFeaturedTrue();
    
    /**
     * Find published products
     */
    Page<Product> findByIsPublishedTrue(Pageable pageable);
    
    /**
     * Search products by name or brand
     */
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.brandName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByNameOrBrand(@Param("keyword") String keyword);
    
    /**
     * Search products by name with pagination
     */
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> searchByNameContaining(@Param("name") String name, Pageable pageable);
    
    /**
     * Find newest products (ordered by creation date)
     */
    @Query(value = "SELECT * FROM product WHERE is_published = true ORDER BY created_at DESC LIMIT :limit", 
           nativeQuery = true)
    List<Product> findNewestProducts(@Param("limit") int limit);
    
    /**
     * Find best selling products (ordered by average star/rating)
     */
    @Query(value = "SELECT * FROM product WHERE is_published = true ORDER BY average_star DESC, is_featured DESC LIMIT :limit", 
           nativeQuery = true)
    List<Product> findBestSellingProducts(@Param("limit") int limit);
}
