package tam.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TaxServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Tax Service is running";
    }
}
