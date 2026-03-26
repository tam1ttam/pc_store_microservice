package tam.order.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tam.order.repository.CartRepository;
import tam.order.repository.OrderRepository;
import tam.order.service.CallAPI;
import tam.order.service.CartService;

@Slf4j
@RequiredArgsConstructor
@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private final CartRepository cartRepository;

    @Autowired
    private final OrderServiceImpl orderService;

    @Autowired
    private final OrderRepository orderRepository;

    @Autowired
    private final CallAPI callAPI;
}
