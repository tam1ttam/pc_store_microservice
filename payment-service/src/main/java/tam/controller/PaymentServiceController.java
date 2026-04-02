package tam.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Payment Service is running";
    }
}
