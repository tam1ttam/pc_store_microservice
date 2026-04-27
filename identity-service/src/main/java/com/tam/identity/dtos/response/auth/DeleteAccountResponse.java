package com.tam.identity.dtos.response.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeleteAccountResponse {
    boolean isDeleted;
    @Builder.Default
    boolean isExpired = true;
}
