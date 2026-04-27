package tam.order.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tam.order.dto.req.CreateVoucherRequest;
import tam.order.dto.res.VoucherResponse;
import tam.order.entity.Voucher;
import tam.order.repository.VoucherRepository;
import tam.order.service.VoucherService;

import java.time.Instant;

@Slf4j
@RequiredArgsConstructor
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherServiceImpl implements VoucherService {

    VoucherRepository voucherRepository;

    @Override
    public VoucherResponse createVoucher(CreateVoucherRequest request) {
        //TODO: Validate user is admin
        
        Voucher voucher = Voucher.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .discountAmount(request.getDiscountAmount())
                .discountPercent(request.getDiscountPercent())
                .maxUsage(request.getMaxUsage())
                .amount(0)
                .expiredAt(request.getExpiredAt())
                .isActive(true)
                .voucherType(request.getVoucherType())
                .build();

        Voucher savedVoucher = voucherRepository.save(voucher);
        log.info("Created voucher: {}", savedVoucher.getCode());
        return buildVoucherResponse(savedVoucher);
    }

    @Override
    public VoucherResponse getVoucher(String voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        return buildVoucherResponse(voucher);
    }

    @Override
    public Page<VoucherResponse> getActiveVouchers(Pageable pageable) {
        Page<Voucher> vouchers = voucherRepository.findByIsActiveAndExpiredAtAfter(true, Instant.now(), pageable);
        return vouchers.map(this::buildVoucherResponse);
    }

    @Override
    public VoucherResponse updateVoucher(String voucherId, CreateVoucherRequest request) {
        //TODO: Validate user is admin
        
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        voucher.setCode(request.getCode());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountAmount(request.getDiscountAmount());
        voucher.setDiscountPercent(request.getDiscountPercent());
        voucher.setMaxUsage(request.getMaxUsage());
        voucher.setExpiredAt(request.getExpiredAt());
        voucher.setVoucherType(request.getVoucherType());

        Voucher updatedVoucher = voucherRepository.save(voucher);
        log.info("Updated voucher: {}", updatedVoucher.getCode());
        return buildVoucherResponse(updatedVoucher);
    }

    @Override
    public void deleteVoucher(String voucherId) {
        //TODO: Validate user is admin
        
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        voucherRepository.delete(voucher);
        log.info("Deleted voucher: {}", voucher.getCode());
    }

    @Override
    public VoucherResponse validateVoucher(String code) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher code not found"));

        if (!voucher.getIsActive()) {
            throw new RuntimeException("Voucher is not active");
        }

        if (voucher.getExpiredAt().isBefore(Instant.now())) {
            throw new RuntimeException("Voucher has expired");
        }

        if (voucher.getAmount() >= voucher.getMaxUsage()) {
            throw new RuntimeException("Voucher usage limit exceeded");
        }

        return buildVoucherResponse(voucher);
    }

    private VoucherResponse buildVoucherResponse(Voucher voucher) {
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
}
