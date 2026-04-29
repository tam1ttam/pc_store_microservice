package tam.common.constants;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.security")
public class Property {
    private List<String> permitAllEndpoints;
    private List<String> allowedOrigins;
}
