package tam.orchestrator.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tam.orchestrator.kafka.SagaEvents.*;
import tam.orchestrator.saga.checkout.CheckoutSagaOrchestrator;
import tam.orchestrator.saga.signup.SignupSagaOrchestrator;
import tam.orchestrator.saga.orderstatus.OrderStatusSagaOrchestrator;
import tam.orchestrator.saga.productupdate.ProductUpdateSagaOrchestrator;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SagaKafkaHandler {

    private final CheckoutSagaOrchestrator checkoutOrchestrator;
    private final SignupSagaOrchestrator signupOrchestrator;
    private final OrderStatusSagaOrchestrator orderStatusSagaOrchestrator;
    private final ProductUpdateSagaOrchestrator productUpdateSagaOrchestrator;

    @KafkaListener(topics = "saga.reply")
    public void handleSagaReply(SagaReply reply) {
        log.info("Received Saga Reply: {}", reply);

        try {
            checkoutOrchestrator.handleReply(reply);
        } catch (Exception e) {
            try {
                signupOrchestrator.handleReply(reply);
            } catch (Exception ex) {
                try {
                    orderStatusSagaOrchestrator.handleReply(reply);
                } catch (Exception ex2) {
                    try {
                        productUpdateSagaOrchestrator.handleReply(reply);
                    } catch (Exception ex3) {
                        log.error("No orchestrator could handle Saga Reply: {}", reply.getSagaId());
                    }
                }
            }
        }
    }

    @KafkaListener(topics = "checkout.started")
    public void handleCheckoutStarted(Map<String, Object> payload) {
        String sagaId = UUID.randomUUID().toString();
        log.info("Received Checkout Started event. Starting Saga: {}", sagaId);
        checkoutOrchestrator.startSaga(sagaId, payload);
    }

    @KafkaListener(topics = "signup.started")
    public void handleSignupStarted(Map<String, Object> payload) {
        String sagaId = UUID.randomUUID().toString();
        log.info("Received Signup Started event. Starting Saga: {}", sagaId);
        signupOrchestrator.startSaga(sagaId, payload);
    }

    @KafkaListener(topics = "order_status_update.started")
    public void handleOrderStatusUpdateStarted(Map<String, Object> payload) {
        String sagaId = UUID.randomUUID().toString();
        log.info("Received Order Status Update event. Starting Saga: {}", sagaId);
        orderStatusSagaOrchestrator.startSaga(sagaId, payload);
    }

    @KafkaListener(topics = "product_update.started")
    public void handleProductUpdateStarted(Map<String, Object> payload) {
        String sagaId = UUID.randomUUID().toString();
        log.info("Received Product Update event. Starting Saga: {}", sagaId);
        productUpdateSagaOrchestrator.startSaga(sagaId, payload);
    }
}
