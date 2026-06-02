package com.tam.profile.kafka;

import java.util.*;

import lombok.*;

public class ProfileSagaEvents {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileCommand {
        private String sagaId;
        private String commandType; // CREATE_CUSTOMER_PROFILE, DELETE_CUSTOMER_PROFILE
        private Map<String, Object> payload;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileReply {
        private String sagaId;
        private String stepName;
        private boolean success;
        private String errorReason;
        private Map<String, Object> result;
    }
}
