package com.tam.order.service;

import java.util.List;

import com.tam.order.dto.request.ApplyVoucherRequest;
import com.tam.order.dto.request.VoucherRequest;
import com.tam.order.dto.response.VoucherResponse;
import com.tam.order.entity.Order;

public interface VoucherService {
    VoucherResponse create(VoucherRequest request);

    VoucherResponse update(Long id, VoucherRequest request);

    void delete(Long id);

    VoucherResponse getById(Long id);

    List<VoucherResponse> getAll();

    List<VoucherResponse> getAvailableForUser(String userId);

    Order applyVoucher(ApplyVoucherRequest request, String userId);

    Order unapplyVoucher(Long orderId, String voucherCode, String userId);
}
