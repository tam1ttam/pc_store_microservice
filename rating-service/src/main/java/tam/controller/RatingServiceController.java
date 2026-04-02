package tam.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RatingServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Rating Service is running";
    }
}
