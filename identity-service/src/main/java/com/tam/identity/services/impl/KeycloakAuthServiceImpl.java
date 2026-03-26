package com.tam.identity.services.impl;

import com.tam.identity.clients.KeycloakIdentityClient;
import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.RegisterResponse;
import com.tam.identity.services.KeycloakAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakAuthServiceImpl implements KeycloakAuthService {
    private final KeycloakIdentityClient keycloakIdentityClient;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        String identityUserId = keycloakIdentityClient.createUser(request);
        return RegisterResponse.builder()
                .identityUserId(identityUserId)
                .build();
    }

    @Override
    public AuthTokenResponse login(String phoneNumber, String password) {
        return keycloakIdentityClient.login(phoneNumber, password);
    }

    @Override
    public AuthTokenResponse refreshToken(String refreshToken) {
        return keycloakIdentityClient.refreshToken(refreshToken);
    }

    @Override
    public void revokeRefreshToken(String refreshToken) {
        keycloakIdentityClient.revokeRefreshToken(refreshToken);
    }
}
