package com.devteria.identity.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Date;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.devteria.event.dto.StoreNotificationEvent;
import com.devteria.identity.dto.request.AuthenticationRequest;
import com.devteria.identity.dto.request.IntrospectRequest;
import com.devteria.identity.dto.response.AuthenticationResponse;
import com.devteria.identity.dto.response.IntrospectResponse;
import com.devteria.identity.entity.RefreshToken;
import com.devteria.identity.entity.User;
import com.devteria.identity.exception.AppException;
import com.devteria.identity.exception.ErrorCode;
import com.devteria.identity.repository.InvalidatedTokenRepository;
import com.devteria.identity.repository.RefreshTokenRepository;
import com.devteria.identity.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    RefreshTokenRepository refreshTokenRepository;
    KafkaTemplate<String, Object> kafkaTemplate;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refresh-token-duration}")
    protected long REFRESH_TOKEN_DURATION;

    @NonFinal
    @Value("${cookie.secure:false}")
    protected boolean COOKIE_SECURE;

    // ─── Introspect ─────────────────────────────────────────────────────────

    public IntrospectResponse introspect(IntrospectRequest request) throws ParseException {
        var token = request.getToken();
        boolean isValid = true;
        SignedJWT jwt = null;

        try {
            jwt = verifyToken(token);
        } catch (AppException | JOSEException | ParseException e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .userId(
                        Objects.nonNull(jwt)
                                ? resolveUserId(jwt.getJWTClaimsSet().getSubject())
                                : null)
                .valid(isValid)
                .build();
    }

    // ─── Login ──────────────────────────────────────────────────────────────

    public AuthenticationResponse authenticate(
            AuthenticationRequest request, HttpServletResponse response, String cookieName) {
        User user = verifyCredentials(request);
        issueRefreshCookie(response, cookieName, user.getId());

        try {
            kafkaTemplate.send(
                    "notification.store",
                    StoreNotificationEvent.builder()
                            .userId(user.getId())
                            .type("LOGIN")
                            .title("Đăng nhập thành công")
                            .body("Bạn đã đăng nhập vào PC Store.")
                            .isSystem(false)
                            .actionRequired(false)
                            .build());
        } catch (Exception e) {
            log.warn("Failed to publish login notification for userId={}", user.getId(), e);
        }

        return buildAuthResponse(user);
    }

    public AuthenticationResponse authenticateForPortal(
            AuthenticationRequest request, Set<String> allowedRoles, HttpServletResponse response, String cookieName) {
        User user = verifyCredentials(request);

        boolean hasRequiredRole =
                user.getRoles() != null && user.getRoles().stream().anyMatch(r -> allowedRoles.contains(r.getName()));
        if (!hasRequiredRole) throw new AppException(ErrorCode.UNAUTHORIZED_FOR_PORTAL);

        issueRefreshCookie(response, cookieName, user.getId());
        return buildAuthResponse(user);
    }

    // ─── Refresh ────────────────────────────────────────────────────────────

    public AuthenticationResponse refreshToken(
            HttpServletRequest request, HttpServletResponse response, String cookieName) {
        String rtValue = extractRefreshCookie(request, cookieName);
        if (rtValue == null) throw new AppException(ErrorCode.UNAUTHENTICATED);

        RefreshToken rt =
                refreshTokenRepository.findById(rtValue).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (rt.isRevoked() || rt.getExpiresAt().before(new Date())) throw new AppException(ErrorCode.UNAUTHENTICATED);

        // Rotate: revoke old, issue new
        rt.setRevoked(true);
        refreshTokenRepository.save(rt);

        User user =
                userRepository.findById(rt.getUserId()).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        issueRefreshCookie(response, cookieName, user.getId());
        return buildAuthResponse(user);
    }

    // ─── Logout ─────────────────────────────────────────────────────────────

    public void logout(HttpServletRequest request, HttpServletResponse response, String cookieName) {
        String rtValue = extractRefreshCookie(request, cookieName);
        if (rtValue != null) {
            refreshTokenRepository.findById(rtValue).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
        clearRefreshCookie(response, cookieName);
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    private User verifyCredentials(AuthenticationRequest request) {
        PasswordEncoder encoder = new BCryptPasswordEncoder(10);
        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (!encoder.matches(request.getPassword(), user.getPassword()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        return user;
    }

    private void issueRefreshCookie(HttpServletResponse response, String cookieName, String userId) {
        String id = UUID.randomUUID().toString();
        Date expiresAt = new Date(
                Instant.now().plus(REFRESH_TOKEN_DURATION, ChronoUnit.SECONDS).toEpochMilli());
        refreshTokenRepository.save(RefreshToken.builder()
                .id(id)
                .userId(userId)
                .expiresAt(expiresAt)
                .revoked(false)
                .build());
        setRefreshCookie(response, cookieName, id);
    }

    private void setRefreshCookie(HttpServletResponse response, String cookieName, String value) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, value)
                .httpOnly(true)
                .secure(COOKIE_SECURE)
                .path("/")
                .maxAge(REFRESH_TOKEN_DURATION)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response, String cookieName) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(COOKIE_SECURE)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private String extractRefreshCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        return Arrays.stream(cookies)
                .filter(c -> cookieName.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private AuthenticationResponse buildAuthResponse(User user) {
        TokenInfo ti = generateToken(user);
        return AuthenticationResponse.builder()
                .token(ti.token())
                .authenticated(true)
                .expiryTime(ti.expiryDate())
                .build();
    }

    private TokenInfo generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        Date expiryDate =
                new Date(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli());

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer("devteria.com")
                .issueTime(new Date())
                .expirationTime(expiryDate)
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        JWSObject jws = new JWSObject(header, new Payload(claims.toJSONObject()));
        try {
            jws.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return new TokenInfo(jws.serialize(), expiryDate);
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        if (!signedJWT.verify(verifier)
                || signedJWT.getJWTClaimsSet().getExpirationTime().before(new Date()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private Optional<User> findUserBySubject(String subject) {
        return userRepository.findById(subject).or(() -> userRepository.findByUsername(subject));
    }

    private String resolveUserId(String subject) {
        return findUserBySubject(subject).map(User::getId).orElse(subject);
    }

    @Transactional
    protected String buildScope(User user) {
        StringJoiner sj = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                sj.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(p -> sj.add(p.getName()));
            });
        return sj.toString();
    }

    private record TokenInfo(String token, Date expiryDate) {}
}
