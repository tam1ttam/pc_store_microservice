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
