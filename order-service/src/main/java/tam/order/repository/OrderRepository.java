package tam.order.repository;

import io.micrometer.core.instrument.config.validate.Validated;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tam.order.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Order findByOrderIdAndUserId(String orderId, String userId);

    Page<Order> findByUserId(String userId, Pageable pageable);
}