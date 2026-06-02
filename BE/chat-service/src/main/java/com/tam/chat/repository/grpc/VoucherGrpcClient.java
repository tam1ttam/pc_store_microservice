package com.tam.chat.repository.grpc;

import java.util.List;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.tam.proto.voucher.v1.GetActiveVouchersRequest;
import com.tam.proto.voucher.v1.GetActiveVouchersResponse;
import com.tam.proto.voucher.v1.VoucherResponse;
import com.tam.proto.voucher.v1.VoucherServiceGrpc;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class VoucherGrpcClient {

    @Value("${app.services.order.grpc-host:localhost}")
    private String host;

    @Value("${app.services.order.grpc-port:6165}")
    private int port;

    private VoucherServiceGrpc.VoucherServiceBlockingStub stub;

    @PostConstruct
    public void init() {
        ManagedChannel channel =
                ManagedChannelBuilder.forAddress(host, port).usePlaintext().build();
        stub = VoucherServiceGrpc.newBlockingStub(channel);
        log.info("gRPC VoucherClient connected to {}:{}", host, port);
    }

    public List<VoucherResponse> getActiveVouchers(String userId) {
        try {
            GetActiveVouchersRequest.Builder builder =
                    GetActiveVouchersRequest.newBuilder().setPage(1).setPageSize(50);
            if (userId != null && !userId.isBlank()) {
                builder.setUserId(userId);
            }
            GetActiveVouchersResponse resp = stub.getActiveVouchers(builder.build());
            return resp.getVouchersList();
        } catch (StatusRuntimeException e) {
            log.warn("gRPC getActiveVouchers failed for userId={}: {}", userId, e.getMessage());
            return List.of();
        }
    }
}
