package com.tam.identity.services.impl;

import com.tam.identity.dtos.request.auth.LoginRequest;
import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.LoginResult;
import com.tam.identity.dtos.response.auth.RegisterResponse;
import com.tam.identity.services.AuthService;
import com.tam.identity.services.KeycloakAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final KeycloakAuthService keycloakAuthService;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        return keycloakAuthService.register(request);
    }

    @Override
    public LoginResult login(LoginRequest request) {
        AuthTokenResponse tokens = keycloakAuthService.login(request.getPhoneNumber(), request.getPassword());
        
        return LoginResult.builder()
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .tokenType(tokens.getTokenType())
                .expiresIn(tokens.getExpiresIn())
                .build();
    }

    @Override
    public LoginResult refreshToken(String refreshToken) {
        AuthTokenResponse tokenResponse = keycloakAuthService.refreshToken(refreshToken);
        
        return LoginResult.builder()
                .accessToken(tokenResponse.getAccessToken())
                .refreshToken(tokenResponse.getRefreshToken())
                .tokenType(tokenResponse.getTokenType())
                .expiresIn(tokenResponse.getExpiresIn())
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        keycloakAuthService.revokeRefreshToken(refreshToken);
    }
}
