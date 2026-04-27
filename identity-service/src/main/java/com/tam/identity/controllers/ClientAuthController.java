package com.tam.identity.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.DeleteAccountResponse;
import com.tam.identity.dtos.response.auth.MeResponse;
import com.tam.identity.services.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.result.view.RedirectView;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("${app.prefix}/auth")
@RequiredArgsConstructor
@Slf4j
public class ClientAuthController {

    private final UserService userService;

    @GetMapping("/login")
    public void login(HttpServletResponse response) throws IOException {
        String realm = "iluttmab";
        String clientId = "iluttmab-client";
        String backendCallbackUrl = "http://localhost:6060/api-gateway/identity-service/api/v1/auth/callback/login";
        String keycloakUrl = "http://localhost:8181"
                + "/realms/" + realm + "/protocol/openid-connect/auth"
                + "?client_id=" + clientId
                + "&redirect_uri=" + URLEncoder.encode(backendCallbackUrl, StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&scope=openid+profile+email";

        response.sendRedirect(keycloakUrl);
    }

    @GetMapping("/register")
    public void register(HttpServletResponse response) throws IOException {
        String realm = "iluttmab";
        String clientId = "iluttmab-client";
        String backendCallbackUrl = "http://localhost:6060/api-gateway/identity-service/api/v1/auth/callback/login";
        String keycloakUrl = "http://localhost:8181"
                + "/realms/" + realm + "/protocol/openid-connect/registrations"
                + "?client_id=" + clientId
                + "&redirect_uri=" + URLEncoder.encode(backendCallbackUrl, StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&scope=openid+profile+email";

        response.sendRedirect(keycloakUrl);
    }

    @GetMapping("/callback/login")
    public ResponseEntity<Void> handleRegisterCallback(
            @RequestParam("code") String code,
            HttpServletResponse response) throws JsonProcessingException {

        var authResponse = userService.handleRegisterCallback(code);
        ResponseCookie accessCookie = createCookie("accessToken", authResponse.getAccessToken(), authResponse.getExpiresIn());
        ResponseCookie refreshCookie = createCookie("refreshToken", authResponse.getRefreshToken(), authResponse.getRefreshExpiresIn());
        String profileJson = URLEncoder.encode(
                new ObjectMapper().writeValueAsString(authResponse.getUserProfile()), StandardCharsets.UTF_8);
        ResponseCookie profileCookie = ResponseCookie.from("userProfile", profileJson)
                .httpOnly(false)
                .path("/")
                .maxAge(60)
                .sameSite("Lax")
                .build();
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.SET_COOKIE, String.valueOf(accessCookie))
                .header(HttpHeaders.SET_COOKIE, String.valueOf(refreshCookie))
                .header(HttpHeaders.SET_COOKIE, String.valueOf(profileCookie))
                .location(URI.create("http://localhost:3003"))
                .build();
    }

    private ResponseCookie createCookie(String name, String value, long maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refreshToken(@CookieValue("refreshToken") String refreshToken) {
        var newTokens = userService.refreshAccessToken(refreshToken);
        ResponseCookie newAccessCookie = ResponseCookie.from("accessToken", newTokens.getAccessToken())
                .httpOnly(true).path("/").maxAge(newTokens.getExpiresIn()).build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newAccessCookie.toString())
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        if (refreshToken != null && !refreshToken.isEmpty()) {
            userService.revokeToken(refreshToken);
        }
        ResponseCookie deleteAccess = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        ResponseCookie deleteRefresh = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteAccess.toString())
                .header(HttpHeaders.SET_COOKIE, deleteRefresh.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> getCurrentUser(
            @CookieValue(name = "accessToken", required = false) String accessToken) {

        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        var responseMe = userService.me(accessToken);
        return ResponseEntity.ok(responseMe);
    }

    @GetMapping("/callback/delete-account")
    public ResponseEntity<DeleteAccountResponse> handleDeleteAccountCallback(
            @RequestParam("code") String code) {
        return ResponseEntity.status(200).body(userService.handleDeleteAccountCallback(code));
    }

}
