# Profile Service - Tài Liệu Cấu Trúc

## Tổng Quan

Profile Service là microservice quản lý thông tin hồ sơ khách hàng trong hệ thống. Service này **CHỈ lưu trữ thông tin tài khoản** (tên, email, số điện thoại) và **KHÔNG chứa thông tin đăng nhập** (password, roles). Thông tin xác thực được quản lý bởi Identity Service.

## Kiến Trúc Service

```
profile-service/
├── src/main/java/com/devteria/profile/
│   ├── controller/
│   │   ├── CustomerController.java          # Public endpoints (register, get, info)
│   │   └── ProfileAdminController.java      # Admin endpoints (CRUD, search)
│   ├── service/
│   │   ├── CustomerService.java             # Interface
│   │   └── impl/
│   │       └── CustomerServiceImpl.java      # Implementation with business logic
│   ├── entity/
│   │   └── Customer.java                    # Document: customer profile data
│   ├── dto/
│   │   ├── request/
│   │   │   ├── CustomerCreationRequest.java # DTO for registration
│   │   │   └── CustomerUpdateRequest.java   # DTO for profile updates
│   │   └── response/
│   │       ├── CustomerResponse.java        # Customer DTO for API response
│   │       └── ApiResponse.java             # Generic API response wrapper
│   ├── repository/
│   │   └── CustomerRepository.java          # MongoDB repository interface
│   ├── mapper/
│   │   └── CustomerMapper.java              # MapStruct DTO mapper
│   ├── exception/
│   │   ├── CustomerNotFoundException.java   # Exception: customer not found
│   │   └── CustomerAlreadyExistsException.java # Exception: duplicate customer
│   ├── config/
│   │   └── [Configuration files]
│   └── ProfileServiceApplication.java       # Spring Boot entry point
├── pom.xml                                  # Maven dependencies
└── application.yml                          # Configuration
```

## Entity Model

### Customer

```java
@Document(collection = "customers")
public class Customer {
    ObjectId id;              // MongoDB ID (auto-generated)
    String userName;          // Unique username
    String firstName;         // First name
    String lastName;          // Last name
    String email;             // Email address
    String phoneNumber;       // Phone number (VN format: 0xxxxxxxxx)
    // NOTE: Không có password field
}
```

**Key Points:**
- `userName` có constraint UNIQUE
- Tất cả fields được lưu trong MongoDB collection "customers"
- Password được quản lý bởi Identity Service

## DTO Models

### CustomerCreationRequest (Register)
```json
{
  "userName": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "0123456789"
}
```

**Validation:**
- userName: 3-50 characters, required
- firstName/lastName: 1-50 characters, required
- email: valid email format, required
- phoneNumber: Vietnamese format (0xxxxxxxxx), optional

### CustomerUpdateRequest (Update Profile)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "0123456789"
}
```

**Note:**
- Tất cả fields là optional
- Không thể update userName hoặc password qua endpoint này
- Để thay đổi password, sử dụng Identity Service

### CustomerResponse
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userName": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "0123456789"
}
```

## API Endpoints

### Public Endpoints

#### 1. Register Customer
```
POST /api/customers/register
Content-Type: application/json

{
  "userName": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "0123456789"
}

Response: 201 Created
{
  "code": 1000,
  "message": "Đăng ký thành công",
  "result": { CustomerResponse }
}
```

#### 2. Get Customer by Username
```
GET /api/customers/{userName}

Response: 200 OK
{
  "code": 1000,
  "message": "Lấy thông tin thành công",
  "result": { CustomerResponse }
}
```

#### 3. Get Current User Info
```
GET /api/customers/info
Authorization: Bearer {JWT_TOKEN}

Response: 200 OK
{
  "code": 1000,
  "message": "Lấy thông tin thành công",
  "result": { CustomerResponse }
}
```

### Admin Endpoints (Require ADMIN Role)

#### 1. Get All Customers (Paginated)
```
GET /api/admin/customers?page=0&size=10&sort=userName,asc
Authorization: Bearer {ADMIN_JWT_TOKEN}

Response: 200 OK
{
  "code": 1000,
  "message": "Lấy danh sách thành công",
  "result": {
    "content": [ CustomerResponse ],
    "totalPages": 1,
    "totalElements": 10
  }
}
```

#### 2. Search Customers
```
GET /api/admin/customers/search?searchKey=John&page=0&size=10
Authorization: Bearer {ADMIN_JWT_TOKEN}

Response: 200 OK
{
  "code": 1000,
  "message": "Tìm kiếm thành công",
  "result": {
    "content": [ CustomerResponse ],
    "totalPages": 1,
    "totalElements": 5
  }
}
```

#### 3. Update Customer Profile (Admin)
```
PUT /api/admin/customers/{userName}
Authorization: Bearer {ADMIN_JWT_TOKEN}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "0987654321"
}

Response: 200 OK
{
  "code": 1000,
  "message": "Cập nhật thành công",
  "result": { CustomerResponse }
}
```

#### 4. Delete Customer (Admin)
```
DELETE /api/admin/customers/{userName}
Authorization: Bearer {ADMIN_JWT_TOKEN}

Response: 200 OK
{
  "code": 1000,
  "message": "Xóa thành công",
  "result": "Người dùng đã bị xóa: john_doe"
}
```

## Service Layer

### CustomerService Interface

```java
public interface CustomerService {
    // Register new customer
    CustomerResponse createCustomer(CustomerCreationRequest request);

    // Get customer by username
    CustomerResponse getCustomerByUserName(String userName);

    // Get current logged-in user info
    CustomerResponse getInfo();

    // Update customer profile
    CustomerResponse updateProfile(String userName, CustomerUpdateRequest request);

    // Get all customers (admin)
    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    // Search customers by name
    Page<CustomerResponse> searchCustomersByName(String searchKey, Pageable pageable);

    // Delete customer
    void deleteCustomer(String userName);

    // Check if customer exists
    boolean existsCustomerByUserName(String userName);
}
```

### CustomerServiceImpl - Business Logic

**Key Methods:**

1. **createCustomer()**
   - TODO: Call Identity Service to create user account
   - Validate username uniqueness
   - Save customer profile to MongoDB
   - Return CustomerResponse

2. **getCustomerByUserName()**
   - Query MongoDB by userName
   - Throw exception if not found
   - Return CustomerResponse

3. **getInfo()**
   - TODO: Extract username from JWT token in SecurityContext
   - Query current user profile
   - Return CustomerResponse

4. **updateProfile()**
   - TODO: Check authorization (owner or ADMIN)
   - Update partial fields
   - Save changes
   - Return updated CustomerResponse

5. **deleteCustomer()**
   - TODO: Call Identity Service to delete user account
   - Delete profile from MongoDB

## Repository

### CustomerRepository

```java
public interface CustomerRepository extends MongoRepository<Customer, ObjectId> {
    Optional<Customer> findByUserName(String userName);

    Page<Customer> findAllByFirstName(String firstName, Pageable pageable);

    Page<Customer> findAllByLastName(String lastName, Pageable pageable);

    Page<Customer> findAllByFirstNameOrLastName(String searchKey, Pageable pageable);

    boolean existsByUserName(String userName);
}
```

**Query Methods:**
- Regex-based search for first/last names (case-insensitive)
- Pagination support
- Custom @Query for complex searches

## Integration Points (TODO Markers)

### 1. Identity Service Integration
- **Create User Account**: When registering, call Identity Service to create account
  - Location: `CustomerServiceImpl.createCustomer()` - Line 36
  - Purpose: Create user credentials (username + password)

- **Delete User Account**: When deleting customer, call Identity Service
  - Location: `CustomerServiceImpl.deleteCustomer()` - Line 120
  - Purpose: Remove user from Identity Service

- **Get Current User**: Extract from JWT token
  - Location: `CustomerServiceImpl.getInfo()` - Line 68
  - Purpose: Authenticate current user

### 2. Security Integration
- Spring Security with JWT token validation
- @PreAuthorize annotations for role-based access
- SecurityContext for extracting current user

## Error Handling

### Exception Classes

1. **CustomerNotFoundException**
   - Thrown when customer doesn't exist
   - HTTP Status: 404 Not Found

2. **CustomerAlreadyExistsException**
   - Thrown when trying to register duplicate username
   - HTTP Status: 409 Conflict

## Configuration

### application.yml Settings

```yaml
spring:
  application:
    name: profile-service
  data:
    mongodb:
      uri: mongodb://localhost:27017/profile_db
  security:
    jwt:
      secret: your-secret-key
      expiration: 86400000 # 24 hours

server:
  port: 8083
  servlet:
    context-path: /
```

## Development Workflow

### 1. Local Development
```bash
# Build project
mvn clean install

# Run service
mvn spring-boot:run

# Run tests
mvn test
```

### 2. Docker Deployment
```bash
# Build image
docker build -t profile-service:1.0 .

# Run container
docker run -p 8083:8083 profile-service:1.0
```

### 3. Integration Testing
- Create CustomerControllerTest
- Mock CustomerService
- Test all public endpoints
- Test authorization for admin endpoints

## Dependencies

```xml
<!-- Spring Cloud Feign (for service-to-service communication) -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>

<!-- MongoDB -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>

<!-- MapStruct (DTO mapper) -->
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## Next Steps

### To Complete Profile Service:
1. ✅ Create Customer entity (profile only, no password)
2. ✅ Create DTOs (Request, Update, Response)
3. ✅ Create Repository with custom queries
4. ✅ Create Service layer with TODO markers
5. ✅ Create Controllers (public + admin)
6. ✅ Create Exception classes
7. ⏳ Update profile-service.proto file
8. ⏳ Create exception handler @ControllerAdvice
9. ⏳ Add unit tests
10. ⏳ Update API Gateway routing

### To Integrate with Other Services:
1. Create Feign client for Identity Service
2. Create error handling for service-to-service calls
3. Configure circuit breaker (Resilience4j)
4. Set up service discovery (Consul/Eureka)

### Future Enhancements:
- Address/Location fields for profile
- Profile image/avatar support (with File Service)
- Customer preferences and settings
- Notification preferences
- Address book management

---

**Created Date:** 2024
**Version:** 1.0
**Status:** Ready for Integration
