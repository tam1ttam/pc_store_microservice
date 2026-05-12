package com.tam.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;

@RestController
@Slf4j
public class Fallback {




    @RequestMapping("/fallback/unavailble")
    public Mono<Void> defaultFallback(ServerWebExchange exchange) {
        // 1. Lấy Origin từ Header
        String origin = exchange.getRequest().getHeaders().getOrigin();

        // 2. Nếu không có Origin (do gọi trực tiếp hoặc tool), thử lấy từ Referer
        if (origin == null) {
            URI referer = exchange.getRequest().getHeaders().getLocation();
            if (referer != null) {
                // Lấy phần scheme + host + port (ví dụ: http://localhost:3000)
                origin = referer.getScheme() + "://" + referer.getAuthority();
            }
        }

        // 3. Nếu vẫn null thì dùng cấu hình mặc định
        String finalRedirectBase = (origin != null) ? origin : "";

        log.info("Fallback redirecting to: {}", finalRedirectBase);

        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FOUND);
        response.getHeaders().setLocation(URI.create(finalRedirectBase + "/error?code=503"));
        return response.setComplete();
    }
}
