package tam.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tam.product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, String> {
}
