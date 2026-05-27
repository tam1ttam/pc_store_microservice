package tam.orchestrator.saga.checkout;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import tam.orchestrator.kafka.SagaEvents.*;
import tam.orchestrator.model.SagaState;
import tam.orchestrator.repository.SagaStateRepository;

import java.time.Instant;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class CheckoutSagaOrchestrator {

    private final SagaStateRepository stateRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void startSaga(String sagaId, Map<String, Object> initialPayload) {
        log.info("Starting Checkout Saga: {}", sagaId);

        SagaState state = SagaState.builder()
                .sagaId(sagaId)
                .flowType("CHECKOUT")
                .status(SagaState.SagaStatus.STARTED)
                .currentStep(0)
                .payload(initialPayload)
                .steps(new ArrayList<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        stateRepository.save(state);
        moveNext(state);
    }

    public void handleReply(SagaReply reply) {
        SagaState state = stateRepository.findById(reply.getSagaId())
                .orElseThrow(() -> new RuntimeException("Saga state not found: " + reply.getSagaId()));

        if (!reply.isSuccess()) {
            log.error("Saga step {} failed for {}: {}", reply.getStepName(), state.getSagaId(), reply.getErrorReason());
            startCompensation(state, reply.getErrorReason());
            return;
        }

        log.info("Saga step {} succeeded for {}", reply.getStepName(), state.getSagaId());

        SagaState.SagaStepState stepState = SagaState.SagaStepState.builder()
                .stepName(reply.getStepName())
                .status(SagaState.SagaStepState.StepStatus.SUCCESS)
                .timestamp(Instant.now())
                .build();

        state.getSteps().add(stepState);
        state.setCurrentStep(state.getCurrentStep() + 1);
        state.setUpdatedAt(Instant.now());
        stateRepository.save(state);

        moveNext(state);
    }

    private void moveNext(SagaState state) {
        int step = state.getCurrentStep();
        Map<String, Object> payload = state.getPayload();

        if (step == 0) {
            sendCommand(state.getSagaId(), "RESERVE_STOCK", payload);
        } else if (step == 1) {
            sendCommand(state.getSagaId(), "APPLY_VOUCHER", payload);
        } else if (step == 2) {
            sendCommand(state.getSagaId(), "CREATE_PAYPAL_ORDER", payload);
        } else {
            log.info("Checkout Saga successfully completed for {}", state.getSagaId());
            state.setStatus(SagaState.SagaStatus.SUCCESS);
            stateRepository.save(state);
        }
    }

    private void sendCommand(String sagaId, String commandType, Map<String, Object> payload) {
        SagaCommand command = SagaCommand.builder()
                .sagaId(sagaId)
                .commandType(commandType)
                .payload(payload)
                .build();
        kafkaTemplate.send("saga.command", command);
    }

    private void startCompensation(SagaState state, String reason) {
        log.warn("Starting compensation for Saga {}. Reason: {}", state.getSagaId(), reason);
        state.setStatus(SagaState.SagaStatus.COMPENSATING);
        stateRepository.save(state);

        List<SagaState.SagaStepState> completedSteps = state.getSteps();
        for (int i = completedSteps.size() - 1; i >= 0; i--) {
            String stepName = completedSteps.get(i).getStepName();
            String compensateCommand = getCompensateCommand(stepName);
            if (compensateCommand != null) {
                sendCommand(state.getSagaId(), compensateCommand, state.getPayload());
            }
        }

        state.setStatus(SagaState.SagaStatus.COMPENSATED);
        stateRepository.save(state);
    }

    private String getCompensateCommand(String stepName) {
        return switch (stepName) {
            case "RESERVE_STOCK" -> "RELEASE_STOCK";
            case "APPLY_VOUCHER" -> "RELEASE_VOUCHER";
            case "CREATE_PAYPAL_ORDER" -> "VOID_PAYPAL_ORDER";
            default -> null;
        };
    }
}
