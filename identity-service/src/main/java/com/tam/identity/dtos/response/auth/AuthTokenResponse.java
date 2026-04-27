package com.tam.identity.dtos.response.auth;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AuthTokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    @Builder.Default
    private boolean isExpired = false;
    private long expiresIn;
    private long refreshExpiresIn;
    private Object userProfile;
}
