package tam.order.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tam.order.dto.req.CreateVoucherRequest;
import tam.order.dto.res.VoucherResponse;

import java.util.List;

public interface VoucherService {
    /**
     * Tạo voucher mới (Admin)
     */
    VoucherResponse createVoucher(CreateVoucherRequest request);

    /**
     * Lấy chi tiết voucher
     */
    VoucherResponse getVoucher(String voucherId);

    /**
     * Lấy danh sách tất cả voucher còn hiệu lực
     */
    Page<VoucherResponse> getActiveVouchers(Pageable pageable);

    /**
     * Cập nhật voucher (Admin)
     */
    VoucherResponse updateVoucher(String voucherId, CreateVoucherRequest request);

    /**
     * Xóa voucher (Admin)
     */
    void deleteVoucher(String voucherId);

    /**
     * Validate voucher code và kiểm tra điều kiện sử dụng
     */
    VoucherResponse validateVoucher(String code);
}
