package com.tam.identity.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IdentityServiceController {
    
    @GetMapping("/health")
    public String health() {
        return "Identity Service is running";
    }
}
