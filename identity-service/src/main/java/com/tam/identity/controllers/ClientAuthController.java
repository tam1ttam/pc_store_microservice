package com.tam.identity.controllers;

import com.tam.identity.dtos.request.auth.GithubLoginRequest;
import com.tam.identity.dtos.request.auth.GoogleLoginRequest;
import com.tam.identity.dtos.request.auth.LoginRequest;
import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.LoginResult;
import com.tam.identity.dtos.response.auth.RegisterResponse;
import com.tam.identity.services.AuthService;
import com.tam.identity.services.GithubAuthService;
import com.tam.identity.services.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${app.prefix}/auth")
@RequiredArgsConstructor
public class ClientAuthController {
    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    private final GithubAuthService githubAuthService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResult> login(@RequestBody LoginRequest request) {
        LoginResult result = authService.login(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login/google")
    public ResponseEntity<LoginResult> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        LoginResult result = googleAuthService.loginWithGoogle(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register/google")
    public ResponseEntity<LoginResult> registerWithGoogle(@RequestBody GoogleLoginRequest request) {
        LoginResult result = googleAuthService.registerWithGoogle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login/github")
    public ResponseEntity<LoginResult> loginWithGithub(@RequestBody GithubLoginRequest request) {
        LoginResult result = githubAuthService.loginWithGithub(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register/github")
    public ResponseEntity<LoginResult> registerWithGithub(@RequestBody GithubLoginRequest request) {
        LoginResult result = githubAuthService.registerWithGithub(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResult> refreshToken(@RequestParam String refreshToken) {
        LoginResult result = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestParam String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent().build();
    }
}
