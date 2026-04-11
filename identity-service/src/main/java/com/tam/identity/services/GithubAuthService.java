package com.tam.identity.services;

import com.tam.identity.dtos.request.auth.GithubLoginRequest;
import com.tam.identity.dtos.response.auth.LoginResult;

public interface GithubAuthService {
    LoginResult loginWithGithub(GithubLoginRequest request);
    LoginResult registerWithGithub(GithubLoginRequest request);
}
