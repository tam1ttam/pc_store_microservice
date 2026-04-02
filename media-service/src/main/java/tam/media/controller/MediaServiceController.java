package tam.media.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MediaServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Media Service is running";
    }
}
