package tam.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Controller
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentController {

    @NonFinal
    private final String failedStatus = PaymentStatus.FAILED.toString().toLowerCase();

    @NonFinal
    private final String approvedStatus = PaymentStatus.APPROVED.toString().toLowerCase();

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    @NonFinal
    @Value("${paypal.cancel-url}")
    private String cancelUrl;

    @NonFinal
    @Value("${paypal.return-url}")
    private String returnUrl;

    private final APIContext apiContext;
    private final PaymentRepository paymentRepository;

    @ResponseBody
    @PostMapping("/create_payment")
    public ApiResponse<?> createPayment(HttpServletRequest request, @RequestBody PaymentRequest paymentRequest)
            throws PayPalRESTException {
        double totalAmount = Double.parseDouble(paymentRequest.getAmount()) / 26000;
        String currency = "USD";
        String description = "Thanh toan hoa don";
        String paymentMethod = "PAYPAL";

        Payment payment = new Payment();
        String id = UUID.randomUUID().toString();
        Amount amount = new Amount();

        amount.setCurrency(currency);
        amount.setTotal(String.format(Locale.US, "%.2f", totalAmount));

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setDescription(description);

        List<Transaction> transactions = new ArrayList<Transaction>();
        transactions.add(transaction);

        Payer payer = new Payer();
        payer.setPaymentMethod(paymentMethod);

        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(cancelUrl + "/" + id);
        redirectUrls.setReturnUrl(returnUrl + "/" + id);

        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);
        payment.setRedirectUrls(redirectUrls);

        Payment createdPayment = payment.create(apiContext);
        com.pc.store.server.entities.Order order = new com.pc.store.server.entities.Order();
        Customer customer = customerRepository
                .findById(new ObjectId(paymentRequest.getUserId()))
                .orElse(null);

        if (customer != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String orderDate = LocalDateTime.now().format(formatter);

            order.setCustomer(customer);
            order.setShipAddress(paymentRequest.getShipAddress());
            order.setTotalPrice(totalAmount);
            order.setCurrency(currency);
            order.setPaid(false);
            order.setOrderDate(orderDate);
            order.setItems(paymentRequest.getItems());
            order.setOrderStatus(OrderStatus.DELIVERING);

            orderRepository.save(order);
        }

        for (Links links : createdPayment.getLinks()) {
            if (links.getRel().equals("approval_url")) {
                log.info(links.getHref());
                var payload = PaymentResponse.builder()
                        .status("Ok")
                        .message("Successfully")
                        .paymentId(id)
                        .URL(links.getHref())
                        .build();

                com.pc.store.server.entities.Payment paymentEntity = new com.pc.store.server.entities.Payment();
                paymentEntity.setPaymentId(id);
                paymentEntity.setCurrency(currency);
                paymentEntity.setDescription(description);
                paymentEntity.setAmount(totalAmount);
                paymentEntity.setStatus(PaymentStatus.CREATED.toString());
                paymentEntity.setUserId(paymentRequest.getUserId());
                paymentRepository.save(paymentEntity);
                return ApiResponse.builder().result(payload).build();
            }
        }

        throw new AppException(ErrorCode.INVALID_PAYMENT);
    }

    @GetMapping("/inspect/{paymentId}")
    public String inspectPaymentStatus(@PathVariable("paymentId") String pId, HttpServletRequest http)
            throws Exception {
        String paymentId = http.getParameter("paymentId");
        String payerId = http.getParameter("PayerID");

        if (payerId == null || paymentId == null) return PaymentStatus.FAILED.toString();

        Payment payment = new Payment();
        payment.setId(paymentId);

        PaymentExecution execution = new PaymentExecution();
        execution.setPayerId(payerId);

        Payment executedPayment = payment.execute(apiContext, execution);

        com.pc.store.server.entities.Payment paymentEntity = paymentRepository.findPaymentsByPaymentId(pId);

        if (executedPayment.getState().equals(approvedStatus)) paymentEntity.setStatus(approvedStatus);
        else paymentEntity.setStatus(failedStatus);

        paymentRepository.save(paymentEntity);
        List<com.pc.store.server.entities.Order> orders =
                orderRepository.findAllByCustomerId(new ObjectId(paymentEntity.getUserId()));
        if (!orders.isEmpty()) {
            com.pc.store.server.entities.Order order = orders.get(0);
            order.setPaid(true);
            order.setOrderStatus(OrderStatus.DELIVERING);
            orderRepository.save(order);
        }

        return executedPayment.getState().toLowerCase();
    }

    @GetMapping("/cancel/{paymentId}")
    public String discardPayment(@PathVariable("paymentId") String paymentId, HttpServletRequest http)
            throws PayPalRESTException {
        com.pc.store.server.entities.Payment paymentEntity = paymentRepository.findPaymentsByPaymentId(paymentId);

        paymentEntity.setStatus(failedStatus);
        paymentRepository.save(paymentEntity);

        com.pc.store.server.entities.Order order =
                orderRepository.findOrderByCustomerId(new ObjectId(paymentEntity.getUserId()));
        if (order != null) {
            order.setPaid(false);
            order.setOrderStatus(OrderStatus.CANCELLED);
        }

        return failedStatus.toLowerCase();
    }

    @GetMapping("/{paymentId}")
    @ResponseBody
    public String getPaymentStatus(@PathVariable("paymentId") String paymentId, HttpServletRequest http)
            throws PayPalRESTException {
        com.pc.store.server.entities.Payment paymentEntity = paymentRepository.findPaymentsByPaymentId(paymentId);
        if (paymentEntity == null) return "unknow";
        return paymentEntity.getStatus();
    }
}
