package tam.orchestrator.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sagas")
public class SagaState {
    @Id
    private String sagaId;
    private String flowType;
    private SagaStatus status;
    private int currentStep;
    private Map<String, Object> payload;
    private List<SagaStepState> steps;
    private Instant createdAt;
    private Instant updatedAt;

    public enum SagaStatus {
        STARTED, SUCCESS, COMPENSATING, COMPENSATED, FAILED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SagaStepState {
        private String stepName;
        private StepStatus status;
        private Instant timestamp;
        private String errorReason;

        public enum StepStatus {
            PENDING, SUCCESS, FAILED, COMPENSATED
        }
    }
}
