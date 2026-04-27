package tam.order.mapper;

import org.springframework.stereotype.Component;
import tam.order.dto.req.CreateVoucherRequest;
import tam.order.dto.res.VoucherResponse;
import tam.order.entity.Voucher;

import java.util.Collection;
import java.util.List;

@Component
public class VoucherMapper {

    public VoucherResponse toResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .voucherId(voucher.getVoucherId())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountAmount(voucher.getDiscountAmount())
                .discountPercent(voucher.getDiscountPercent())
                .maxUsage(voucher.getMaxUsage())
                .usedCount(voucher.getAmount())
                .expiredAt(voucher.getExpiredAt())
                .isActive(voucher.getIsActive())
                .voucherType(voucher.getVoucherType())
                .build();
    }

    public Voucher toEntity(CreateVoucherRequest request) {
        return Voucher.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .discountAmount(request.getDiscountAmount())
                .discountPercent(request.getDiscountPercent())
                .maxUsage(request.getMaxUsage())
                .expiredAt(request.getExpiredAt())
                .voucherType(request.getVoucherType())
                .amount(0)
                .isActive(true)
                .build();
    }

    public List<VoucherResponse> toResponseList(Collection<Voucher> vouchers) {
        if (vouchers == null) return List.of();
        return vouchers.stream().map(this::toResponse).toList();
    }
}
