package com.tam.chat.repository.httpclient;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.tam.chat.dto.ApiResponse;
import com.tam.chat.dto.response.VoucherSummaryResponse;

@FeignClient(name = "voucher-client", url = "${app.services.order.url}", path = "/order-service")
public interface VoucherClient {

    @GetMapping("/vouchers")
    ApiResponse<List<VoucherSummaryResponse>> getAllActiveVouchers();
}
