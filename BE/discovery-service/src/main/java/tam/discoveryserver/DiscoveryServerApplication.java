package tam.discoveryserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = "tam.discoveryserver")
@EnableEurekaServer
public class DiscoveryServerApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("GMT +0:00"));
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }

}




