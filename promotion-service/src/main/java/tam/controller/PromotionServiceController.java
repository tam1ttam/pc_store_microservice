package tam.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PromotionServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Promotion Service is running";
    }
}
