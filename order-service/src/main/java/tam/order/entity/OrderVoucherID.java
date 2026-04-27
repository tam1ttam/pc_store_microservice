package tam.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Embeddable
public class OrderVoucherID implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Column(name = "order_id")
    String orderId;

    @Column(name = "voucher_id")
    String voucherId;
}