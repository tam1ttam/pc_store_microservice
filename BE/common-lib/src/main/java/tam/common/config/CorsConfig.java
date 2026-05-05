package tam.common.config;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import tam.common.constants.Property;

@AutoConfiguration
@RequiredArgsConstructor
public class CorsConfig {

    private final Property securityProps;

    @Bean
    public WebMvcConfigurer corsConfigure() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Lấy origins từ Property bean (đã bind từ app.security.allowed-origins trong
                // yml)
                String[] origins = securityProps.getAllowedOrigins().toArray(new String[0]);
                registry.addMapping("/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
