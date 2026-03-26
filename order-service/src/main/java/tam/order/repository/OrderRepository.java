package tam.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tam.order.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
}