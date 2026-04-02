package tam.discoveryserver.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DiscoveryServerController {

    @GetMapping("/health")
    public String health() {
        return "Discovery Server is running";
    }
}
