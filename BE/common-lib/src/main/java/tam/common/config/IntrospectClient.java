package tam.common.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import tam.common.base.ApiResponse;
import tam.common.constants.dto.IntrospectRequest;
import tam.common.constants.dto.IntrospectResponse;

@FeignClient(name = "IDENTITY-SERVICE", path = "/identity-service", configuration = IntrospectFeignConfig.class)
public interface IntrospectClient {
    @PostMapping("/auth/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request);
}