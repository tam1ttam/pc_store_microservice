package com.tam.chat.repository.httpclient;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.tam.chat.dto.ApiResponse;
import com.tam.chat.dto.request.IntrospectRequest;
import com.tam.chat.dto.response.IntrospectResponse;
import com.tam.chat.dto.response.ManagerInfoResponse;

@FeignClient(name = "identity-client", url = "${app.services.identity.url}", path = "/identity-service")
public interface IdentityClient {
    @PostMapping("/auth/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request);

    @GetMapping("/internal/managers")
    ApiResponse<List<String>> getManagerIds();

    @GetMapping("/internal/managers/details")
    ApiResponse<List<ManagerInfoResponse>> getManagerDetails();
}
