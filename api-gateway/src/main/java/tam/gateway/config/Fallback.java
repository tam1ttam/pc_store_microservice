package tam.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;

@RestController
@Slf4j
public class Fallback {

    @Value("${app.frontend.url:http://localhost:3003}")
    private String frontendUrl;


    @GetMapping("/fallback/unavailble")
    public Mono<Void> defaultFallback(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FOUND);
        response.getHeaders().setLocation(URI.create(frontendUrl + "/error?code=503"));
        return response.setComplete();
    }
}
