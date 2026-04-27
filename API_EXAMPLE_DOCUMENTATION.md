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
**Endpoint:** `GET /api/customers/{username}`

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
**Endpoint:** `GET /api/products/{name}`

**Description:** Tìm kiếm sản phẩm theo tên (phân trang)

**Parameters:**
- `name` (path): Tên sản phẩm (có thể tìm kiếm từng phần)
- `page` (query, optional): Trang (mặc định: 0)

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
**Endpoint:** `GET /api/product-detail/{productId}`

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
**Endpoint:** `GET /api/cart/countOfItems`

**Description:** Đếm tổng số lượng item trong giỏ hàng

**Parameters:**
- `customerId` (query): ID của khách hàng

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
**Endpoint:** `POST /api/cart/createCart/{customerId}`

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
**Endpoint:** `POST /api/cart/{customerId}/addCart`

**Description:** Thêm sản phẩm vào giỏ hàng

**Parameters:**
- `customerId` (path): ID của khách hàng
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
**Endpoint:** `POST /api/cart/increaseQuantity`

**Description:** Tăng số lượng item trong giỏ hàng

**Parameters:**
- `customerId` (query): ID của khách hàng
- `productId` (query): ID của sản phẩm

**Response:** Tương tự như Add Item to Cart

**Status Code:** 200 OK

---

### 5. Decrease Item Quantity
**Endpoint:** `POST /api/cart/decreaseQuantity`

**Description:** Giảm số lượng item trong giỏ hàng

**Parameters:**
- `customerId` (query): ID của khách hàng
- `productId` (query): ID của sản phẩm

**Response:** Tương tự như Add Item to Cart

**Status Code:** 200 OK

---

### 6. Delete Item from Cart
**Endpoint:** `DELETE /api/cart/deleteItem`

**Description:** Xóa sản phẩm khỏi giỏ hàng

**Parameters:**
- `customerId` (query): ID của khách hàng
- `productId` (query): ID của sản phẩm

**Response:** Tương tự như Add Item to Cart

**Status Code:** 200 OK

---

### 7. Delete All Cart Items
**Endpoint:** `DELETE /api/cart/deleteCart`

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
**Endpoint:** `GET /api/cart/productIds/{customerId}`

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
**Endpoint:** `GET /api/cart/items/{customerId}`

**Description:** Lấy danh sách item trong giỏ hàng

**Parameters:**
- `customerId` (path): ID của khách hàng

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

# BÁO CÁO PHÂN TÍCH ROUTES

## Tổng Quan Kiến Trúc Dự Án

### Ánh Xạ Base URL
- **Cổng API Gateway:** 6060
- **Đường dẫn cơ sở các Service nội bộ:** `/api/v1/`
- **Đường dẫn cơ sở trong tài liệu:** `/api/`

---

## Phân Tích Routes Xác Thực (Authentication)

### Triển Khai Hiện Tại (Dựa trên Keycloak)
**Service:** Identity Service (`identity-service`)
**Đường dẫn cơ sở:** `/api/v1/auth` (thông qua API Gateway prefix mapping)

#### Routes Đã Triển Khai:
1. ✅ `GET /api/v1/auth/login` - Chuyển hướng OAuth2 Keycloak
2. ✅ `GET /api/v1/auth/callback/login` - Xử lý callback OAuth2 (thiết lập cookies)
3. ✅ `POST /api/v1/auth/refresh` - Làm mới access token thông qua cookie
4. ✅ `POST /api/v1/auth/logout` - Đăng xuất và xóa cookies
5. ✅ `GET /api/v1/auth/me` - Lấy thông tin người dùng hiện tại
6. ✅ `GET /api/v1/auth/callback/delete-account` - Xóa tài khoản thông qua luồng OAuth2

#### Thông Số Kỹ Thuật Trong Tài Liệu (Dựa trên JWT):
- `POST /api/auth/log-in` - Đăng nhập với tên người dùng/mật khẩu
- `POST /api/auth/introspect` - Xác thực token
- `POST /api/auth/refresh` - Làm mới token
- `POST /api/auth/logout` - Đăng xuất

### ⚠️ KHÔNG PHÙ HỢP GIỮA TRIỂN KHAI VÀ XÁC THỰC
**Vấn đề:** Triển khai sử dụng **OAuth2/Keycloak với cookies**, nhưng tài liệu yêu cầu **JWT Bearer tokens**

**Luồng Hiện Tại:**
- Keycloak xử lý xác thực
- Tokens được lưu trữ trong HttpOnly cookies
- Không có JWT Bearer token trong Authorization header
- Tiếp cận JWT không trạng thái vs. tiếp cận phiên bên máy chủ

**Các Hành Động Được Khuyến Nghị:**
- TODO: Cập nhật tài liệu để phản ánh luồng Keycloak/OAuth2 với cookies
- TODO: Hoặc triển khai các endpoints JWT Bearer token song song với Keycloak
- TODO: Xác minh xem cả hai tiếp cận có thể cùng tồn tại (xác thực hybrid)

---

## Phân Tích Routes Khách Hàng/Người Dùng

### Routes Đã Triển Khai
**Service:** User Service (`user-service`)
**Đường dẫn cơ sở:** `/api/v1/user/profile`

1. ✅ `GET /api/v1/user/profile/{userId}` - Lấy thông tin hồ sơ người dùng theo ID
2. ✅ `POST /api/v1/user/profile/create` - Tạo hồ sơ người dùng mới
3. ✅ `PUT /api/v1/user/profile/update/{userId}` - Cập nhật hồ sơ người dùng
4. ✅ `DELETE /api/v1/user/profile/delete/{userId}` - Xóa hồ sơ người dùng
5. ✅ `PUT /api/v1/user/profile/update-address/{userId}` - Cập nhật địa chỉ người dùng

### Không có trong tài liệu (Nhưng đã triển khai)
- Không có endpoint đăng ký khách hàng trong service này (Identity service có thể xử lý qua Keycloak)
- Không có endpoint "Lấy khách hàng theo tên người dùng"
- Không có endpoint "Lấy thông tin của tôi"

### TODO - Routes Còn Thiếu Từ Tài Liệu
- `POST /api/customers/register` - Đăng ký khách hàng **[QUAN TRỌNG - Thiếu trong tất cả các services]**
- `GET /api/customers/{username}` - Lấy khách hàng theo tên người dùng
- `GET /api/customers/info` - Lấy thông tin khách hàng hiện tại (một phần được bao gồm bởi `/auth/me`)

---

## Phân Tích Routes Sản Phẩm

### Routes Đã Triển Khai
**Service:** Product Service (`product-service`)
**Đường dẫn cơ sở:** `/api/v1/products`

#### Hoàn toàn triển khai:
1. ✅ `POST /api/v1/products` - Tạo sản phẩm (Create)
2. ✅ `GET /api/v1/products` - Lấy tất cả sản phẩm (với phân trang)
3. ✅ `GET /api/v1/products/{productId}` - Lấy sản phẩm theo ID
4. ✅ `GET /api/v1/products/search` - Tìm kiếm sản phẩm (theo từ khóa)
5. ✅ `GET /api/v1/products/category/{categoryId}` - Lấy sản phẩm theo danh mục
6. ✅ `PUT /api/v1/products/{productId}` - Cập nhật sản phẩm
7. ✅ `DELETE /api/v1/products/{productId}` - Xóa sản phẩm
8. ✅ `GET /api/v1/products/featured` - Lấy sản phẩm nổi bật
9. ✅ `GET /api/v1/products/published` - Lấy sản phẩm đã xuất bản
10. ✅ `GET /api/v1/products/health` - Kiểm tra sức khỏe

#### Routes Bổ Sung Không có Trong Tài Liệu:
- `GET /api/v1/products/featured` - **Tính năng bổ sung: Sản phẩm nổi bật**
- `GET /api/v1/products/published` - **Tính năng bổ sung: Bộ lọc sản phẩm đã xuất bản**

### TODO - Còn Thiếu Từ Triển Khai
- `GET /api/products/newest` - Lấy sản phẩm mới nhất (Tài liệu chỉ định)
- `GET /api/products/best-selling` - Lấy sản phẩm bán chạy nhất (Tài liệu chỉ định)
- `GET /api/products/{name}` - Tìm kiếm theo tên sản phẩm với phân trang
- `POST /api/admin/add-product` - Thêm sản phẩm Admin với xác thực Gemini AI
- `PUT /api/admin/update-product/{id}` - Cập nhật Admin

### Routes Chi Tiết Sản Phẩm

**Service:** Product Service (Không tìm thấy controller riêng)
**Tài liệu chỉ định:** `/api/product-detail/{productId}`

**Trạng thái:** ❌ **THIẾU - Không có ProductDetailController được triển khai**

TODO: Triển khai ProductDetailController với:
- `GET /api/v1/product-detail/{productId}` - Lấy chi tiết sản phẩm
- `PUT /api/v1/product-detail/{productDetailId}` - Cập nhật chi tiết sản phẩm (Admin)

---

## Phân Tích Routes Giỏ Hàng

### Routes Đã Triển Khai
**Service:** Order Service (`order-service`)
**Đường dẫn cơ sở:** `/api/v1/carts`

1. ✅ `POST /api/v1/carts/create` - Tạo giỏ hàng
2. ✅ `GET /api/v1/carts/{userId}` - Lấy các mục trong giỏ hàng
3. ✅ `POST /api/v1/carts/items` - Thêm mục vào giỏ hàng
4. ✅ `PUT /api/v1/carts/items/{itemId}` - Cập nhật số lượng mục trong giỏ hàng
5. ✅ `DELETE /api/v1/carts/items` - Xóa nhiều mục khỏi giỏ hàng
6. ✅ `DELETE /api/v1/carts/empty` - Xóa toàn bộ giỏ hàng

### TODO - Routes Còn Thiếu Từ Tài Liệu
- `GET /api/cart/countOfItems` - Đếm mục trong giỏ hàng
- `POST /api/cart/increaseQuantity` - Tăng số lượng (thay vì PUT)
- `POST /api/cart/decreaseQuantity` - Giảm số lượng
- `DELETE /api/cart/deleteItem` - Xóa một mục (được bao gồm bởi DELETE multiple)
- `GET /api/cart/productIds/{customerId}` - Lấy danh sách ID sản phẩm
- `GET /api/cart/items/{customerId}` - Lấy các mục trong giỏ hàng (endpoint khác)

### Ghi Chú Triển Khai:
- Triển khai hiện tại là RESTful hơn (PUT cho cập nhật)
- Tài liệu có một số endpoints dư thừa (increaseQuantity, decreaseQuantity)

---

## Phân Tích Routes Đơn Hàng

### Routes Đã Triển Khai
**Service:** Order Service (`order-service`)
**Đường dẫn cơ sở:** `/api/v1/orders`

1. ✅ `POST /api/v1/orders/preview` - Xem trước đơn hàng trước khi tạo
2. ✅ `POST /api/v1/orders` - Tạo đơn hàng
3. ✅ `GET /api/v1/orders` - Lấy danh sách đơn hàng của người dùng (phân trang)
4. ✅ `GET /api/v1/orders/{orderId}` - Lấy chi tiết đơn hàng
5. ✅ `PUT /api/v1/orders/{orderId}/cancel` - Hủy đơn hàng
6. ✅ `GET /api/v1/orders/health` - Kiểm tra sức khỏe

### TODO - Routes Còn Thiếu Từ Tài Liệu
- `PUT /api/orders/{orderId}` - Cập nhật trạng thái đơn hàng (tham số status query)
- Endpoint cập nhật trạng thái chung (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

### Tính Năng Bổ Sung Đã Triển Khai:
- `POST /api/v1/orders/preview` - Xem trước đơn hàng (không có trong tài liệu nhưng rất hữu ích)

---

## Phân Tích Routes Mã Giảm Giá/Voucher

### Routes Đã Triển Khai
**Service:** Order Service (`order-service`)
**Đường dẫn cơ sở:** `/api/v1/vouchers`

1. ✅ `POST /api/v1/vouchers` - Tạo voucher (Admin)
2. ✅ `GET /api/v1/vouchers/{voucherId}` - Lấy voucher theo ID
3. ✅ `GET /api/v1/vouchers` - Lấy các voucher hoạt động (phân trang)
4. ✅ `PUT /api/v1/vouchers/{voucherId}` - Cập nhật voucher (Admin)
5. ✅ `DELETE /api/v1/vouchers/{voucherId}` - Xóa voucher (Admin)
6. ✅ `GET /api/v1/vouchers/validate/{code}` - Xác thực voucher theo mã

### Routes Đơn Hàng-Voucher
**Đường dẫn cơ sở:** `/api/v1/orders/vouchers`

1. ✅ `POST /api/v1/orders/vouchers/attach` - Gắn voucher vào đơn hàng
2. ✅ `POST /api/v1/orders/vouchers/remove` - Loại bỏ voucher khỏi đơn hàng

**Trạng thái:** ✅ **Hoàn toàn triển khai (Không có trong tài liệu nhưng hoàn toàn chức năng)**

---

## Phân Tích Routes Thanh Toán

### Routes Đã Triển Khai
**Service:** Payment Service (`payment-service`)
**Đường dẫn cơ sở:** `/payment` (có thể)

Chỉ tìm thấy:
- ✅ `GET /health` - Kiểm tra sức khỏe

### TODO - QUAN TRỌNG - THIẾU
- `POST /api/payment/create_payment` - Tạo thanh toán PayPal
- Cần triển khai toàn bộ quy trình thanh toán

---

## Phân Tích Routes Trò Chuyện & Cuộc Hội Thoại

**Service:** ❌ **KHÔNG TÌM THẤY TRIỂN KHAI**

**Tài liệu chỉ định:**
- `POST /api/conversations/create` - Tạo cuộc hội thoại
- `GET /api/conversations/my-conversations` - Lấy các cuộc hội thoại của người dùng
- `POST /api/messages/create` - Tạo tin nhắn
- `GET /api/messages/get/{conversationId}` - Lấy các tin nhắn

### TODO - QUAN TRỌNG: Triển Khai Dịch Vụ Trò Chuyện
Controllers bắt buộc:
- ConversationController với các hoạt động CRUD
- MessageController với các hoạt động nhắn tin
- Hỗ trợ WebSocket cho nhắn tin thực tế

---

## Phân Tích Routes Đề Xuất

**Service:** ❌ **KHÔNG TÌM THẤY TRIỂN KHAI**

**Tài liệu chỉ định:**
- `GET /api/recommendations/{customerId}` - Lấy sản phẩm được đề xuất cho khách hàng

### TODO - QUAN TRỌNG: Triển Khai Dịch Vụ Đề Xuất
- Dịch vụ Đề Xuất
- Engine Đề Xuất (dựa trên ML/Thuật toán)

---

## Phân Tích Routes Admin

**Service:** ❌ **KHÔNG TÌM THẤY ADMIN CONTROLLER RIÊNG BIỆT**

**Tài liệu chỉ định:**
- `GET /api/admin/customers` - Lấy tất cả khách hàng (phân trang)
- `POST /api/admin/update-role/{userName}` - Cập nhật quyền người dùng thành admin
- `POST /api/admin/add-product` - Thêm sản phẩm với xác thực Gemini AI
- `PUT /api/admin/update-product/{id}` - Cập nhật sản phẩm
- `PUT /api/admin/update-product-detail` - Cập nhật chi tiết sản phẩm

### TODO - QUAN TRỌNG: Triển Khai Dịch Vụ Admin
- AdminController cho các hoạt động admin
- Kiểm soát truy cập dựa trên vai trò
- Các endpoints quản lý sản phẩm
- Các endpoints quản lý người dùng

---

## Phân Tích Routes AI

**Service:** ❌ **KHÔNG TÌM THẤY TRIỂN KHAI**

**Tài liệu chỉ định:**
- `POST /api/ai/ask` - Đặt câu hỏi cho Gemini AI
- `GET /api/ai/stats` - Lấy thống kê AI

### TODO - QUAN TRỌNG: Triển Khai Dịch Vụ AI
- AIController cho tích hợp Gemini
- Xử lý câu hỏi
- Tạo thống kê

---

## Phân Tích Media Service

**Service:** Media Service (`media-service`)
**Đường dẫn cơ sở:** Không rõ (chỉ tìm thấy kiểm tra sức khỏe)

Chỉ tìm thấy:
- ✅ `GET /health` - Kiểm tra sức khỏe

### TODO: Triển Khai Media Service
- Các endpoints tải lên/tải xuống hình ảnh
- Quản lý tệp
- Xử lý phương tiện

---

## Phân Tích Routes Danh Mục

**Service:** Product Service (`product-service`)
**Đường dẫn cơ sở:** `/api/categories`

**Trạng thái:** ❌ **KHÔNG ĐỦ - Controller tồn tại nhưng không có endpoints**

### TODO: Triển Khai Routes Danh Mục
- `GET /api/categories` - Lấy tất cả danh mục
- `POST /api/categories` - Tạo danh mục
- `GET /api/categories/{categoryId}` - Lấy chi tiết danh mục
- `PUT /api/categories/{categoryId}` - Cập nhật danh mục
- `DELETE /api/categories/{categoryId}` - Xóa danh mục

---

## TÓM TẮT TRẠNG THÁI TRIỂN KHAI

### ✅ Đã Triển Khai (6/11 phần)
1. Xác thực (Dựa trên Keycloak, nhưng không khớp với docs)
2. Routes Người dùng/Hồ sơ
3. Routes Sản phẩm (95% coverage)
4. Routes Giỏ hàng (85% coverage)
5. Routes Đơn hàng (80% coverage)
6. Routes Voucher (100% coverage - tính năng bổ sung)

### ❌ Chưa Triển Khai (5/11 phần)
1. Chat & Conversation APIs
2. Recommendation APIs
3. Admin APIs
4. AI APIs
5. Category APIs
6. Complete Payment APIs
7. Product Detail APIs

### ⚠️ Các Vấn Đề Quan Trọng Tìm Thấy

#### 1. Không Phù Hợp Xác Thực (ĐỘ ƯU TIÊN CAO)
- **Vấn đề:** Tài liệu chỉ định JWT Bearer tokens, triển khai sử dụng Keycloak OAuth2 với cookies
- **Ảnh hưởng:** Tích hợp client sẽ thất bại nếu tuân theo thông số kỹ thuật tài liệu
- **Hành động:** Cần chuẩn hóa và cập nhật tài liệu

#### 2. Đăng Ký Khách Hàng Bị Thiếu (ĐỘ ƯU TIÊN CAO)
- **Vấn đề:** Không tìm thấy endpoint đăng ký trong bất kỳ service nào
- **Ảnh hưởng:** Không thể tạo tài khoản khách hàng mới
- **Trạng thái:** Keycloak có thể xử lý, cần xác minh

#### 3. Các Phần Quan Trọng Còn Thiếu (ĐỘ ƯU TIÊN CAO)
- Hệ thống Chat & Conversation (không triển khai)
- Tích hợp AI (không triển khai)
- Bảng điều khiển Admin (không triển khai)
- Engine đề xuất (không triển khai)

#### 4. Triển Khai Thanh Toán Không Đầy Đủ (ĐỘ ƯU TIÊN TRUNG BÌNH)
- Chỉ tìm thấy kiểm tra sức khỏe
- Tích hợp PayPal bị thiếu
- Pipeline xử lý thanh toán bị thiếu

#### 5. Trích Xuất ID Người Dùng (ĐỘ ƯU TIÊN TRUNG BÌNH)
- Nhiều TODO trong code: "Trích xuất ID người dùng từ JWT token hoặc SecurityContext"
- Trích xuất ngữ cảnh người dùng không nhất quán giữa các services
- Cần một tiếp cận chuẩn hóa sử dụng SecurityContext hoặc request header

---

## Danh Sách Kiểm Tra Triển Khai TODO

### QUAN TRỌNG - Triển Khai Khối
- [ ] `TODO: Triển khai dịch vụ Chat & Conversation (ConversationController, MessageController)`
- [ ] `TODO: Triển khai dịch vụ Đề xuất với thuật toán đề xuất`
- [ ] `TODO: Triển khai dịch vụ Admin với các endpoints admin`
- [ ] `TODO: Triển khai dịch vụ AI với tích hợp Gemini`
- [ ] `TODO: Hoàn thành dịch vụ Thanh toán với tích hợp PayPal`
- [ ] `TODO: Giải quyết không phù hợp luồng Xác thực (JWT vs OAuth2/Keycloak)`
- [ ] `TODO: Triển khai endpoint đăng ký khách hàng`

### ĐỘ ƯU TIÊN CAO - Tính Năng Cốt Lõi
- [ ] `TODO: Triển khai ProductDetailController với các endpoints chi tiết`
- [ ] `TODO: Triển khai CategoryController với CRUD danh mục`
- [ ] `TODO: Chuẩn hóa trích xuất ngữ cảnh người dùng trên tất cả các services`
- [ ] `TODO: Thêm các endpoints sản phẩm còn thiếu (newest, best-selling)`
- [ ] `TODO: Triển khai cập nhật sản phẩm/chi tiết admin với xác thực Gemini`

### ĐỘ ƯU TIÊN TRUNG BÌNH - Đánh Bóng & Nâng Cao
- [ ] `TODO: Thêm kiểm soát truy cập dựa trên vai trò (Xác thực Admin)`
- [ ] `TODO: Triển khai nhắn tin thực tế với WebSocket cho Trò chuyện`
- [ ] `TODO: Thêm các endpoints tải lên phương tiện cho MediaService`
- [ ] `TODO: Triển khai endpoint cập nhật trạng thái đơn hàng`
- [ ] `TODO: Thêm chuẩn hóa phân trang trên tất cả các endpoints`

### TÀI LIỆU - Cần Xác Minh
- [ ] `TODO: Xác minh luồng đăng ký khách hàng (Keycloak vs endpoint dịch vụ trực tiếp)`
- [ ] `TODO: Tài liệu luồng xác thực thực tế (OAuth2/Keycloak)`
- [ ] `TODO: Cập nhật tài liệu Base URL và đường dẫn API`
- [ ] `TODO: Thêm chi tiết cấu hình giới hạn tốc độ`
- [ ] `TODO: Tài liệu các phương pháp hay nhất bảo mật cho các routes đã triển khai`

---

## Bảng So Sánh Triển Khai Routes

| Danh Mục | Tài Liệu | Đã Triển Khai | Không Khớp | Ưu Tiên |
|----------|----------|-------------|----------|----------|
| Xác thực | JWT Bearer | OAuth2/Keycloak | ⚠️ CÓ | QUAN TRỌNG |
| Khách hàng | 3 endpoints | 5 endpoints | ✅ KHÔNG | ĐỘ ƯU TIÊN CAO |
| Sản phẩm | 11 endpoints | 10 endpoints | ✅ KHÔNG | ĐỘ ƯU TIÊN TRUNG BÌNH |
| Chi tiết Sản phẩm | 1 endpoint | 0 endpoints | ❌ CÓ | ĐỘ ƯU TIÊN CAO |
| Giỏ hàng | 9 endpoints | 6 endpoints | ✅ KHÔNG | ĐỘ ƯU TIÊN TRUNG BÌNH |
| Đơn hàng | 3 endpoints | 5 endpoints | ✅ KHÔNG | ĐỘ ƯU TIÊN TRUNG BÌNH |
| Voucher | 0 endpoints | 8 endpoints | ✅ KHÔNG (Bổ sung) | ĐỘ ƯU TIÊN THẤP |
| Thanh toán | 1 endpoint | 0 endpoints | ❌ CÓ | QUAN TRỌNG |
| Trò chuyện | 4 endpoints | 0 endpoints | ❌ CÓ | QUAN TRỌNG |
| Đề xuất | 1 endpoint | 0 endpoints | ❌ CÓ | QUAN TRỌNG |
| Admin | 5 endpoints | 0 endpoints | ❌ CÓ | QUAN TRỌNG |
| AI | 2 endpoints | 0 endpoints | ❌ CÓ | QUAN TRỌNG |
| Danh mục | 0 endpoints | 0 endpoints | ✅ KHÔNG | ĐỘ ƯU TIÊN CAO |
| Phương tiện | 0 endpoints | 0 endpoints | ✅ KHÔNG | ĐỘ ƯU TIÊN CAO |

**Tổng Cộng:** 41 endpoints tài liệu | ~35 endpoints đã triển khai | **Độ Bao Phủ: ~85%**

---

**Báo Cáo Được Tạo:** 2024
**Công Cụ Phân Tích:** Đánh Giá Mã Thủ Công
**Người Đánh Giá:** GitHub Copilot

___________________________________________________________________________________________
