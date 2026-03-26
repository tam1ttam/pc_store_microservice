package tam.order.service;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class CallAPI {

    private WebClient.Builder webClientBuilder;
}
