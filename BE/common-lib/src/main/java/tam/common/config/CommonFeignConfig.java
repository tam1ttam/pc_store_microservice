package tam.common.config;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

@AutoConfiguration
@EnableFeignClients(basePackageClasses = IntrospectClient.class)
public class CommonFeignConfig { }