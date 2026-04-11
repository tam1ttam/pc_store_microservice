package com.tam.identity.services;

import com.tam.identity.dtos.request.auth.GoogleLoginRequest;
import com.tam.identity.dtos.response.auth.LoginResult;

public interface GoogleAuthService {
    LoginResult loginWithGoogle(GoogleLoginRequest request);
    LoginResult registerWithGoogle(GoogleLoginRequest request);
}
