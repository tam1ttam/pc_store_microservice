package tam.shipping.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tam.shipping.domain.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
}