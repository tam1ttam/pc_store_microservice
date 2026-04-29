package tam.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.bson.types.ObjectId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ObjectMapper configuration for shared across all microservices.
 * Handles MongoDB ObjectId serialization and Java 8 DateTime support.
 */
@Configuration
public class ObjectMapperConfiguration {

    /**
     * Configure ObjectMapper bean with:
     * - Support for Java 8 Date/Time (LocalDate, LocalDateTime, etc.)
     * - MongoDB ObjectId -> String serialization
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Support Java 8 Date/Time types
        mapper.registerModule(new JavaTimeModule());

        // Serialize MongoDB ObjectId to String
        SimpleModule objectIdModule = new SimpleModule();
        objectIdModule.addSerializer(ObjectId.class, new ToStringSerializer());
        mapper.registerModule(objectIdModule);

        return mapper;
    }
}
