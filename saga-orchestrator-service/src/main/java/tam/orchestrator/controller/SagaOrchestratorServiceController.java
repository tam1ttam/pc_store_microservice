package tam.orchestrator.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SagaOrchestratorServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Saga Orchestrator Service is running";
    }
}
