package tam.shipping.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShippingServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Shipping Service is running";
    }
}
