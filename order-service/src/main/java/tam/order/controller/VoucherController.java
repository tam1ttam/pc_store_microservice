package tam.order.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tam.order.dto.req.CreateVoucherRequest;
import tam.order.dto.res.VoucherResponse;
import tam.order.service.VoucherService;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/vouchers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoucherController {

    VoucherService voucherService;

    /**
     * POST /api/v1/vouchers
     * Tạo voucher mới (Admin)
     */
    @PostMapping
    public ResponseEntity<VoucherResponse> createVoucher(@RequestBody CreateVoucherRequest request) {
        //TODO: Validate user is admin
        VoucherResponse response = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/vouchers/{voucherId}
     * Lấy chi tiết voucher
     */
    @GetMapping("/{voucherId}")
    public ResponseEntity<VoucherResponse> getVoucher(@PathVariable String voucherId) {
        VoucherResponse response = voucherService.getVoucher(voucherId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/vouchers
     * Lấy danh sách voucher còn hiệu lực
     */
    @GetMapping
    public ResponseEntity<Page<VoucherResponse>> getActiveVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VoucherResponse> response = voucherService.getActiveVouchers(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/vouchers/{voucherId}
     * Cập nhật voucher (Admin)
     */
    @PutMapping("/{voucherId}")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable String voucherId,
            @RequestBody CreateVoucherRequest request) {
        //TODO: Validate user is admin
        VoucherResponse response = voucherService.updateVoucher(voucherId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/vouchers/{voucherId}
     * Xóa voucher (Admin)
     */
    @DeleteMapping("/{voucherId}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable String voucherId) {
        //TODO: Validate user is admin
        voucherService.deleteVoucher(voucherId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/vouchers/validate/{code}
     * Validate voucher code
     */
    @GetMapping("/validate/{code}")
    public ResponseEntity<VoucherResponse> validateVoucher(@PathVariable String code) {
        VoucherResponse response = voucherService.validateVoucher(code);
        return ResponseEntity.ok(response);
    }
}
