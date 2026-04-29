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
@Component
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
        try {
            var response = introspectClient.introspect(
                    IntrospectRequest.builder().token(token).build());

            if (!response.isValid()) {
                // Cache invalid ngắn thôi (5 phút) để tránh cache rác quá lâu
                redisTemplate.opsForValue().set(cacheKey, INVALID, 5, TimeUnit.MINUTES);
                throw new JwtException("Token is invalid or revoked");
            }

            // Parse expiry từ JWT để tính TTL cache
            // Dùng Nimbus parse nhanh, không verify ở đây (verify ở bước sau)
            com.nimbusds.jwt.SignedJWT signedJWT = com.nimbusds.jwt.SignedJWT.parse(token);
            Instant expiry = signedJWT.getJWTClaimsSet()
                    .getExpirationTime().toInstant();
            long ttlSeconds = expiry.getEpochSecond() - Instant.now().getEpochSecond();

            if (ttlSeconds > 0) {
                redisTemplate.opsForValue().set(cacheKey, VALID, ttlSeconds, TimeUnit.SECONDS);
            }

        } catch (JwtException e) {
            throw e;
        } catch (Exception e) {
            // Identity-service không liên lạc được — fail open hay fail closed?
            // Hiện tại: fail closed (an toàn hơn)
            log.error("Cannot reach identity-service for introspect", e);
            throw new JwtException("Cannot validate token: identity-service unavailable");
        }
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