package tam.order.service;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "USER-SERVICE")
public interface UserClient {
}
