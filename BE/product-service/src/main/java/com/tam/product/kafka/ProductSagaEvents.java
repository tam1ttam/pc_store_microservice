package com.tam.product.kafka;

import java.util.*;

import lombok.*;

public class ProductSagaEvents {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockCommand {
        private String sagaId;
        private String commandType; // RESERVE_STOCK, RELEASE_STOCK
        private Map<String, Object> payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockReply {
        private String sagaId;
        private String stepName;
        private boolean success;
        private String errorReason;
        private Map<String, Object> result;
    }
}
