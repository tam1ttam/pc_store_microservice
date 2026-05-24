package com.tam.product.configuration;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.tam.product.entity.Category;
import com.tam.product.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class CategoryInitConfig {
    // keyword (lowercase, dùng cho query) -> name (dùng để hiển thị UI)
    static final Map<String, String> DEFAULT_CATEGORIES = new LinkedHashMap<>() {
        {
            put("pc", "PC");
            put("laptop", "Laptop");
            put("monitor", "Monitor");
            put("keyboard", "Keyboard");
            put("mouse", "Mouse");
            put("headphone", "Headphone");
            put("ram", "RAM");
            put("ssd", "SSD");
            put("vga", "VGA");
            put("mainboard", "Mainboard");
        }
    };

    @Bean
    ApplicationRunner categoryInitRunner(CategoryRepository categoryRepository) {
        return args -> {
            for (Map.Entry<String, String> entry : DEFAULT_CATEGORIES.entrySet()) {
                if (!categoryRepository.existsByKeyword(entry.getKey())) {
                    categoryRepository.save(Category.builder()
                            .keyword(entry.getKey())
                            .name(entry.getValue())
                            .build());
                }
            }
        };
    }
}
