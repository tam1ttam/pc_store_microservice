package com.devteria.identity.kafka;

import java.util.*;

import lombok.*;

public class IdentitySagaEvents {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountCommand {
        private String sagaId;
        private String commandType; // CREATE_IDENTITY_ACCOUNT, DELETE_IDENTITY_ACCOUNT
        private Map<String, Object> payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountReply {
        private String sagaId;
        private String stepName;
        private boolean success;
        private String errorReason;
        private Map<String, Object> result;
    }
}
