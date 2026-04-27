package tam.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tam.order.entity.OrderVoucher;
import tam.order.entity.OrderVoucherID;

@Repository
public interface OrderVoucherRepository extends JpaRepository<OrderVoucher, OrderVoucherID> {
}
