package tam.order.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tam.order.dto.res.VoucherResponse;
import tam.order.entity.Order;
import tam.order.entity.OrderVoucher;
import tam.order.entity.OrderVoucherID;
import tam.order.entity.Voucher;

import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderVoucherMapper {

    private final VoucherMapper voucherMapper;

    public OrderVoucher toEntity(Order order, Voucher voucher) {
        return OrderVoucher.builder()
                .id(OrderVoucherID.builder()
                        .orderId(order.getOrderId())
                        .voucherId(voucher.getVoucherId())
                        .build())
                .order(order)
                .voucher(voucher)
                .build();
    }

    public List<VoucherResponse> toVoucherResponses(Collection<OrderVoucher> orderVouchers) {
        if (orderVouchers == null) return List.of();
        return orderVouchers.stream()
                .map(ov -> voucherMapper.toResponse(ov.getVoucher()))
                .toList();
    }
}
