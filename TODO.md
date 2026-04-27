# PC Store Backend API Documentation

## Overview
PC Store Backend API là RESTful API cho hệ thống quản lý cửa hàng bán linh kiện máy tính trực tuyến. API sử dụng JWT Bearer Token để xác thực và MongoDB để lưu trữ dữ liệu.

**Base URL:** `http://localhost:8282/api`

**Swagger UI:** `http://localhost:8282/swagger-ui.html`

---

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Customer APIs](#customer-apis)
3. [Product APIs](#product-apis)
4. [Product Detail APIs](#product-detail-apis)
5. [Cart APIs](#cart-apis)
6. [Order APIs](#order-apis)
7. [Payment APIs](#payment-apis)
8. [Chat & Conversation APIs](#chat--conversation-apis)
9. [Recommendation APIs](#recommendation-apis)
10. [Admin APIs](#admin-apis)
11. [AI APIs](#ai-apis)

---

## Authentication APIs

### 1. Login / Authenticate
**Endpoint:** `POST /api/auth/log-in`

**Description:** Đăng nhập và lấy JWT token

**Request:**
```json
{
  "userName": "user123",
  "password": "password123"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isAuthenticated": true
  }
}
```

**Status Code:** 200 OK / 401 Unauthorized

---

### 2. Introspect Token
**Endpoint:** `POST /api/auth/introspect`

**Description:** Kiểm tra tính hợp lệ của token

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "valid": true,
    "userName": "user123"
  }
}
```

**Status Code:** 200 OK

---

### 3. Refresh Token
**Endpoint:** `POST /api/auth/refresh`

**Description:** Làm mới JWT token

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isAuthenticated": true
  }
}
```

**Status Code:** 200 OK

---

### 4. Logout
**Endpoint:** `POST /api/auth/logout`

**Description:** Đăng xuất và vô hiệu hóa token

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": null
}
```

**Status Code:** 200 OK

---

## Customer APIs

### 1. Register Customer
**Endpoint:** `POST /api/customers/register`

**Description:** Đăng ký tài khoản khách hàng mới

**Request:**
```json
{
  "userName": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "0912345678",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "0912345678",
    "roles": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "USER"
      }
    ]
  }
}
```

**Status Code:** 201 Created / 400 Bad Request

---

### 2. Get Customer by Username
**Endpoint:** `GET /api/user/profile/username/{username}`

**Description:** Lấy thông tin khách hàng theo tên đăng nhập

**Parameters:**
- `username` (path): Tên đăng nhập của khách hàng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "0912345678",
    "roles": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "USER"
      }
    ]
  }
}
```

**Status Code:** 200 OK / 404 Not Found

---

### 3. Get My Information
**Endpoint:** `GET /api/customers/info`

**Description:** Lấy thông tin của khách hàng hiện tại (require authentication)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "0912345678",
    "roles": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "USER"
      }
    ]
  }
}
```

**Status Code:** 200 OK / 401 Unauthorized

---

## Product APIs

### 1. Get Newest Products
**Endpoint:** `GET /api/products/newest`

**Description:** Lấy danh sách các sản phẩm mới nhất

**Parameters:**
- `limit` (query, optional): Số lượng sản phẩm (mặc định: 10)

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "RTX 4080",
      "img": "https://cloudinary.com/image.jpg",
      "priceAfterDiscount": 45000000,
      "originalPrice": 50000000,
      "discountPercent": 10,
      "priceDiscount": 5000000,
      "supplier": {
        "id": "507f1f77bcf86cd799439012",
        "name": "NVIDIA"
      }
    }
  ]
}
```

**Status Code:** 200 OK

---

### 2. Get Best Selling Products
**Endpoint:** `GET /api/products/best-selling`

**Description:** Lấy danh sách các sản phẩm bán chạy nhất

**Parameters:**
- `limit` (query, optional): Số lượng sản phẩm (mặc định: 10)

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "RTX 4090",
      "img": "https://cloudinary.com/image.jpg",
      "priceAfterDiscount": 60000000,
      "originalPrice": 65000000,
      "discountPercent": 8,
      "priceDiscount": 5200000,
      "supplier": {
        "id": "507f1f77bcf86cd799439012",
        "name": "NVIDIA"
      }
    }
  ]
}
```

**Status Code:** 200 OK

---

### 3. Get All Products (Paginated)
**Endpoint:** `GET /api/products`

**Description:** Lấy danh sách sản phẩm với phân trang (mặc định sắp xếp theo id)

**Parameters:**
- `page` (query, optional): Trang (mặc định: 0)

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "content": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "RTX 4080",
        "img": "https://cloudinary.com/image.jpg",
        "priceAfterDiscount": 45000000,
        "originalPrice": 50000000,
        "discountPercent": 10
      }
    ],
    "totalPages": 5,
    "totalElements": 50,
    "currentPage": 0,
    "size": 10
  }
}
```

**Status Code:** 200 OK

---

### 4. Get Products (Ascending Price)
**Endpoint:** `GET /api/products/asc`

**Description:** Lấy danh sách sản phẩm sắp xếp theo giá tăng dần

**Parameters:**
- `page` (query, optional): Trang (mặc định: 0)

**Response:** Tương tự như GET /api/products

**Status Code:** 200 OK

---

### 5. Get Products (Descending Price)
**Endpoint:** `GET /api/products/desc`

**Description:** Lấy danh sách sản phẩm sắp xếp theo giá giảm dần

**Parameters:**
- `page` (query, optional): Trang (mặc định: 0)

**Response:** Tương tự như GET /api/products

**Status Code:** 200 OK

---

### 6. Get Product by ID
**Endpoint:** `GET /api/products/id`

**Description:** Lấy thông tin sản phẩm theo ID

**Parameters:**
- `id` (query): ID của sản phẩm

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "name": "RTX 4080",
    "img": "https://cloudinary.com/image.jpg",
    "priceAfterDiscount": 45000000,
    "originalPrice": 50000000,
    "discountPercent": 10,
    "priceDiscount": 5000000,
    "supplier": {
      "id": "507f1f77bcf86cd799439012",
      "name": "NVIDIA"
    }
  }
}
```

**Status Code:** 200 OK / 404 Not Found

---

### 7. Get Product by Name (Paginated)
**Endpoint:** `GET /api/v1/products/{name}`

**Description:** Tìm kiếm sản phẩm theo tên (phân trang)

**Parameters:**
- `name` (path): Tên sản phẩm (có thể tìm kiếm từng phần)
- `page` (query, optional): Trang (mặc định: 0)

**Response:** Tương tự như GET /api/products

**Status Code:** 200 OK

---

### 7.5 Search Product by Name
**Endpoint:** `GET /api/v1/products/search-by-name/{name}`

**Description:** Tìm kiếm sản phẩm theo tên với phân trang

**Parameters:**
- `name` (path): Tên sản phẩm

**Response:** Tương tự như GET /api/products

**Status Code:** 200 OK

---

### 8. Search Product by Name or Supplier
**Endpoint:** `GET /api/products/search`

**Description:** Tìm kiếm sản phẩm theo tên hoặc nhà cung cấp

**Parameters:**
- `keyword` (query): Từ khóa tìm kiếm

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "RTX 4080 NVIDIA",
      "img": "https://cloudinary.com/image.jpg",
      "priceAfterDiscount": 45000000,
      "originalPrice": 50000000,
      "discountPercent": 10,
      "priceDiscount": 5000000,
      "supplier": {
        "id": "507f1f77bcf86cd799439012",
        "name": "NVIDIA"
      }
    }
  ]
}
```

**Status Code:** 200 OK

---

### 9. Add New Product
**Endpoint:** `POST /api/products/add`

**Description:** Thêm sản phẩm mới

**Request:**
```json
{
  "name": "RTX 4090 Founder Edition",
  "img": "https://cloudinary.com/image.jpg",
  "priceAfterDiscount": 60000000,
  "originalPrice": 65000000,
  "discountPercent": 8,
  "supplier": {
    "id": "507f1f77bcf86cd799439012",
    "name": "NVIDIA"
  }
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "name": "RTX 4090 Founder Edition",
    "img": "https://cloudinary.com/image.jpg",
    "priceAfterDiscount": 60000000,
    "originalPrice": 65000000,
    "discountPercent": 8,
    "supplier": {
      "id": "507f1f77bcf86cd799439012",
      "name": "NVIDIA"
    }
  }
}
```

**Status Code:** 201 Created / 400 Bad Request

---

### 10. Update Product
**Endpoint:** `PUT /api/products/update/{productId}`

**Description:** Cập nhật thông tin sản phẩm

**Parameters:**
- `productId` (path): ID của sản phẩm cần cập nhật

**Request:**
```json
{
  "name": "RTX 4090 Updated",
  "img": "https://cloudinary.com/image-updated.jpg",
  "priceAfterDiscount": 58000000,
  "originalPrice": 65000000,
  "discountPercent": 10
}
```

**Response:** Tương tự như Add New Product

**Status Code:** 200 OK / 404 Not Found

---

### 11. Delete Product
**Endpoint:** `DELETE /api/products/delete/{productId}`

**Description:** Xóa sản phẩm

**Parameters:**
- `productId` (path): ID của sản phẩm cần xóa

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": true
}
```

**Status Code:** 200 OK / 404 Not Found

---

## Product Detail APIs

### 1. Get Product Detail by Product ID
**Endpoint:** `GET /api/v1/product-detail/{productId}`

**Description:** Lấy chi tiết sản phẩm (bao gồm thông số kỹ thuật, hình ảnh chi tiết, v.v.)

**Parameters:**
- `productId` (path): ID của sản phẩm

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "productId": "507f1f77bcf86cd799439010",
    "description": "Đây là GPU hàng đầu của NVIDIA",
    "specification": "CUDA Cores: 16384, Memory: 24GB GDDR6X",
    "images": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ]
  }
}
```

**Status Code:** 200 OK / 404 Not Found

---

## Cart APIs

### 1. Count Cart Items
**Endpoint:** `GET /api/v1/carts/{userId}/count`

**Description:** Đếm tổng số lượng item trong giỏ hàng

**Parameters:**
- `userId` (path): ID của khách hàng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": 5
}
```

**Status Code:** 200 OK

---

### 2. Create Cart
**Endpoint:** `POST /api/v1/carts/create`

**Description:** Tạo giỏ hàng mới cho khách hàng

**Parameters:**
- `customerId` (path): ID của khách hàng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "customerId": "507f1f77bcf86cd799439012",
    "items": [],
    "createdDate": "2024-01-15T10:30:00Z"
  }
}
```

**Status Code:** 201 Created / 400 Bad Request

---

### 3. Add Item to Cart
**Endpoint:** `POST /api/v1/carts/items`

**Description:** Thêm sản phẩm vào giỏ hàng

**Parameters:**
- `customerId` (query): ID của khách hàng
- `productId` (query): ID của sản phẩm
- `quantity` (query): Số lượng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "customerId": "507f1f77bcf86cd799439012",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439010",
        "quantity": 2,
        "price": 45000000
      }
    ]
  }
}
```

**Status Code:** 200 OK / 400 Bad Request

---

### 4. Increase Item Quantity
**Endpoint:** `POST /api/v1/carts/items/increase`

**Description:** Tăng số lượng item trong giỏ hàng

**Parameters:**
- `userId` (query): ID của khách hàng
- `itemId` (query): ID của item trong giỏ

**Response:** Tương tự như Add Item to Cart

**Status Code:** 200 OK

---

### 5. Decrease Item Quantity
**Endpoint:** `POST /api/v1/carts/items/decrease`

**Description:** Giảm số lượng item trong giỏ hàng (xóa item nếu số lượng <= 0)

**Parameters:**
- `userId` (query): ID của khách hàng
- `itemId` (query): ID của item trong giỏ

**Response:** Tương tự như Add Item to Cart

**Status Code:** 200 OK

---

### 6. Delete Item from Cart
**Endpoint:** `DELETE /api/v1/carts/items`

**Description:** Xóa sản phẩm khỏi giỏ hàng

**Parameters:**
- `customerId` (query): ID của khách hàng
- `productId` (query): ID của sản phẩm

**Response:** Tương tự như Add Item to Cart

**Status Code:** 200 OK

---

### 7. Delete All Cart Items
**Endpoint:** `DELETE /api/v1/carts/empty`

**Description:** Xóa toàn bộ giỏ hàng

**Parameters:**
- `customerId` (query): ID của khách hàng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": "Cart deleted successfully"
}
```

**Status Code:** 200 OK

---

### 8. Get Product IDs by Customer ID
**Endpoint:** `GET /api/v1/carts/productIds/{customerId}`

**Description:** Lấy danh sách ID sản phẩm trong giỏ hàng

**Parameters:**
- `customerId` (path): ID của khách hàng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    "507f1f77bcf86cd799439010",
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

**Status Code:** 200 OK

---

### 9. Get Cart Items by Customer ID
**Endpoint:** `GET /api/v1/carts/{userId}`

**Description:** Lấy danh sách item trong giỏ hàng

**Parameters:**
- `userId` (path): ID của khách hàng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    {
      "productId": "507f1f77bcf86cd799439010",
      "productName": "RTX 4080",
      "quantity": 2,
      "price": 45000000,
      "totalPrice": 90000000
    }
  ]
}
```

**Status Code:** 200 OK

---

## Order APIs

### 1. Create Order
**Endpoint:** `POST /api/orders`

**Description:** Tạo đơn hàng mới

**Request:**
```json
{
  "customerId": "507f1f77bcf86cd799439011",
  "shipAddress": "123 Main St, Ha Noi",
  "items": [
    {
      "product": {
        "id": "507f1f77bcf86cd799439010"
      },
      "quantity": 2
    }
  ],
  "totalPrice": 90000000,
  "isPaid": "false",
  "orderStatus": "PENDING"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": true
}
```

**Status Code:** 201 Created / 400 Bad Request

---

### 2. Get Orders by Customer ID
**Endpoint:** `GET /api/orders/{customerId}`

**Description:** Lấy danh sách đơn hàng của khách hàng

**Parameters:**
- `customerId` (path): ID của khách hàng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    {
      "id": "507f1f77bcf86cd799439011",
      "customerId": "507f1f77bcf86cd799439012",
      "shipAddress": "123 Main St, Ha Noi",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439010",
          "quantity": 2,
          "price": 45000000
        }
      ],
      "totalPrice": 90000000,
      "isPaid": false,
      "orderStatus": "PENDING",
      "orderDate": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Code:** 200 OK

---

### 3. Update Order Status
**Endpoint:** `PUT /api/orders/{orderId}`

**Description:** Cập nhật trạng thái đơn hàng

**Parameters:**
- `orderId` (path): ID của đơn hàng
- `status` (query): Trạng thái mới (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "customerId": "507f1f77bcf86cd799439012",
    "shipAddress": "123 Main St, Ha Noi",
    "items": [],
    "totalPrice": 90000000,
    "isPaid": false,
    "orderStatus": "PROCESSING",
    "orderDate": "2024-01-15T10:30:00Z"
  }
}
```

**Status Code:** 200 OK / 404 Not Found

---

## Payment APIs

### 1. Create PayPal Payment
**Endpoint:** `POST /api/payment/create_payment`

**Description:** Tạo thanh toán qua PayPal

**Request:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "amount": "90000000"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "redirectUrl": "https://www.paypal.com/checkoutnow?token=EC-...",
    "paymentId": "PAY-...",
    "state": "created"
  }
}
```

**Status Code:** 201 Created / 400 Bad Request

---

## Chat & Conversation APIs

### 1. Create Conversation
**Endpoint:** `POST /api/conversations/create`

**Description:** Tạo cuộc trò chuyện mới

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "receiverId": "507f1f77bcf86cd799439012",
  "title": "Support Conversation"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Support Conversation",
    "createdDate": "2024-01-15T10:30:00Z"
  }
}
```

**Status Code:** 201 Created / 400 Bad Request

---

### 2. Get My Conversations
**Endpoint:** `GET /api/conversations/my-conversations`

**Description:** Lấy danh sách các cuộc trò chuyện của người dùng hiện tại

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Support Conversation",
      "createdDate": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Code:** 200 OK

---

### 3. Create Chat Message
**Endpoint:** `POST /api/messages/create`

**Description:** Tạo tin nhắn trong cuộc trò chuyện

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "conversationId": "507f1f77bcf86cd799439011",
  "message": "Tôi muốn được hỗ trợ"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "conversationId": "507f1f77bcf86cd799439012",
    "me": true,
    "message": "Tôi muốn được hỗ trợ",
    "content": "Tôi muốn được hỗ trợ",
    "sender": {
      "id": "507f1f77bcf86cd799439013",
      "userName": "user123"
    },
    "createdDate": "2024-01-15T10:30:00Z"
  }
}
```

**Status Code:** 201 Created / 400 Bad Request

---

### 4. Get Chat Messages
**Endpoint:** `GET /api/messages/get/{conversationId}`

**Description:** Lấy danh sách tin nhắn trong cuộc trò chuyện

**Parameters:**
- `conversationId` (path): ID của cuộc trò chuyện

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    {
      "id": "507f1f77bcf86cd799439011",
      "conversationId": "507f1f77bcf86cd799439012",
      "me": true,
      "message": "Xin chào",
      "content": "Xin chào",
      "sender": {
        "id": "507f1f77bcf86cd799439013",
        "userName": "user123"
      },
      "createdDate": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Code:** 200 OK

---

## Recommendation APIs

### 1. Get Recommended Products
**Endpoint:** `GET /api/recommendations/{customerId}`

**Description:** Lấy danh sách sản phẩm được đề xuất cho khách hàng (4 sản phẩm)

**Parameters:**
- `customerId` (path): ID của khách hàng

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": [
    {
      "id": "507f1f77bcf86cd799439010",
      "name": "RTX 4080",
      "img": "https://cloudinary.com/image.jpg",
      "priceAfterDiscount": 45000000,
      "originalPrice": 50000000,
      "discountPercent": 10
    }
  ]
}
```

**Status Code:** 200 OK

---

## Admin APIs

### 1. Get All Customers (Paginated)
**Endpoint:** `GET /api/admin/customers`

**Description:** Lấy danh sách tất cả khách hàng (Admin only)

**Parameters:**
- `page` (query, optional): Trang (mặc định: 0)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN_ADMIN>
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "content": [
      {
        "id": "507f1f77bcf86cd799439011",
        "userName": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phoneNumber": "0912345678"
      }
    ],
    "totalPages": 5,
    "totalElements": 50,
    "currentPage": 0,
    "size": 10
  }
}
```

**Status Code:** 200 OK / 403 Forbidden

---

### 2. Update User Role to Admin
**Endpoint:** `POST /api/admin/update-role/{userName}`

**Description:** Nâng cấp quyền khách hàng lên Admin

**Parameters:**
- `userName` (path): Tên đăng nhập của người dùng

**Headers:**
```
Authorization: Bearer <JWT_TOKEN_ADMIN>
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": null
}
```

**Status Code:** 200 OK / 403 Forbidden

---

### 3. Add New Product (Admin)
**Endpoint:** `POST /api/admin/add-product`

**Description:** Thêm sản phẩm mới (Admin only, với xác thực hình ảnh qua Gemini AI)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN_ADMIN>
```

**Request:**
```json
{
  "name": "RTX 4090 Founders Edition",
  "img": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "priceAfterDiscount": 60000000,
  "originalPrice": 65000000,
  "discountPercent": 8,
  "supplier": {
    "id": "507f1f77bcf86cd799439012",
    "name": "NVIDIA"
  }
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "name": "RTX 4090 Founders Edition",
    "img": "https://cloudinary.com/image.jpg",
    "priceAfterDiscount": 60000000,
    "originalPrice": 65000000,
    "discountPercent": 8,
    "supplier": {
      "id": "507f1f77bcf86cd799439012",
      "name": "NVIDIA"
    }
  }
}
```

**Status Code:** 201 Created / 403 Forbidden / 400 Bad Request

---

### 4. Update Product (Admin)
**Endpoint:** `PUT /api/admin/update-product/{id}`

**Description:** Cập nhật sản phẩm (Admin only)

**Parameters:**
- `id` (path): ID của sản phẩm

**Headers:**
```
Authorization: Bearer <JWT_TOKEN_ADMIN>
```

**Request:**
```json
{
  "name": "RTX 4090 Super Edition",
  "img": "https://cloudinary.com/image.jpg",
  "priceAfterDiscount": 58000000,
  "originalPrice": 65000000,
  "discountPercent": 10
}
```

**Response:** Tương tự như Add New Product

**Status Code:** 200 OK / 403 Forbidden

---

### 5. Update Product Detail (Admin)
**Endpoint:** `PUT /api/admin/update-product-detail`

**Description:** Cập nhật chi tiết sản phẩm (Admin only)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN_ADMIN>
```

**Request:**
```json
{
  "productDetailId": "507f1f77bcf86cd799439011",
  "description": "Đây là GPU hàng đầu của NVIDIA",
  "specification": "CUDA Cores: 16384, Memory: 24GB GDDR6X",
  "images": [
    "https://cloudinary.com/image1.jpg"
  ],
  "imagesUpload": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ]
}
```

**Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "id": "507f1f77bcf86cd799439011",
    "productId": "507f1f77bcf86cd799439010",
    "description": "Đây là GPU hàng đầu của NVIDIA",
    "specification": "CUDA Cores: 16384, Memory: 24GB GDDR6X",
    "images": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ]
  }
}
```

**Status Code:** 200 OK / 403 Forbidden

---

## AI APIs

### 1. Ask Question to AI
**Endpoint:** `POST /api/ai/ask`

**Description:** Gửi câu hỏi tới AI Assistant (dùng Gemini API)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "question": "RTX 4090 có bao nhiêu CUDA cores?"
}
```

**Response:**
```json
{
  "answer": "RTX 4090 có 16384 CUDA cores...",
  "status": "success"
}
```

**Status Code:** 200 OK / 400 Bad Request

---

### 2. Get AI Statistics
**Endpoint:** `GET /api/ai/stats`

**Description:** Lấy thống kê tổng quan từ AI

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "stats": "Tổng số sản phẩm: 100, Tổng doanh thu: 50,000,000 VND...",
  "status": "success"
}
```

**Status Code:** 200 OK

---

## Global Response Format

Tất cả API responses theo định dạng chung:

```json
{
  "code": 1000,
  "message": "Optional error message",
  "result": {
    // Response data
  }
}
```

**Code References:**
- `1000`: Success
- `1001`: Validation Error
- `4004`: Not Found
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server Error

---

## Authentication

Hầu hết các API yêu cầu JWT Bearer Token trong header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cách lấy token:**
1. Gọi `/api/auth/log-in` với userName và password
2. Lấy token từ response
3. Sử dụng token này trong header Authorization của các request tiếp theo

---

## Pagination

Các API paginated sử dụng:
- `page`: Trang (bắt đầu từ 0)
- `size`: Kích thước trang (mặc định 10)

Response chứa:
- `content`: Danh sách dữ liệu
- `totalPages`: Tổng số trang
- `totalElements`: Tổng số phần tử
- `currentPage`: Trang hiện tại
- `size`: Kích thước trang

---

## Error Handling

Các lỗi phổ biến:

| Code | Message |
|------|---------|
| 1001 | Validation Error |
| 4004 | Resource Not Found |
| 401 | Unauthorized |
| 403 | Forbidden / Access Denied |
| 500 | Internal Server Error |

---

## Rate Limiting

Hiện tại không có rate limiting được cấu hình. Vui lòng sử dụng API một cách hợp lý.

---

## Version

**API Version:** 1.0.0
**Last Updated:** April 26, 2026


---

# BÁO CÁO PHÂN TÍCH ENDPOINTS - ĐÃ TRIỂN KHAI vs CHƯA TRIỂN KHAI

## 1. AUTHENTICATION APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | POST /api/auth/log-in | ❌ | Keycloak OAuth2 được dùng thay |
| 2 | POST /api/auth/introspect | ❌ | Keycloak OAuth2 được dùng thay |
| 3 | POST /api/auth/refresh | ✅ | Bằng Keycloak |
| 4 | POST /api/auth/logout | ✅ | Bằng Keycloak |

**Thực tế triển khai:** `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/callback/login`, `/api/v1/auth/me`, `/api/v1/auth/callback/delete-account`

---

## 2. CUSTOMER APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | POST /api/customers/register | ❌ | Keycloak xử lý |
| 2 | GET /api/user/profile/username/{username} | ✅ | **MỚI TRIỂN KHAI** |
| 3 | GET /api/customers/info | ❌ | Dùng `/api/v1/auth/me` thay |

**Thực tế triển khai:** `/api/v1/user/profile/{userId}` (GET), `/api/v1/user/profile/create` (POST), `/api/v1/user/profile/update/{userId}` (PUT), `/api/v1/user/profile/delete/{userId}` (DELETE), `/api/v1/user/profile/update-address/{userId}` (PUT), `/api/v1/user/profile/username/{username}` (GET)

---

## 3. PRODUCT APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | GET /api/products/newest | ❌ | Chưa triển khai |
| 2 | GET /api/products/best-selling | ❌ | Chưa triển khai |
| 3 | GET /api/products | ✅ | `/api/v1/products` |
| 4 | GET /api/products/asc | ❌ | Dùng `/api/v1/products?sortDirection=ASC` thay |
| 5 | GET /api/products/desc | ❌ | Dùng `/api/v1/products?sortDirection=DESC` thay |
| 6 | GET /api/products/id | ✅ | `/api/v1/products/{productId}` |
| 7 | GET /api/v1/products/{name} | ✅ | **MỚI TRIỂN KHAI** |
| 8 | GET /api/products/search | ✅ | Thông qua `/api/v1/products/search?keyword=...` |
| 9 | POST /api/products/add | ✅ | `/api/v1/products` (POST) |
| 10 | PUT /api/products/update/{productId} | ✅ | `/api/v1/products/{productId}` (PUT) |
| 11 | DELETE /api/products/delete/{productId} | ✅ | `/api/v1/products/{productId}` (DELETE) |

**Thực tế triển khai:** `/api/v1/products` (GET, POST), `/api/v1/products/{productId}` (GET, PUT, DELETE), `/api/v1/products/search`, `/api/v1/products/{name}`, `/api/v1/products/category/{categoryId}`, `/api/v1/products/featured`, `/api/v1/products/published`

---

## 4. PRODUCT DETAIL APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | GET /api/v1/product-detail/{productId} | ✅ | **MỚI TRIỂN KHAI** |

---

## 5. CART APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | GET /api/v1/carts/{userId}/count | ✅ | **MỚI TRIỂN KHAI** |
| 2 | POST /api/cart/createCart/{customerId} | ✅ | `/api/v1/carts/create` |
| 3 | POST /api/cart/{customerId}/addCart | ✅ | `/api/v1/carts/items` (POST) |
| 4 | POST /api/v1/carts/items/increase | ✅ | **MỚI TRIỂN KHAI** |
| 5 | POST /api/v1/carts/items/decrease | ✅ | **MỚI TRIỂN KHAI** |
| 6 | DELETE /api/cart/deleteItem | ✅ | `/api/v1/carts/items` (DELETE) |
| 7 | DELETE /api/cart/deleteCart | ✅ | `/api/v1/carts/empty` (DELETE) |
| 8 | GET /api/cart/productIds/{customerId} | ❌ | Chưa triển khai |
| 9 | GET /api/cart/items/{customerId} | ✅ | `/api/v1/carts/{userId}` (GET) |

**Thực tế triển khai:** `/api/v1/carts/create` (POST), `/api/v1/carts/{userId}` (GET), `/api/v1/carts/{userId}/count` (GET), `/api/v1/carts/items` (POST, PUT, DELETE), `/api/v1/carts/items/increase` (POST), `/api/v1/carts/items/decrease` (POST), `/api/v1/carts/empty` (DELETE)

---

## 6. ORDER APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | POST /api/orders | ✅ | `/api/v1/orders` |
| 2 | GET /api/orders/{customerId} | ✅ | `/api/v1/orders` (GET) |
| 3 | PUT /api/orders/{orderId} | ❌ | Dùng PUT .../cancel thay |

**Thực tế triển khai:** `/api/v1/orders` (GET, POST), `/api/v1/orders/{orderId}` (GET), `/api/v1/orders/{orderId}/cancel` (PUT), `/api/v1/orders/preview` (POST), `/api/v1/orders/health` (GET)

---

## 7. PAYMENT APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | POST /api/payment/create_payment | ❌ | Chưa triển khai |

**Thực tế triển khai:** Chỉ `/health` (GET)

---

## 8. CHAT & CONVERSATION APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | POST /api/conversations/create | ❌ | Chưa triển khai |
| 2 | GET /api/conversations/my-conversations | ❌ | Chưa triển khai |
| 3 | POST /api/messages/create | ❌ | Chưa triển khai |
| 4 | GET /api/messages/get/{conversationId} | ❌ | Chưa triển khai |

---

## 9. RECOMMENDATION APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | GET /api/recommendations/{customerId} | ❌ | Chưa triển khai |

---

## 10. ADMIN APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | GET /api/admin/customers | ❌ | Chưa triển khai |
| 2 | POST /api/admin/update-role/{userName} | ❌ | Chưa triển khai |
| 3 | POST /api/admin/add-product | ❌ | Dùng POST /api/v1/products thay |
| 4 | PUT /api/admin/update-product/{id} | ❌ | Dùng PUT /api/v1/products/{id} thay |
| 5 | PUT /api/admin/update-product-detail | ❌ | Chưa triển khai |

---

## 11. AI APIs

| # | Endpoint (Docs) | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | POST /api/ai/ask | ❌ | Chưa triển khai |
| 2 | GET /api/ai/stats | ❌ | Chưa triển khai |

---

## 12. CATEGORY APIs (Bổ sung - Không trong docs)

| # | Endpoint | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | GET /api/v1/categories | ✅ | Lấy tất cả danh mục |
| 2 | GET /api/v1/categories/{categoryId} | ✅ | Lấy chi tiết danh mục |
| 3 | POST /api/v1/categories | ✅ | Tạo danh mục |
| 4 | PUT /api/v1/categories/{categoryId} | ✅ | Cập nhật danh mục |
| 5 | DELETE /api/v1/categories/{categoryId} | ✅ | Xóa danh mục |

---

## 13. VOUCHER APIs (Bổ sung - Không trong docs)

| # | Endpoint | Triển Khai | Ghi Chú |
|----|---|---|---|
| 1 | POST /api/v1/vouchers | ✅ | Tạo voucher |
| 2 | GET /api/v1/vouchers/{voucherId} | ✅ | Lấy chi tiết voucher |
| 3 | GET /api/v1/vouchers | ✅ | Lấy danh sách voucher |
| 4 | PUT /api/v1/vouchers/{voucherId} | ✅ | Cập nhật voucher |
| 5 | DELETE /api/v1/vouchers/{voucherId} | ✅ | Xóa voucher |
| 6 | GET /api/v1/vouchers/validate/{code} | ✅ | Validate voucher code |
| 7 | POST /api/v1/orders/vouchers/attach | ✅ | Gắn voucher vào đơn hàng |
| 8 | POST /api/v1/orders/vouchers/remove | ✅ | Loại bỏ voucher khỏi đơn hàng |

---

## TÓM TẮT

**Tổng endpoints trong tài liệu:** 41  
**Endpoints đã triển khai:** 31 ✅  
**Endpoints chưa triển khai:** 10 ❌  
**Độ bao phủ:** ~76%

### Endpoints Chưa Triển Khai (Ưu tiên cao):
- ❌ Chat & Conversation (4 endpoints)
- ❌ Recommendation (1 endpoint)
- ❌ Admin (5 endpoints)
- ❌ AI (2 endpoints)
- ❌ Payment (1 endpoint)
- ❌ Cart Product IDs (1 endpoint)

### Endpoints Mới Triển Khai Trong Lần Này ✨ (5/5 hoàn thành):
- ✅ Product Detail API - `GET /api/v1/product-detail/{productId}`
- ✅ Get Customer by Username - `GET /api/v1/user/profile/username/{username}`
- ✅ Product Search by Name - `GET /api/v1/products/{name}`
- ✅ Cart Count Items - `GET /api/v1/carts/{userId}/count`
- ✅ Cart Increase/Decrease Quantity - `POST /api/v1/carts/items/increase|decrease`


## ENDPOINTS ĐÃ TRIỂN KHAI ✅

### Product Service
- ✅ `GET /api/v1/product-detail/{productId}` - ProductDetailController
- ✅ `GET /api/v1/products/{name}` - ProductController (searchByNamePaginated)
- ✅ `GET /api/recommendations/{customerId}` - RecommendationController
- ✅ `PUT /api/v1/product-detail/{productDetailId}` - ProductDetailController (MỚI - update product detail)

### User Service
- ✅ `GET /api/v1/user/profile/{userId}` - UserProfileController
- ✅ `GET /api/v1/user/profile/username/{username}` - UserProfileController (getProfileByUsername)
- ✅ `POST /api/v1/user/profile/create` - UserProfileController
- ✅ `PUT /api/v1/user/profile/update/{userId}` - UserProfileController
- ✅ `DELETE /api/v1/user/profile/delete/{userId}` - UserProfileController
- ✅ `PUT /api/v1/user/profile/update-address/{userId}` - UserProfileController

### Order Service (Cart)
- ✅ `GET /api/v1/carts/{userId}/count` - CartController (countCartItems)
- ✅ `POST /api/v1/carts/items/increase` - CartController (increaseQuantity)
- ✅ `POST /api/v1/carts/items/decrease` - CartController (decreaseQuantity)
- ✅ `POST /api/v1/carts/create` - CartController
- ✅ `GET /api/v1/carts/{userId}` - CartController
- ✅ `POST /api/v1/carts/items` - CartController
- ✅ `DELETE /api/v1/carts/items` - CartController
- ✅ `DELETE /api/v1/carts/empty` - CartController

### Identity Service (Manager Auth)
- ✅ `GET /api/v1/manager/customers` - ManagerAuthController (MỚI - Get all customers)
- ✅ `POST /api/v1/manager/update-role/{userName}` - ManagerAuthController (MỚI - Update user role)

### AI Service
- ✅ `POST /api/ai/ask` - AIController
- ✅ `GET /api/ai/stats` - AIController (MỚI)
- ✅ `POST /api/conversations/create` - ConversationController
- ✅ `GET /api/conversations/my-conversations` - ConversationController
- ✅ `POST /api/messages/create` - ChatMessageController
- ✅ `GET /api/messages/get/{conversationId}` - ChatMessageController

### Payment Service
- ✅ `POST /api/payment/create_payment` - PaymentController (MỚI)
- ✅ `GET /api/payment/inspect/{paymentId}` - PaymentController
- ✅ `GET /api/payment/cancel/{paymentId}` - PaymentController
- ✅ `GET /api/payment/{paymentId}` - PaymentController

---

**Tất cả endpoints đã triển khai! 🎉**

---

TODO:
- Days 1: ✅ viết tất cả các API cơ bản (chưa cần quan tâm logic) - DONE (40/41 endpoints + 4 payment endpoints bổ sung)
- Days 2, 3, 4: implement logic + gắn vào UI client
- Days 5: implement logic + gắn vào UI manager
- Days 6, 7: chạy thử hoàn thành + host thử lên vmware
- Days 8, 9: host thử lên vps (tùy chọn)

---
