package com.tam.product.service.impl;

import java.util.Arrays;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityBeanChecker implements ApplicationRunner {

    private final ApplicationContext context;

    @Override
    public void run(ApplicationArguments args) {
        log.warn("========== SECURITY BEAN CHECKER ==========");

        // 1. Kiểm tra SecurityFilterChain beans
        String[] filterChains = context.getBeanNamesForType(SecurityFilterChain.class);
        log.warn("SecurityFilterChain beans found: {}", filterChains.length);
        for (String name : filterChains) {
            SecurityFilterChain chain = context.getBean(name, SecurityFilterChain.class);
            log.warn(
                    "  → Chain bean name: '{}' | class: {}",
                    name,
                    chain.getClass().getName());
        }

        // 2. Kiểm tra BaseSecurityConfig có được load không
        try {
            Object baseConfig = context.getBean("tam.common.config.BaseSecurityConfig");
            log.warn(
                    "BaseSecurityConfig bean: FOUND → {}", baseConfig.getClass().getName());
        } catch (Exception e) {
            log.warn("BaseSecurityConfig bean: NOT FOUND → {}", e.getMessage());
        }

        // 3. Kiểm tra CustomJwtDecoder
        try {
            Object decoder = context.getBean("customJwtDecoder");
            log.warn("CustomJwtDecoder bean: FOUND → {}", decoder.getClass().getName());
        } catch (Exception e) {
            log.warn("CustomJwtDecoder bean: NOT FOUND → {}", e.getMessage());
        }

        // 4. Kiểm tra Property bean
        try {
            Object property = context.getBean("tam.common.constants.Property");
            log.warn(
                    "Property (securityProps) bean: FOUND → {}",
                    property.getClass().getName());
        } catch (Exception e) {
            try {
                Object property = context.getBean("property");
                log.warn(
                        "Property (securityProps) bean: FOUND as 'property' → {}",
                        property.getClass().getName());
            } catch (Exception e2) {
                log.warn("Property (securityProps) bean: NOT FOUND → {}", e.getMessage());
            }
        }

        // 5. List tất cả beans có chứa "security" hoặc "Security" trong tên
        log.warn("--- All beans with 'security' in name ---");
        Arrays.stream(context.getBeanDefinitionNames())
                .filter(name -> name.toLowerCase().contains("security")
                        || name.toLowerCase().contains("jwt"))
                .forEach(name -> log.warn("  bean: {}", name));

        log.warn("===========================================");
    }
}
