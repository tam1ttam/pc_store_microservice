package tam.order.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tam.order.entity.Voucher;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, String> {
    Optional<Voucher> findByCode(String code);
    Page<Voucher> findByIsActiveAndExpiredAtAfter(Boolean isActive, Instant expiredAt, Pageable pageable);
}
