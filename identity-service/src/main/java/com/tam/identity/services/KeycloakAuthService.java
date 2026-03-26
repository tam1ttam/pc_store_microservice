package com.tam.identity.services;

import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.RegisterResponse;

public interface KeycloakAuthService {
    RegisterResponse register(RegisterRequest request);

    AuthTokenResponse login(String phoneNumber, String password);

    AuthTokenResponse refreshToken(String refreshToken);

    void revokeRefreshToken(String refreshToken);
}
