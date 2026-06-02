package com.tam.order.kafka;

import java.util.*;

import lombok.*;

public class UserCartSagaEvents {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartCommand {
        private String sagaId;
        private String commandType; // CREATE_USER_CART, DELETE_USER_CART
        private Map<String, Object> payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartReply {
        private String sagaId;
        private String stepName;
        private boolean success;
        private String errorReason;
        private Map<String, Object> result;
    }
}
