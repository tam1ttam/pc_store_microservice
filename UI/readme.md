## API Endpoints (qua Gateway)

**Base URL**: `http://localhost:6060`  
**Gateway pattern**: `StripPrefix=1` — strip `/api-gateway`, forward `/{service-name}/...` đến service tương ứng.  
**Auth**: hầu hết endpoint yêu cầu header `Authorization: Bearer <token>` trừ khi ghi rõ *Public*.  
**Response envelope chung** (mọi service đều wrap):

```json
{
  "code": 1000,
  "message": "string (optional)",
  "result": { ... }
}
```

---

## IDENTITY-SERVICE
**Gateway prefix**: `/api-gateway/identity-service` → service port `6062`

---

### `POST /api-gateway/identity-service/users/registration`
Đăng ký tài khoản mới. *Public*

**Request body:**
```json
{
  "username": "string (min 4 ký tự)",
  "password": "string (min 6 ký tự)",
  "email": "user@example.com",
  "firstName": "string",
  "lastName": "string",
  "dob": "2000-01-15",
  "city": "string"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "string",
    "username": "string",
    "email": "string",
    "emailVerified": false,
    "roles": [
      { "name": "string", "description": "string", "permissions": [] }
    ]
  }
}
```

---

### `POST /api-gateway/identity-service/auth/token`
Đăng nhập — lấy JWT. *Public*

**Request body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "token": "eyJhbGci...",
    "authenticated": true,
    "expiryTime": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### `POST /api-gateway/identity-service/auth/introspect`
Kiểm tra token còn hiệu lực không. *Public*

**Request body:**
```json
{
  "token": "eyJhbGci..."
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "valid": true,
    "userId": "string"
  }
}
```

---

### `POST /api-gateway/identity-service/auth/refresh`
Làm mới token. *Public*

**Request body:**
```json
{
  "token": "eyJhbGci..."
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "token": "eyJhbGci...",
    "authenticated": true,
    "expiryTime": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### `POST /api-gateway/identity-service/auth/logout`
Đăng xuất — vô hiệu hóa token. *Public*

**Request body:**
```json
{
  "token": "eyJhbGci..."
}
```

**Response:**
```json
{
  "code": 1000
}
```

---

### `GET /api-gateway/identity-service/users/my-info`
Lấy thông tin user đang đăng nhập. *Auth required*

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "string",
    "username": "string",
    "email": "string",
    "emailVerified": false,
    "roles": [
      { "name": "USER", "description": "string", "permissions": [] }
    ]
  }
}
```

---

### `GET /api-gateway/identity-service/users`
Danh sách tất cả user. *ADMIN only*

**Response:**
```json
{
  "code": 1000,
  "result": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "emailVerified": false,
      "roles": []
    }
  ]
}
```

---

### `GET /api-gateway/identity-service/users/{userId}`
Lấy user theo ID. *ADMIN only*

**Path variable:** `userId` — string

**Response:** giống `GET /users/my-info`

---

### `PUT /api-gateway/identity-service/users/{userId}`
Cập nhật user. *ADMIN only*

**Path variable:** `userId` — string

**Request body:**
```json
{
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "dob": "2000-01-15",
  "roles": ["ADMIN", "USER"]
}
```

**Response:** giống `GET /users/my-info`

---

### `DELETE /api-gateway/identity-service/users/{userId}`
Xóa user. *ADMIN only*

**Path variable:** `userId` — string

**Response:**
```json
{
  "code": 1000,
  "result": "User deleted"
}
```

---

### `POST /api-gateway/identity-service/permissions`
Tạo permission. *ADMIN only*

**Request body:**
```json
{
  "name": "READ_DATA",
  "description": "string"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": { "name": "READ_DATA", "description": "string" }
}
```

---

### `GET /api-gateway/identity-service/permissions`
Danh sách permission. *ADMIN only*

**Response:**
```json
{
  "code": 1000,
  "result": [{ "name": "string", "description": "string" }]
}
```

---

### `DELETE /api-gateway/identity-service/permissions/{permission}`
Xóa permission. *ADMIN only*

**Path variable:** `permission` — tên permission

**Response:** `{ "code": 1000 }`

---

### `POST /api-gateway/identity-service/roles`
Tạo role. *ADMIN only*

**Request body:**
```json
{
  "name": "MANAGER",
  "description": "string",
  "permissions": ["READ_DATA", "WRITE_DATA"]
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "name": "MANAGER",
    "description": "string",
    "permissions": [{ "name": "READ_DATA", "description": "string" }]
  }
}
```

---

### `GET /api-gateway/identity-service/roles`
Danh sách role. *ADMIN only*

**Response:**
```json
{
  "code": 1000,
  "result": [{ "name": "string", "description": "string", "permissions": [] }]
}
```

---

### `DELETE /api-gateway/identity-service/roles/{role}`
Xóa role. *ADMIN only*

**Path variable:** `role` — tên role

**Response:** `{ "code": 1000 }`

---

### `POST /api-gateway/identity-service/api/admin/update-role/{userName}`
Gán role mặc định cho user. *ADMIN only*

**Path variable:** `userName` — string

**Response:** `{ "code": 1000 }`

---

## USER-SERVICE
**Gateway prefix**: `/api-gateway/user-service` → service port `6063`

---

### `POST /api-gateway/user-service/api/customers/register`
Đăng ký customer profile. Thường được gọi nội bộ sau khi identity-service tạo user. *Auth required*

**Request body:**
```json
{
  "userName": "string (3–50 ký tự)",
  "firstName": "string (1–50 ký tự)",
  "lastName": "string (1–50 ký tự)",
  "email": "user@example.com",
  "phoneNumber": "0912345678"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": "Đăng ký thành công",
  "result": {
    "id": "string",
    "userName": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string"
  }
}
```

---

### `GET /api-gateway/user-service/api/customers/info`
Lấy thông tin customer đang đăng nhập. *Auth required*

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "string",
    "userName": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phoneNumber": "string"
  }
}
```

---

### `GET /api-gateway/user-service/api/customers/{userName}`
Lấy customer theo username. *Auth required*

**Path variable:** `userName` — string

**Response:** giống `GET /api/customers/info`

---

### `GET /api-gateway/user-service/users/my-profile`
Lấy profile đầy đủ của user đang đăng nhập. *Auth required*

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "string",
    "userId": "string",
    "username": "string",
    "avatar": "https://...",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "dob": "2000-01-15",
    "city": "string"
  }
}
```

---

### `GET /api-gateway/user-service/users/{profileId}`
Lấy profile theo profileId. *Auth required*

**Path variable:** `profileId` — string

**Response:** giống `GET /users/my-profile`

---

### `GET /api-gateway/user-service/users`
Danh sách tất cả profile. *Auth required*

**Response:**
```json
{
  "code": 1000,
  "result": [{ "id": "...", "username": "...", "avatar": "...", "email": "...", "firstName": "...", "lastName": "...", "dob": "...", "city": "..." }]
}
```

---

### `PUT /api-gateway/user-service/users/my-profile`
Cập nhật profile. *Auth required*

**Request body:**
```json
{
  "email": "user@example.com",
  "firstName": "string",
  "lastName": "string",
  "dob": "2000-01-15",
  "city": "string"
}
```

**Response:** giống `GET /users/my-profile`

---

### `PUT /api-gateway/user-service/users/avatar`
Cập nhật avatar. *Auth required* — gửi `multipart/form-data`

**Request:** `Content-Type: multipart/form-data`  
Form field: `file` — file ảnh

**Response:** giống `GET /users/my-profile` với `avatar` là URL mới

---

### `POST /api-gateway/user-service/users/search`
Tìm kiếm user theo từ khóa. *Auth required*

**Request body:**
```json
{
  "keyword": "string"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": [{ "id": "...", "username": "...", "avatar": "...", "firstName": "...", "lastName": "..." }]
}
```

---

### `GET /api-gateway/user-service/api/admin/customers`
Danh sách customer có phân trang. *ADMIN only*

**Query params:** `page` (default 0), `size` (default 20), `sort`

**Response:**
```json
{
  "code": 1000,
  "result": {
    "content": [{ "id": "...", "userName": "...", "firstName": "...", "lastName": "...", "email": "...", "phoneNumber": "..." }],
    "totalElements": 100,
    "totalPages": 5,
    "number": 0,
    "size": 20
  }
}
```

---

### `GET /api-gateway/user-service/api/admin/customers/search`
Tìm kiếm customer có phân trang. *ADMIN only*

**Query params:** `searchKey` (string), `page`, `size`, `sort`

**Response:** giống `GET /api/admin/customers`

---

### `PUT /api-gateway/user-service/api/admin/customers/{userName}`
Cập nhật customer. *ADMIN only*

**Path variable:** `userName` — string

**Request body:**
```json
{
  "firstName": "string (1–50 ký tự)",
  "lastName": "string (1–50 ký tự)",
  "email": "user@example.com",
  "phoneNumber": "0912345678"
}
```

**Response:** giống `POST /api/customers/register`

---

### `DELETE /api-gateway/user-service/api/admin/customers/{userName}`
Xóa customer. *ADMIN only*

**Path variable:** `userName` — string

**Response:**
```json
{
  "code": 1000,
  "result": "string"
}
```

---

## PRODUCT-SERVICE
**Gateway prefix**: `/api-gateway/product-service` → service port `6067`

---

### `GET /api-gateway/product-service/products`
Danh sách sản phẩm phân trang (mặc định). *Public*

**Query params:** `page` (int, default 0)

**Response:**
```json
{
  "code": 1000,
  "result": {
    "content": [
      {
        "id": "string",
        "name": "string",
        "img": "https://...",
        "priceAfterDiscount": 15000000.0,
        "originalPrice": 18000000.0,
        "discountPercent": 16.67,
        "priceDiscount": 3000000.0,
        "inStock": 10,
        "supplier": { "name": "string" }
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "number": 0
  }
}
```

---

### `GET /api-gateway/product-service/products/newest`
Sản phẩm mới nhất. *Public*

**Query params:** `limit` (int, default 10)

**Response:**
```json
{
  "code": 1000,
  "result": [{ "id": "...", "name": "...", "img": "...", "priceAfterDiscount": 0.0, "originalPrice": 0.0, "discountPercent": 0.0, "inStock": 0 }]
}
```

---

### `GET /api-gateway/product-service/products/best-selling`
Sản phẩm bán chạy nhất. *Public*

**Query params:** `limit` (int, default 10)

**Response:** giống `GET /products/newest`

---

### `GET /api-gateway/product-service/products/asc`
Danh sách sản phẩm sắp xếp giá tăng dần. *Public*

**Query params:** `page` (int, default 0)

**Response:** giống `GET /products`

---

### `GET /api-gateway/product-service/products/desc`
Danh sách sản phẩm sắp xếp giá giảm dần. *Public*

**Query params:** `page` (int, default 0)

**Response:** giống `GET /products`

---

### `GET /api-gateway/product-service/products/id`
Lấy sản phẩm theo ID. *Public*

**Query params:** `id` (string — ObjectId)

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "string",
    "name": "string",
    "img": "https://...",
    "priceAfterDiscount": 15000000.0,
    "originalPrice": 18000000.0,
    "discountPercent": 16.67,
    "priceDiscount": 3000000.0,
    "inStock": 10,
    "supplier": { "name": "string" }
  }
}
```

---

### `GET /api-gateway/product-service/products/{name}`
Lấy sản phẩm theo tên (phân trang). *Public*

**Path variable:** `name` — tên sản phẩm  
**Query params:** `page` (int, default 0)

**Response:** giống `GET /products`

---

### `GET /api-gateway/product-service/products/search`
Tìm kiếm sản phẩm theo từ khóa. *Public*

**Query params:** `keyword` (string)

**Response:**
```json
{
  "code": 1000,
  "result": [{ "id": "...", "name": "...", "img": "...", "priceAfterDiscount": 0.0 }]
}
```

---

### `POST /api-gateway/product-service/products/add`
Thêm sản phẩm mới. *ADMIN only*

**Request body:**
```json
{
  "name": "string",
  "img": "https://...",
  "priceAfterDiscount": 15000000.0,
  "originalPrice": 18000000.0,
  "discountPercent": 16.67,
  "priceDiscount": 3000000.0,
  "inStock": 10,
  "supplier": { "name": "string" },
  "productDetailCreationRequest": {
    "processor": "Intel Core i7-13700H",
    "ram": "16GB DDR5",
    "storage": "512GB NVMe SSD",
    "graphicsCard": "NVIDIA RTX 4060",
    "powerSupply": "string",
    "motherboard": "string",
    "case_": "string",
    "coolingSystem": "string",
    "operatingSystem": "Windows 11",
    "images": ["https://..."]
  }
}
```

**Response:**
```json
{
  "code": 1000,
  "result": { "id": "...", "name": "...", "img": "...", "priceAfterDiscount": 0.0, "inStock": 0 }
}
```

---

### `PUT /api-gateway/product-service/products/update/{productId}`
Cập nhật sản phẩm. *ADMIN only*

**Path variable:** `productId` — string  
**Request body:** giống `POST /products/add`

**Response:** giống `POST /products/add`

---

### `DELETE /api-gateway/product-service/products/delete/{productId}`
Xóa sản phẩm. *ADMIN only*

**Path variable:** `productId` — string

**Response:**
```json
{
  "code": 1000,
  "result": true
}
```

---

### `GET /api-gateway/product-service/product-detail/{productId}`
Lấy thông số kỹ thuật chi tiết của sản phẩm. *Public*

**Path variable:** `productId` — string

**Response:**
```json
{
  "code": 1000,
  "result": {
    "productId": "string",
    "processor": "Intel Core i7-13700H",
    "ram": "16GB DDR5",
    "storage": "512GB NVMe SSD",
    "graphicsCard": "NVIDIA RTX 4060",
    "powerSupply": "string",
    "motherboard": "string",
    "case_": "string",
    "coolingSystem": "string",
    "operatingSystem": "Windows 11",
    "images": ["https://..."]
  }
}
```

---

## ORDER-SERVICE
**Gateway prefix**: `/api-gateway/order-service` → service port `6065`

---

### `POST /api-gateway/order-service/api/orders`
Tạo đơn hàng mới. *Auth required*

**Request body:**
```json
{
  "customerId": "string",
  "customerEmail": "user@example.com",
  "customerName": "string",
  "shipAddress": "123 Đường ABC, Quận 1",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": 1,
      "price": 15000000.0
    }
  ],
  "totalPrice": 15000000.0,
  "orderDate": "2025-01-01",
  "isPaid": "false",
  "orderStatus": "PENDING"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": true
}
```

---

### `GET /api-gateway/order-service/api/orders/{customerId}`
Lấy tất cả đơn hàng của customer. *Auth required*

**Path variable:** `customerId` — string (ObjectId)

**Response:**
```json
{
  "code": 1000,
  "result": [
    {
      "id": "string",
      "customerId": "string",
      "customerEmail": "string",
      "customerName": "string",
      "shipAddress": "string",
      "items": [{ "productId": "...", "productName": "...", "quantity": 1, "price": 0.0 }],
      "totalPrice": 0.0,
      "orderDate": "string",
      "isPaid": "string",
      "orderStatus": "PENDING"
    }
  ]
}
```

---

### `GET /api-gateway/order-service/api/orders/{customerId}/status/{status}`
Lấy đơn hàng theo customer và trạng thái. *Auth required*

**Path variables:** `customerId` — string, `status` — string (PENDING / CONFIRMED / SHIPPING / DELIVERED / CANCELLED)

**Response:** giống `GET /api/orders/{customerId}`

---

### `GET /api-gateway/order-service/api/orders/id/{orderId}`
Lấy chi tiết một đơn hàng. *Auth required*

**Path variable:** `orderId` — string (ObjectId)

**Response:**
```json
{
  "code": 1000,
  "result": { "id": "...", "customerId": "...", "items": [], "totalPrice": 0.0, "orderStatus": "..." }
}
```

---

### `PUT /api-gateway/order-service/api/orders/{orderId}`
Cập nhật trạng thái đơn hàng. *Auth required*

**Path variable:** `orderId` — string  
**Query param:** `status` — string (PENDING / CONFIRMED / SHIPPING / DELIVERED / CANCELLED)

**Response:** giống `GET /api/orders/id/{orderId}`

---

### `DELETE /api-gateway/order-service/api/orders/{orderId}`
Xóa đơn hàng. *Auth required*

**Path variable:** `orderId` — string

**Response:**
```json
{
  "code": 1000,
  "result": true
}
```

---

### `POST /api-gateway/order-service/api/payment/create_payment`
Khởi tạo thanh toán (PayPal). *Auth required*

**Request body:**
```json
{
  "userId": "string",
  "amount": "150.00",
  "paymentMethod": "PAYPAL",
  "description": "Thanh toán đơn hàng #abc123"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": "Payment created successfully",
  "result": {
    "id": "string",
    "paymentId": "PAY-...",
    "userId": "string",
    "paymentMethod": "PAYPAL",
    "orderId": "string",
    "amount": 150.00,
    "currency": "USD",
    "description": "string",
    "status": "PENDING"
  }
}
```

---

### `GET /api-gateway/order-service/api/payment/return/{id}`
Callback khi thanh toán thành công (PayPal redirect). *Public*

**Path variable:** `id` — payment record ID  
**Query params (tự động từ PayPal):** `paymentId`, `PayerID`

**Response:** `ApiResponse` với payment đã cập nhật status `SUCCESS`

---

### `GET /api-gateway/order-service/api/payment/cancel/{id}`
Callback khi người dùng hủy thanh toán. *Public*

**Path variable:** `id` — payment record ID

**Response:** `ApiResponse` với payment đã cập nhật status `CANCELLED`

---

### `GET /api-gateway/order-service/api/payment/{paymentId}`
Lấy thông tin payment theo ID. *Auth required*

**Path variable:** `paymentId` — string

**Response:** giống `POST /api/payment/create_payment` (phần result)

---

### `GET /api-gateway/order-service/api/payment/order/{orderId}`
Lấy payment theo orderId. *Auth required*

**Path variable:** `orderId` — string

**Response:** giống `GET /api/payment/{paymentId}`

---

## CHAT-SERVICE
**Gateway prefix**: `/api-gateway/chat-service` → service port `8085`

---

### `POST /api-gateway/chat-service/conversations/create`
Tạo cuộc hội thoại mới. *Auth required*

**Request body:**
```json
{
  "type": "DIRECT",
  "participantIds": ["userId1", "userId2"]
}
```
> `type`: `"DIRECT"` (2 người) hoặc `"GROUP"` (nhiều người)

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "string",
    "type": "DIRECT",
    "participantsHash": "string",
    "conversationAvatar": "https://...",
    "conversationName": "string",
    "participants": [
      { "userId": "string", "username": "string", "avatar": "string" }
    ],
    "createdDate": "2025-01-01T00:00:00Z",
    "modifiedDate": "2025-01-01T00:00:00Z"
  }
}
```

---

### `GET /api-gateway/chat-service/conversations/my-conversations`
Danh sách cuộc hội thoại của user hiện tại. *Auth required*

**Response:**
```json
{
  "code": 1000,
  "result": [
    {
      "id": "string",
      "type": "DIRECT",
      "conversationName": "string",
      "conversationAvatar": "https://...",
      "participants": [],
      "createdDate": "2025-01-01T00:00:00Z",
      "modifiedDate": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### `POST /api-gateway/chat-service/messages/create`
Gửi tin nhắn vào cuộc hội thoại. *Auth required*

**Request body:**
```json
{
  "conversationId": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "id": "string",
    "conversationId": "string",
    "me": true,
    "message": "string",
    "sender": { "userId": "string", "username": "string", "avatar": "string" },
    "createdDate": "2025-01-01T00:00:00Z"
  }
}
```

---

### `GET /api-gateway/chat-service/messages`
Lấy tin nhắn của một cuộc hội thoại. *Auth required*

**Query param:** `conversationId` (string)

**Response:**
```json
{
  "code": 1000,
  "result": [
    {
      "id": "string",
      "conversationId": "string",
      "me": false,
      "message": "string",
      "sender": { "userId": "string", "username": "string", "avatar": "string" },
      "createdDate": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## FILE-SERVICE
**Gateway prefix**: `/api-gateway/file-service` → service port `8084`

---

### `POST /api-gateway/file-service/media/upload`
Upload file lên Cloudinary. *Auth required* — gửi `multipart/form-data`

**Request:** `Content-Type: multipart/form-data`  
Form field: `file` — file cần upload

**Response:**
```json
{
  "code": 1000,
  "result": {
    "originalFileName": "image.png",
    "url": "https://res.cloudinary.com/..."
  }
}
```

---

### `GET /api-gateway/file-service/media/download/{fileName}`
Download file. *Auth required*

**Path variable:** `fileName` — tên file

**Response:** binary stream với header `Content-Type` phù hợp (image/png, application/pdf, v.v.)

---

## NOTIFICATION-SERVICE
**Gateway prefix**: `/api-gateway/notification-service` → service port `6068`

---

### `POST /api-gateway/notification-service/email/send`
Gửi email trực tiếp qua Brevo API. *Auth required*

**Request body:**
```json
{
  "to": {
    "name": "Nguyễn Văn A",
    "email": "user@example.com"
  },
  "subject": "Tiêu đề email",
  "htmlContent": "<h1>Nội dung HTML</h1>"
}
```

**Response:**
```json
{
  "code": 1000,
  "result": {
    "messageId": "string"
  }
}
```

> **Lưu ý**: notification-service còn nhận sự kiện qua Kafka (topic `notification-delivery`) để gửi email tự động — không phải REST endpoint.

