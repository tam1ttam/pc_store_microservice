package com.tam.order.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.tam.order.entity.Order;
import com.tam.order.entity.OrderStatus;
import com.tam.order.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Auto-resolves PENDING orders older than {@value #PENDING_TIMEOUT_MINUTES} minutes by
 * flipping them to {@link OrderStatus#DELIVERING} via {@link OrderService#confirmOrder(Long)}.
 *
 * <p>Runs every minute. Uses {@link Order#getOrderDate()} as the PENDING-since timestamp; if
 * the order was created more than the configured threshold ago it is eligible for auto-confirm.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupScheduler {

    private static final long PENDING_TIMEOUT_MINUTES = 5;
    private static final long SCHEDULER_FIXED_RATE_MS = 60_000L; // every minute

    private final OrderService orderService;

    @PostConstruct
    void init() {
        log.info(
                "OrderCleanupScheduler started — auto-confirming PENDING orders older than {} minutes",
                PENDING_TIMEOUT_MINUTES);
    }

    @PreDestroy
    void destroy() {
        log.info("OrderCleanupScheduler shutting down");
    }

    @Scheduled(fixedRate = SCHEDULER_FIXED_RATE_MS)
    void autoConfirmStalePendingOrders() {
        try {
            List<Order> pendingOrders = orderService.getPendingOrders();
            if (pendingOrders.isEmpty()) {
                return;
            }

            LocalDateTime cutoff = LocalDateTime.now().minusMinutes(PENDING_TIMEOUT_MINUTES);
            int autoConfirmed = 0;

            for (Order order : pendingOrders) {
                LocalDateTime orderDate = order.getOrderDate();
                if (orderDate == null) {
                    continue;
                }
                if (orderDate.isBefore(cutoff)) {
                    try {
                        orderService.confirmOrder(order.getId());
                        autoConfirmed++;
                        log.info(
                                "Auto-confirmed PENDING order {} (orderDate={}) -> DELIVERING",
                                order.getId(),
                                orderDate);
                    } catch (Exception e) {
                        log.warn("Failed to auto-confirm order {}: {}", order.getId(), e.getMessage());
                    }
                }
            }

            if (autoConfirmed > 0) {
                log.info("Auto-confirm run completed — {} orders processed", autoConfirmed);
            }
        } catch (Exception e) {
            log.error("OrderCleanupScheduler run failed", e);
        }
    }
}
