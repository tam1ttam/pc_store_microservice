package com.tam.order.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tam.order.entity.Voucher;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);

    boolean existsByCode(String code);

    @Query(
            """
			SELECT v FROM Voucher v WHERE v.isActive = true
			AND (v.expiredAt IS NULL OR v.expiredAt > :now)
			AND (v.maxUsage IS NULL OR v.usedCount < v.maxUsage)
			AND (
				v.accessType = 'PUBLIC'
				OR (v.accessType = 'PRIVATE' AND v.userId = :userId)
			)
			""")
    List<Voucher> findAvailableForUser(@Param("userId") String userId, @Param("now") LocalDateTime now);
}
