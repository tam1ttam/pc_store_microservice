package com.tam.chat.repository.grpc;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.tam.chat.dto.response.UserProfileResponse;
import com.tam.proto.profile.v1.GetCustomerByUserIdRequest;
import com.tam.proto.profile.v1.GetCustomerResponse;
import com.tam.proto.profile.v1.ProfileServiceGrpc;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ProfileGrpcClient {

    @Value("${app.services.profile.grpc-host:localhost}")
    private String host;

    @Value("${app.services.profile.grpc-port:6163}")
    private int port;

    private ProfileServiceGrpc.ProfileServiceBlockingStub stub;

    @PostConstruct
    public void init() {
        ManagedChannel channel =
                ManagedChannelBuilder.forAddress(host, port).usePlaintext().build();
        stub = ProfileServiceGrpc.newBlockingStub(channel);
        log.info("gRPC ProfileClient connected to {}:{}", host, port);
    }

    public UserProfileResponse getProfileByUserId(String userId) {
        try {
            GetCustomerResponse resp = stub.getCustomerByUserId(
                    GetCustomerByUserIdRequest.newBuilder().setUserId(userId).build());
            return UserProfileResponse.builder()
                    .userId(userId)
                    .username(resp.getUserName())
                    .firstName(resp.getFirstName())
                    .lastName(resp.getLastName())
                    .avatar(resp.getAvatar())
                    .build();
        } catch (StatusRuntimeException e) {
            log.warn("gRPC getProfileByUserId failed for userId={}: {}", userId, e.getMessage());
            return null;
        }
    }
}
