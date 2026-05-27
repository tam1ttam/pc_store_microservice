package com.tam.order.kafka;

import java.util.*;

import lombok.*;

public class OrderSagaEvents {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutCommand {
        private String sagaId;
        private String commandType; // APPLY_VOUCHER, CREATE_PAYPAL_ORDER, COMPENSATE_ORDER
        private Map<String, Object> payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutReply {
        private String sagaId;
        private String stepName;
        private boolean success;
        private String errorReason;
        private Map<String, Object> result;
    }
}
