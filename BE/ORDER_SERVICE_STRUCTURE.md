# Order Service - Microservice Architecture

## 📦 Tổng Quan

Order Service quản lý việc tạo, cập nhật và theo dõi đơn hàng. Service này tích hợp với Product Service để cập nhật số lượng hàng, và tích hợp PayPal cho thanh toán.

## 📁 Cấu Trúc Thư Mục

```
order-service/
├── src/main/java/com/devteria/order/
│   ├── controller/
│   │   ├── OrderController.java          → REST endpoints cho Order (11 endpoints)
│   │   └── PaymentController.java        → REST endpoints cho Payment (6 endpoints)
│   ├── service/
│   │   ├── OrderService.java             → Interface cho Order business logic
│   │   ├── PaymentService.java           → Interface cho Payment business logic
│   │   └── impl/
│   │       ├── OrderServiceImpl.java      → Implementation với TODO markers
│   │       └── PaymentServiceImpl.java    → Implementation với TODO markers
│   ├── entity/
│   │   ├── Order.java                    → MongoDB document cho orders
│   │   ├── Payment.java                  → MongoDB document cho payments
│   │   ├── CartItem.java                 → Order item details
│   │   ├── OrderStatus.java              → Enum (DELIVERING, DELIVERED, CANCELLED)
│   │   └── PaymentStatus.java            → Enum (CREATED, APPROVED, FAILED, CANCELLED)
│   ├── dto/
│   │   ├── request/
│   │   │   ├── OrderCreationRequest.java → Request DTO for creating order
│   │   │   ├── PaymentRequest.java       → Request DTO for payment
│   │   │   └── ApiResponse.java          → Generic response wrapper (TODO: move to common-lib)
│   │   └── response/
│   │       ├── OrderResponse.java        → Response DTO for order
│   │       └── PaymentResponse.java      → Response DTO for payment
│   ├── repository/
│   │   ├── OrderRepository.java          → MongoRepository with 6 custom queries
│   │   └── PaymentRepository.java        → MongoRepository with 3 custom queries
│   ├── mapper/
│   │   ├── OrderMapper.java              → MapStruct mapper for Order conversion
│   │   └── PaymentMapper.java            → MapStruct mapper for Payment conversion
│   ├── exception/                        → (Empty - for exception handling classes)
│   ├── config/                           → (Empty - for configuration classes)
│   └── OrderServiceApplication.java      → Spring Boot entry point
```

## 🔌 REST API Endpoints

### Order Endpoints
```
POST   /api/orders                           → Tạo đơn hàng
GET    /api/orders/{customerId}              → Lấy danh sách đơn hàng theo customer
GET    /api/orders/{customerId}/status/{status} → Lấy đơn hàng theo trạng thái
GET    /api/orders/id/{orderId}              → Lấy thông tin chi tiết đơn hàng
PUT    /api/orders/{orderId}?status=...      → Cập nhật trạng thái đơn hàng
DELETE /api/orders/{orderId}                 → Xóa đơn hàng
```

### Payment Endpoints
```
POST   /api/payment/create_payment           → Tạo payment mới (IntegrationPayPal)
GET    /api/payment/return/{id}              → Xử lý return từ PayPal (execute payment)
GET    /api/payment/cancel/{id}              → Xử lý cancel từ PayPal
GET    /api/payment/{paymentId}              → Lấy thông tin payment
GET    /api/payment/order/{orderId}          → Lấy payment info theo order
```

## 📊 Entity Models

### Order
```json
{
  "id": "ObjectId",
  "customerId": "String",
  "shipAddress": "String",
  "orderDate": "String (yyyy-MM-dd HH:mm:ss)",
  "currency": "String",
  "items": [
    {
      "productId": "String",
      "productName": "String",
      "productPrice": "Double",
      "quantity": "Integer"
    }
  ],
  "totalPrice": "Double",
  "isPaid": "Boolean",
  "orderStatus": "Enum (DELIVERING, DELIVERED, CANCELLED)"
}
```

### Payment
```json
{
  "id": "ObjectId",
  "paymentId": "String (UUID)",
  "userId": "String",
  "paymentMethod": "String",
  "orderId": "String",
  "amount": "Double",
  "currency": "String (default: VND)",
  "description": "String",
  "status": "Enum (CREATED, APPROVED, FAILED, CANCELLED)"
}
```

## 🔗 External Service Integrations

### TODO: Product Service Integration
**Location**: `OrderServiceImpl.saveOrder()` - Line 36
```java
// TODO: Gọi Product Service để cập nhật stock cho từng product trong order
// productService.updateInStockProduct(item.getProductId(), item.getQuantity())
```
- Cập nhật số lượng hàng tồn kho sau khi tạo order
- Gọi Product Service API: `PUT /api/products/{productId}/stock?quantity={qty}`

### TODO: PayPal Integration
**Location**: `PaymentServiceImpl.createPayment()` - Line 44
```java
// TODO: Tích hợp PayPal API để tạo payment
// Double totalAmount = Double.parseDouble(request.getAmount()) / 26000;
// Payment payment = new Payment();
// payment.create(apiContext);
```
- Tạo payment qua PayPal SDK
- Chuyển đổi VND → USD (chia cho 26000)
- Return redirect URL tới PayPal sandbox

### TODO: PayPal Execute Payment
**Location**: `PaymentController.returnPayment()` - Line 73
**Location**: `PaymentServiceImpl.executePayment()` - Line 108
```java
// TODO: Xử lý return từ PayPal - cập nhật order status thành PAID
// PayPal sẽ redirect tới đây với token
// Gọi PayPal execute payment API
```
- Thực thi payment sau khi user approve trên PayPal
- Cập nhật payment status → APPROVED
- Cập nhật order isPaid → true

### TODO: Email Notification
**Location**: `OrderServiceImpl.saveOrder()` - Line 51
```java
// TODO: Gửi email xác nhận đơn hàng
// emailService.sendOrderConfirmation(customer.getEmail(), "Order Confirmation", emailBody);
```
- Gửi email xác nhận tới khách hàng
- Bao gồm order details và total price

### TODO: Cart Service Integration
**Location**: `OrderServiceImpl.saveOrder()` - Line 54
```java
// TODO: Xóa cart sau khi tạo order
// cartRepository.findByCustomerId(customerId).ifPresent(cart -> {
//     cart.getItems().clear();
//     cartRepository.save(cart);
// });
```
- Clear cart items sau khi order được tạo

## 🛠️ Key Features

### Order Management
- ✅ Tạo đơn hàng mới với list items
- ✅ Lấy danh sách đơn hàng theo customer
- ✅ Lọc đơn hàng theo trạng thái (DELIVERING, DELIVERED, CANCELLED)
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Xóa đơn hàng

### Payment Processing
- ✅ Tạo payment với PayPal
- ✅ Lấy thông tin payment
- ✅ Thực thi payment (confirm từ PayPal)
- ✅ Hủy payment
- ✅ Theo dõi payment status (CREATED, APPROVED, FAILED, CANCELLED)

### Repository Queries
**OrderRepository**:
- `findOrderByCustomerId()` - Lấy một order theo customer
- `findAllByCustomerId()` - Lấy tất cả orders của customer
- `findByCustomerId()` - Alias cho findAllByCustomerId
- `findByCustomerIdAndStatus()` - Custom query lấy orders với status cụ thể
- `findByOrderStatus()` - Pageable query lấy orders theo status

**PaymentRepository**:
- `findPaymentsByPaymentId()` - Lấy payment theo paymentId
- `findByOrderId()` - Custom query lấy payment theo orderId
- `findByUserId()` - Custom query lấy payment theo userId

## 📦 Dependencies

```xml
<!-- Spring Boot 3.3.5 -->
<!-- Spring Data MongoDB -->
<!-- Spring Security (JWT) -->
<!-- MapStruct 1.5.5 -->
<!-- Lombok -->
<!-- PayPal SDK (to be added) -->
```

## 🚀 Next Steps

1. **Tích hợp PayPal**:
   - Thêm PayPal SDK dependency vào pom.xml
   - Cấu hình PayPal credentials
   - Implement payment.create() và payment.execute()

2. **Implement Product Service Client**:
   - Tạo FeignClient hoặc RestTemplate để gọi Product Service
   - Cập nhật stock trong saveOrder()

3. **Email Service Integration**:
   - Tích hợp email service từ common-lib
   - Gửi order confirmation email

4. **Cart Service Integration**:
   - Gọi Cart Service để clear items sau khi order created

5. **Exception Handling**:
   - Tạo custom exceptions trong exception/ folder
   - Tạo GlobalExceptionHandler

6. **Security Configuration**:
   - Thêm JWT authentication filter
   - Bảo vệ endpoints chỉ cho authorized users

7. **Configuration**:
   - Tạo application.yml với MongoDB connection
   - Setup PayPal credentials
