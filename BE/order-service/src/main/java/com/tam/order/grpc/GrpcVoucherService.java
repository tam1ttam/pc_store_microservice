package com.tam.order.grpc;

import java.util.List;

import com.tam.order.service.VoucherService;
import com.tam.proto.voucher.v1.GetActiveVouchersRequest;
import com.tam.proto.voucher.v1.GetActiveVouchersResponse;
import com.tam.proto.voucher.v1.VoucherResponse;
import com.tam.proto.voucher.v1.VoucherServiceGrpc;
import com.tam.proto.voucher.v1.VoucherType;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcVoucherService extends VoucherServiceGrpc.VoucherServiceImplBase {

    private final VoucherService voucherService;

    private long toEpochMilli(java.time.LocalDateTime dt) {
        return dt != null
                ? dt.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()
                : 0;
    }

    @Override
    public void getActiveVouchers(
            GetActiveVouchersRequest request, StreamObserver<GetActiveVouchersResponse> responseObserver) {
        try {
            String userId = request.getUserId();
            if (userId == null || userId.isBlank()) {
                userId = null;
            }

            List<com.tam.order.dto.response.VoucherResponse> vouchers =
                    (userId == null) ? voucherService.getAll() : voucherService.getAvailableForUser(userId);

            GetActiveVouchersResponse.Builder builder = GetActiveVouchersResponse.newBuilder()
                    .setTotalPages(1)
                    .setCurrentPage(0)
                    .setTotalItems(vouchers.size());

            for (com.tam.order.dto.response.VoucherResponse v : vouchers) {
                builder.addVouchers(VoucherResponse.newBuilder()
                        .setVoucherId(v.getId() != null ? v.getId().toString() : "")
                        .setCode(v.getCode() != null ? v.getCode() : "")
                        .setDescription(v.getDescription() != null ? v.getDescription() : "")
                        .setDiscountAmount(v.getDiscountAmount() != null ? v.getDiscountAmount() : 0)
                        .setDiscountPercent(v.getDiscountPercent() != null ? v.getDiscountPercent() : 0)
                        .setMaxUsage(v.getMaxUsage() != null ? v.getMaxUsage() : 0)
                        .setUsedCount(v.getUsedCount() != null ? v.getUsedCount() : 0)
                        .setExpiredAt(toEpochMilli(v.getExpiredAt()))
                        .setIsActive(v.getIsActive() != null && v.getIsActive())
                        .setVoucherType(
                                v.getVoucherType() != null
                                        ? VoucherType.valueOf(v.getVoucherType().name())
                                        : VoucherType.VOUCHER_TYPE_STACKABLE)
                        .build());
            }

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getActiveVouchers gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }
}
