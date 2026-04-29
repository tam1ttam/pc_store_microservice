# Common-Lib Quick Reference Guide

## 📦 What's Available in Common-Lib?

Common-Lib is the shared foundation for ALL 5 microservices. Everything listed here is available to import and use.

---

## 🎯 Quick Start

### 1. Exception Handling
**Import from**: `tam.common.exception`

```java
// Throw exceptions
throw new AppException(ErrorCode.USER_NOT_EXISTED);
throw new AppException(ErrorCode.UNAUTHENTICATED);
throw new AppException(ErrorCode.INVALID_KEY);

// All error codes available in ErrorCode.java enum
```

**Available Error Codes**:
- USER_NOT_EXISTED
- UNAUTHENTICATED
- INVALID_KEY
- UNCATEGORIZED_EXCEPTION
- And others...

**Automatic Handling**: GlobalExceptionHandler catches all and converts to ApiResponse

---

### 2. Response Models
**Import from**: `tam.common.base`

#### ApiResponse<T> - Main wrapper
```java
// Success response (automatic from controllers)
ApiResponse.<ProductResponse>builder()
    .code(1000)
    .message("Success")
    .result(productResponse)
    .build()

// Output JSON:
{
  "code": 1000,
  "message": "Success",
  "result": { ... }
}
```

#### PageResponse<T> - For pagination
```java
// Pagination response
PageResponse.<ProductResponse>builder()
    .items(List of items)
    .currentPage(1)
    .pageSize(10)
    .totalElements(100)
    .build()
```

---

### 3. Security Utilities
**Import from**: `tam.common.utils.AuthenticationUtils`

```java
// Extract current user ID from JWT
String userId = AuthenticationUtils.extractUserId();

// Extract full JWT token
String jwt = AuthenticationUtils.extractJwt();

// Get full authentication
Authentication auth = AuthenticationUtils.getAuthentication();
```

---

### 4. Constants
**Import from**: `tam.common.constants`

```java
// API Constants
ApiConstant.ACCESS_DENIED
ApiConstant.SUCCESS

// Message codes
MessageCode.CREATE_SUCCESS
MessageCode.UPDATE_SUCCESS

// Pagination
PageableConstant.DEFAULT_PAGE_SIZE
PageableConstant.MAX_PAGE_SIZE

// Query filters
QueryConstants.ACTIVE
QueryConstants.INACTIVE
```

---

### 5. Utilities
**Import from**: `tam.common.utils`

```java
// Date utilities
DateUtils.getCurrentDate()
DateUtils.formatDate(date, pattern)

// Sorting
SortUtils.createSort(direction, field)

// Messages
MessagesUtils.getMessage(key)
```

---

### 6. Entity Base Class
**Extend from**: `tam.common.base.AbstractAuditEntity`

```java
@Document(collection = "products")
public class Product extends AbstractAuditEntity {
    // Automatically includes:
    // - id (ObjectId)
    // - createdAt (LocalDateTime)
    // - updatedAt (LocalDateTime)
    // - createdBy (String)
    // - updatedBy (String)
    
    private String name;
    private Double price;
}
```

---

### 7. Configurations

#### CustomJwtDecoder
**Auto-configured** for JWT token validation

#### CorsConfig
**Auto-configured** for CORS requests

#### BaseSecurityConfig
**Auto-configured** for Spring Security

---

### 8. MongoDB Support ✨ NEW
**Auto-configured** ObjectMapper with:
- ObjectId → String serialization
- LocalDate/LocalDateTime support

**No setup needed** - Just use ObjectId normally!

```java
@Id
ObjectId id;  // Will serialize to String in JSON responses
```

---

### 9. Feign Clients ✨ NEW
**Framework**: Spring Cloud OpenFeign

**For calling other services**:

```java
// In your service
@FeignClient(name = "product-service", url = "${service.product.url}")
public interface ProductServiceClient {
    @GetMapping("/api/products/{id}")
    ApiResponse<ProductResponse> getProduct(@PathVariable String id);
    
    @PutMapping("/api/products/{id}/stock")
    ApiResponse<Void> updateStock(@PathVariable String id, @RequestBody UpdateStockRequest req);
}

// In controller/service
@Autowired
private ProductServiceClient productClient;

public void checkStock(String productId) {
    ApiResponse<ProductResponse> response = productClient.getProduct(productId);
    // Error handling is automatic!
}
```

**Error Handling**: FeignErrorDecoder automatically converts errors to AppException

---

## 📋 File Locations in Common-Lib

```
common-lib/src/main/java/tam/common/
├── base/
│   ├── ApiResponse.java ..................... Generic response wrapper
│   └── PageResponse.java .................... Pagination wrapper
├── config/
│   ├── CustomJwtDecoder.java ................ JWT decoder
│   ├── JwtAuthenticationEntryPoint.java ..... Unauthorized handler
│   ├── BaseSecurityConfig.java ............. Spring Security setup
│   ├── CorsConfig.java ..................... CORS configuration
│   ├── OpenApiConfig.java .................. Swagger/API docs
│   └── ObjectMapperConfiguration.java ....... ObjectId serialization
├── constants/
│   ├── ApiConstant.java .................... API constants
│   ├── MessageCode.java .................... Message codes
│   ├── PageableConstant.java ............... Pagination constants
│   ├── Property.java ....................... Property constants
│   ├── QueryConstants.java ................. Query constants
│   └── SortConstants.java .................. Sort constants
├── exception/
│   ├── AppException.java ................... Custom exception
│   ├── ErrorCode.java ...................... Error code enum
│   └── GlobalExceptionHandler.java ......... Exception handler
├── feign/
│   ├── FeignClientConfiguration.java ....... Feign setup (NEW)
│   └── FeignErrorDecoder.java .............. Error handling (NEW)
├── mapper/
│   └── (Not applicable - per service)
├── model/
│   ├── AbstractAuditEntity.java ............ Base entity
│   └── listener/
│       └── CustomAuditingEntityListener.java Audit listener
└── utils/
    ├── AuthenticationUtils.java ............ JWT utilities
    ├── DateUtils.java ...................... Date utilities
    ├── MessagesUtils.java .................. Message utilities
    └── SortUtils.java ...................... Sort utilities
```

---

## 🔄 How Services Use Common-Lib

### Example: ProductService

```java
package com.devteria.product.service;

import tam.common.base.ApiResponse;
import tam.common.exception.AppException;
import tam.common.exception.ErrorCode;
import tam.common.utils.AuthenticationUtils;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    
    @Override
    public ProductResponse getProduct(String id) {
        // Uses AppException
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
        
        // Returns mapped response
        return productMapper.toResponse(product);
    }
}
```

### Example: ProductController

```java
package com.devteria.product.controller;

import tam.common.base.ApiResponse;
import tam.common.utils.AuthenticationUtils;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProduct(@PathVariable String id) {
        // Exception automatically converted to ApiResponse by GlobalExceptionHandler
        ProductResponse result = productService.getProduct(id);
        
        // Manual response building
        return ApiResponse.<ProductResponse>builder()
            .code(1000)
            .result(result)
            .build();
    }
    
    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@RequestBody ProductCreationRequest req) {
        // Extract user info from JWT
        String userId = AuthenticationUtils.extractUserId();
        
        // Create and return
        ProductResponse result = productService.create(req, userId);
        return ApiResponse.<ProductResponse>builder()
            .result(result)
            .build();
    }
}
```

---

## ✅ Dependency Checklist for Services

Each microservice should have in pom.xml:

```xml
<!-- Inherit from common-lib -->
<dependency>
    <groupId>com.tam</groupId>
    <artifactId>common-lib</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>

<!-- Service-specific -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>
```

---

## 🚀 Using Feign for Service Calls

### Step 1: Create Feign Client in your service

```java
// In your-service/feign/ProductServiceClient.java

@FeignClient(
    name = "product-service",
    url = "${service.product.url:http://localhost:8081}"
)
public interface ProductServiceClient {
    
    @GetMapping("/api/products/{id}")
    ApiResponse<ProductResponse> getProduct(@PathVariable String id);
    
    @GetMapping("/api/products/{id}/stock")
    ApiResponse<CheckStockResponse> checkStock(
        @PathVariable String id,
        @RequestParam int quantity
    );
    
    @PutMapping("/api/products/{id}/stock/update")
    ApiResponse<Void> updateStock(
        @PathVariable String id,
        @RequestBody UpdateStockRequest request
    );
}
```

### Step 2: Add to application.properties

```properties
service.product.url=http://product-service:8081
service.order.url=http://order-service:8082
service.profile.url=http://profile-service:8083
service.file.url=http://file-service:8084
```

### Step 3: Use in service/controller

```java
@Service
public class OrderServiceImpl {
    
    @Autowired
    private ProductServiceClient productClient;
    
    public void createOrder(OrderCreationRequest request) {
        // Check stock via Feign
        ApiResponse<CheckStockResponse> response = 
            productClient.checkStock(request.getProductId(), request.getQuantity());
        
        if (!response.getResult().isAvailable()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        
        // Create order...
    }
}
```

---

## ⚠️ Important Notes

1. **ObjectId Serialization**: Automatic! No config needed.
2. **Exception Handling**: GlobalExceptionHandler catches all AppException
3. **Response Format**: All responses automatically wrapped in ApiResponse
4. **Security**: JWT validation automatically handled
5. **Feign Errors**: Automatically converted to AppException

---

## 📞 Support

For issues or questions about common-lib, check:
- COMMON_LIB_ENHANCEMENT_SUMMARY.md
- Individual service documentation
- Code comments in common-lib package
