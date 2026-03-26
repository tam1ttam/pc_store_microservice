package tam.shipping.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tam.shipping.security.JwtValidate;
import tam.shipping.service.OrderItemService;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/shippings")
public class OrderItemController {

    private final OrderItemService orderItemService;
    private final JwtValidate jwtValidate;
}
