package tam.order.service;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "PRODUCT-SERVICE")
public interface ProductClient {
}