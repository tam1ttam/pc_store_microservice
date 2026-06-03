# iluttmab — Backend Microservices

Hệ thống e-commerce PC Store, kiến trúc microservices Spring Boot 3.3.5 + Java 21.

---

## Mục lục

1. [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
2. [Danh sách services & ports](#danh-sách-services--ports)
3. [Luồng hoạt động](#luồng-hoạt-động)
4. [TODO](#todo)
5. [Cách chạy](#cách-chạy)

---

## Kiến trúc tổng quan

```
                        ┌────────────┐
          Client ──────▶│ API Gateway│:6060
                        └─────┬──────┘
                              │ lb:// (Eureka)
                        ┌─────▼──────┐
                        │   Eureka   │:6059
                        └─────┬──────┘
          ┌───────────────────┼───────────────────────┐
          │                   │                       │
    ┌─────▼──────┐     ┌──────▼─────┐        ┌───────▼──────┐
    │  identity  │:6062 │   user    │:6063    │   product    │:6067
    │  service   │      │  service  │gRPC:6163│   service    │gRPC:6167
    └─────┬──────┘      └─────┬─────┘         └──────┬───────┘
          │ MySQL:6001        │ MongoDB:6000          │ MongoDB:6000
          │                   │                       │ Elasticsearch:9200
    ┌─────▼──────┐     ┌──────▼─────┐        ┌───────▼──────┐
    │   order    │:6065 │notification│:6068    │    saga      │:6058
    │  service   │gRPC:6165│service │         │ orchestrator │gRPC:6158
    └────────────┘      └────────────┘         └──────────────┘
         │ MongoDB:6000   │ MongoDB:6000
         │
         ├──[Kafka: order.created]──────────▶ product-service (cập nhật tồn kho)
         └──[Kafka: order.created]──────────▶ notification-service (gửi email)

identity-service ──[Kafka: user.deleted]──▶ user-service (xóa profile)

Infrastructure: Redis:6002 · Kafka:9094 · Zipkin:9411 · Loki:3100 · Grafana:3000
```

### Công nghệ sử dụng

| Lớp | Stack |
|-----|-------|
| Framework | Spring Boot 3.3.5, Spring Cloud 2023.0.3 |
| Service mesh | Eureka (discovery), Spring Cloud Gateway |
| Giao tiếp sync | gRPC (net.devh grpc-spring-boot-starter 3.1.0) |
| Giao tiếp async | Apache Kafka |
| Database SQL | MySQL 8.0 (identity-service) |
| Database NoSQL | MongoDB 7.0 (user/product/order/notification) |
| Cache | Redis 7.2 |
| Tìm kiếm | Elasticsearch (product-service) |
| Tracing | Zipkin |
| Logging | Loki + Promtail + Grafana |
| Protobuf | proto-common (9 proto files, package `com.tam.proto.*`) |
| Security | Spring Security OAuth2 Resource Server, custom JWT |
| Build | Maven, MapStruct, Lombok |

---

## Danh sách services & ports

### Application services

| Service | HTTP | gRPC | Context path | Database |
|---------|------|------|--------------|----------|
| discovery-service | 6059 | — | / | — |
| api-gateway | 6060 | — | / | Redis |
| identity-service | 6062 | — | /identity-service | MySQL |
| user-service | 6063 | 6163 | /profile | MongoDB |
| order-service | 6065 | 6165 | /order-service | MongoDB |
| product-service | 6067 | 6167 | /product-service | MongoDB + ES |
| notification-service | 6068 | — | /notification | MongoDB |
| saga-orchestrator | 6058 | 6158 | /saga-orchestrator-service | — |

### Infrastructure (Docker)

| Container | Port host | Mục đích |
|-----------|-----------|----------|
| mongodb | 6000 | DB cho user/product/order/notification |
| mysql | 6001 | DB cho identity-service |
| redis | 6002 | Cache + Rate limiting (gateway) |
| kafka | 9094 | Event bus |
| zipkin | 9411 | Distributed tracing |
| loki | 3100 | Log aggregation |
| grafana | 3000 | Dashboard |

---

## Luồng hoạt động

### 1. Đăng ký tài khoản
```
Client → POST /api-gateway/identity-service/users
  → identity-service tạo user (MySQL)
  → Feign gọi user-service tạo customer profile (MongoDB)
  → Kafka [notification-delivery] → notification-service gửi email welcome
```

### 2. Đặt hàng
```
Client → POST /api-gateway/order-service/api/orders
  → order-service lưu đơn hàng (MongoDB)
  → Kafka [order.created]:
      ├─▶ product-service giảm tồn kho
      └─▶ notification-service gửi email xác nhận
```

### 3. Xóa tài khoản
```
Admin → DELETE /api-gateway/identity-service/users/{id}
  → identity-service xóa user (MySQL)
  → Kafka [user.deleted] → user-service xóa customer profile (MongoDB)
```

### 4. Giao tiếp gRPC
- **saga-orchestrator** → user-service: tạo/xóa/lấy customer qua gRPC
- **user/product/order service**: expose gRPC server để orchestrator và các service khác gọi trực tiếp

---

## TODO

### Infrastructure

- [ ] **Kafka + Zookeeper**: thêm vào `docker-compose.yml` (hiện chưa có container Kafka)
- [ ] **api-gateway**: thêm vào `docker-compose.yml` với biến môi trường đầy đủ
- [ ] **discovery-service**: thêm vào `docker-compose.yml`
- [ ] **api-gateway** `application.yaml`: đổi `REDIS_PORT` default từ `6379` → `6002` cho đồng bộ với Docker

### identity-service

- [ ] **Schema MySQL**: kiểm tra các column type sau khi migrate từ PostgreSQL (enum, timestamp, boolean có thể khác)
- [ ] **Test files**: `UserServiceTest.java` dùng field `firstName` không còn tồn tại trong `UserResponse` — cần sửa hoặc xóa test cũ
- [ ] **Redis cache**: chưa tích hợp cache token vào common-lib cho identity-service

### user-service

- [ ] **MongoDB auth**: `USER_MONGO_URI` hiện không có username/password — thêm auth khi deploy production (`mongodb://user:pass@host:6000/db`)
- [ ] **CustomerService**: xác nhận các method `existsCustomerByUserName`, `deleteCustomer` đã được implement trong `CustomerServiceImpl`
- [ ] **Kafka type mapping**: kiểm tra consumer nhận đúng `UserDeletedEvent` khi identity-service publish

### product-service

- [ ] **gRPC UNIMPLEMENTED**: `createProduct`, `updateProduct`, `getProductDetail` trả về `UNIMPLEMENTED` — cần implement hoặc giữ nguyên nếu chỉ dùng REST
- [ ] **Elasticsearch**: entity `Product` chưa được đánh index vào ES — cần thêm `@Document` hoặc sync event
- [ ] **OrderEventConsumer**: xác nhận `updateInStockProduct` trong `ProductService` đã có và trừ đúng số lượng

### order-service

- [ ] **Saga integration**: hiện `saveOrder` publish Kafka độc lập — nếu dùng Saga pattern cần điều phối qua saga-orchestrator thay vì publish trực tiếp
- [ ] **Rollback**: chưa có cơ chế hoàn tồn kho khi đơn hàng bị hủy sau khi đã trừ stock

### notification-service

- [ ] **Brevo API**: implement gọi Brevo API thật trong `EmailService` (hiện `BREVO_API_KEY` đã được parameterize nhưng chưa rõ logic gửi)
- [ ] **Dọn gRPC deps**: `grpc-netty-shaded`, `grpc-protobuf`, `grpc-stub` trong pom.xml không cần thiết — notification-service không gọi gRPC
- [ ] **Kafka type mapping**: thêm `spring.json.type.mapping` cho `NotificationEvent` nếu producer (identity/order) dùng class khác package

### saga-orchestrator-service

- [ ] **SignupSagaOrchestrator**: class này có logic stub — cần implement đầy đủ các bước saga (createUser → createProfile → rollback nếu lỗi)
- [ ] **gRPC clients**: chỉ có `GrpcUserServiceClient` — cần thêm client cho product-service và order-service nếu muốn orchestrate đặt hàng
- [ ] **Security**: hiện bỏ Keycloak — nếu saga expose REST endpoint cần tích hợp JWT giống các service khác

### Services chưa implement

- [ ] **cart-service**: proto đã định nghĩa 7 RPC — chưa có service nào implement
- [ ] **payment-service**: proto đã định nghĩa 6 RPC — chưa có service nào implement  
- [ ] **file-service**: proto đã định nghĩa, `user-service-example-grpc` là stub — chưa có service thật
- [ ] **chat-service**: thư mục rỗng — chưa có gì

### Bảo mật

- [ ] **JWT_SIGNER_KEY**: application.yaml đang có fallback default là key thật — production **bắt buộc** set biến env, không để default
- [ ] **MongoDB root credentials**: hiện dùng `root/123456` trong `.env` — thay trước khi deploy
- [ ] **CORS**: `api-gateway` và các service cần review `ALLOWED_ORIGINS` cho production domain

---

## Cách chạy

### Yêu cầu

- Java 21+
- Maven 3.9+
- Docker Desktop

### Bước 1 — Chuẩn bị biến môi trường

```bash
cp .env.example .env
# Chỉnh sửa .env nếu cần (BREVO_API_KEY, mật khẩu, v.v.)
```

### Bước 2 — Khởi động infrastructure

```bash
docker-compose up -d
```

Chờ các container healthy (~30s):

```bash
docker-compose ps
```

Kiểm tra nhanh:

```
MongoDB  : localhost:6000
MySQL    : localhost:6001
Redis    : localhost:6002
Zipkin   : http://localhost:9411
Grafana  : http://localhost:3000  (admin/admin)
```

### Bước 3 — Build toàn bộ project

```bash
# Build theo thứ tự dependency
mvn -f proto-common/pom.xml clean install -DskipTests
mvn -f common-lib/pom.xml clean install -DskipTests
```

Sau đó build các services (có thể song song):

```bash
mvn -f identity-service/pom.xml    clean install -Dmaven.test.skip=true
mvn -f user-service/pom.xml        clean install -Dmaven.test.skip=true
mvn -f product-service/pom.xml     clean install -Dmaven.test.skip=true
mvn -f order-service/pom.xml       clean install -Dmaven.test.skip=true
mvn -f notification-service/pom.xml clean install -Dmaven.test.skip=true
mvn -f saga-orchestrator-service/pom.xml clean install -Dmaven.test.skip=true
```

### Bước 4 — Load biến môi trường và chạy

**Linux/macOS (bash/zsh):**

```bash
export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
```

**Windows (PowerShell):**

```powershell
Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -ne '' } | ForEach-Object {
    $key, $value = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
}
```

**IntelliJ IDEA:**

Cài plugin [EnvFile](https://plugins.jetbrains.com/plugin/7861-envfile), sau đó trong Run Configuration → chọn `.env`.

### Bước 5 — Khởi động services theo thứ tự

```bash
# 1. Discovery (bắt buộc trước tiên)
java -jar discovery-service/target/discovery-service-*.jar

# 2. Các services (có thể chạy song song)
java -jar identity-service/target/identity-service-*.jar
java -jar user-service/target/user-service-*.jar
java -jar product-service/target/product-service-*.jar
java -jar order-service/target/order-service-*.jar
java -jar notification-service/target/notification-service-*.jar
java -jar saga-orchestrator-service/target/saga-orchestrator-service-*.jar

# 3. Gateway (sau khi các service đã register Eureka)
java -jar api-gateway/target/api-gateway-*.jar
```

### Kiểm tra hệ thống

| URL | Mô tả |
|-----|-------|
| http://localhost:6059 | Eureka dashboard — xem service nào đã register |
| http://localhost:6060/actuator/health | API Gateway health |
| http://localhost:9411 | Zipkin — trace request |
| http://localhost:3000 | Grafana — log aggregation |

### API thông qua Gateway

Tất cả request đi qua `http://localhost:6060/api-gateway/{service-context-path}/...`

```
POST http://localhost:6060/api-gateway/identity-service/users          # Đăng ký
POST http://localhost:6060/api-gateway/identity-service/auth/token     # Đăng nhập
GET  http://localhost:6060/api-gateway/profile/api/customers           # Lấy profile
POST http://localhost:6060/api-gateway/order-service/api/orders        # Đặt hàng
GET  http://localhost:6060/api-gateway/product-service/api/products    # Danh sách sản phẩm
```

---

## Cấu trúc thư mục

```
BE/
├── proto-common/              # Protobuf definitions + generated gRPC stubs
│   └── src/main/.../proto/    # 9 proto files (com.tam.proto.*)
├── common-lib/                # Shared: security config, JWT, Redis, exception handler
├── discovery-service/         # Eureka server
├── api-gateway/               # Spring Cloud Gateway + rate limiting + circuit breaker
├── identity-service/          # Auth, user account (MySQL + JWT)
├── user-service/              # Customer profile (MongoDB)
├── product-service/           # Sản phẩm, tồn kho (MongoDB + Elasticsearch)
├── order-service/             # Đơn hàng (MongoDB + Kafka producer)
├── notification-service/      # Email qua Brevo API (Kafka consumer)
├── saga-orchestrator-service/ # Saga pattern choreographer (gRPC hub)
├── docker/                    # Config files cho Loki, Promtail, Grafana
├── docker-compose.yml         # Infrastructure containers
├── .env                       # Biến môi trường local (không commit)
└── .env.example               # Template biến môi trường (commit lên git)
```


---

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

