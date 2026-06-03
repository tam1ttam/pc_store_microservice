package tam.orchestrator.kafka;

import lombok.*;
import java.util.*;

public class SagaEvents {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SagaCommand {
        private String sagaId;
        private String commandType; // e.g., "RESERVE_STOCK", "APPLY_VOUCHER", "CREATE_PAYPAL_ORDER", "COMPENSATE_STOCK", "COMPENSATE_VOUCHER"
        private Map<String, Object> payload;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SagaReply {
        private String sagaId;
        private String stepName;
        private boolean success;
        private String errorReason;
        private Map<String, Object> result;
    }
}
