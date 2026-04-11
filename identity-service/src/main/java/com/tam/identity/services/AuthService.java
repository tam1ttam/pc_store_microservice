package com.tam.identity.services;

import com.tam.identity.dtos.request.auth.LoginRequest;
import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.LoginResult;
import com.tam.identity.dtos.response.auth.RegisterResponse;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);

    LoginResult login(LoginRequest request);
    LoginResult loginWithGoogle();
    LoginResult refreshToken(String refreshToken);

    void logout(String refreshToken);
}
