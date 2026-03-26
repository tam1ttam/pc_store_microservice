package tam.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tam.order.entity.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
}