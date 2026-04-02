package tam.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SearchServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Search Service is running";
    }
}
