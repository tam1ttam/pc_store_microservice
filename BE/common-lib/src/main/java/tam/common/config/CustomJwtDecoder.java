package tam.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import tam.common.constants.dto.IntrospectRequest;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component("customJwtDecoder")
@RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.signerKey}")
    private String signerKey;

    private final IntrospectClient introspectClient;
    private final StringRedisTemplate redisTemplate;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    private static final String CACHE_PREFIX = "introspect:";
    private static final String VALID = "1";
    private static final String INVALID = "0";

    @Override
    public Jwt decode(String token) throws JwtException {
        String cacheKey = CACHE_PREFIX + hashToken(token);

        // 1. Check cache
        String cached = redisTemplate.opsForValue().get(cacheKey);

        if (INVALID.equals(cached)) {
            throw new JwtException("Token has been revoked");
        }

        if (cached == null) {
            // 2. Cache MISS — gọi introspect
            callIntrospectAndCache(token, cacheKey);
        }
        // cached == VALID → skip introspect

        // 3. Verify signature + decode
        return getNimbusDecoder().decode(token);
    }

    private void callIntrospectAndCache(String token, String cacheKey) {
        int maxRetries = 3;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                var response = introspectClient.introspect(
                        IntrospectRequest.builder().token(token).build());

                if (response.getResult() == null || !response.getResult().isValid()) {
                    redisTemplate.opsForValue().set(cacheKey, INVALID, 5, TimeUnit.MINUTES);
                    throw new JwtException("Token is invalid or revoked");
                }

                com.nimbusds.jwt.SignedJWT signedJWT = com.nimbusds.jwt.SignedJWT.parse(token);
                Instant expiry = signedJWT.getJWTClaimsSet()
                        .getExpirationTime().toInstant();
                long ttlSeconds = expiry.getEpochSecond() - Instant.now().getEpochSecond();

                if (ttlSeconds > 0) {
                    redisTemplate.opsForValue().set(cacheKey, VALID, ttlSeconds, TimeUnit.SECONDS);
                }
                return;

            } catch (JwtException e) {
                throw e;
            } catch (Exception e) {
                lastException = e;
                log.warn("Introspect attempt {}/{} failed: {}", attempt, maxRetries, e.getMessage());
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(300L * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        log.error("Cannot reach identity-service for introspect after {} attempts", maxRetries, lastException);
        throw new JwtException("Cannot validate token: identity-service unavailable");
    }

    private NimbusJwtDecoder getNimbusDecoder() {
        if (nimbusJwtDecoder == null) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    signerKey.getBytes(StandardCharsets.UTF_8), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(
                            org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS512)
                    .build();
        }
        return nimbusJwtDecoder;
    }

    // Hash token để không lưu raw JWT vào Redis
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            // fallback: dùng 32 ký tự cuối token (không lý tưởng nhưng không crash)
            return token.length() > 32 ? token.substring(token.length() - 32) : token;
        }
    }
}