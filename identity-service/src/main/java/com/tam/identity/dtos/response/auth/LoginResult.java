package com.tam.identity.dtos.response.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResult {
    private String identityUserId;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
}
