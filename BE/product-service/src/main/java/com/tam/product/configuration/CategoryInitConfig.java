package com.tam.product.configuration;

import java.util.List;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.tam.product.entity.Category;
import com.tam.product.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class CategoryInitConfig {
    static final List<String> DEFAULT_CATEGORIES =
            List.of("PC", "Laptop", "Monitor", "Keyboard", "Mouse", "Headphone", "RAM", "SSD", "VGA", "Mainboard");

    @Bean
    ApplicationRunner categoryInitRunner(CategoryRepository categoryRepository) {
        return args -> {
            for (String name : DEFAULT_CATEGORIES) {
                if (!categoryRepository.existsByNameIgnoreCase(name)) {
                    categoryRepository.save(Category.builder().name(name).build());
                }
            }
        };
    }
}
