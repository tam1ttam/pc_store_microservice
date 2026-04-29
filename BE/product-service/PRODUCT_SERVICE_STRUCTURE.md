# Product Service - File Structure Documentation

## 📁 Cấu Trúc Thư Mục

```
product-service/
├── src/main/java/com/devteria/product/
│   ├── ProductServiceApplication.java          (Main Entry)
│   ├── controller/
│   │   ├── ProductController.java              ✓ Quản lý sản phẩm
│   │   └── ProductDetailController.java        ✓ Quản lý chi tiết sản phẩm
│   ├── service/
│   │   ├── ProductService.java                 ✓ Interface service
│   │   ├── ProductDetailService.java           ✓ Interface service
│   │   └── impl/
│   │       ├── ProductServiceImpl.java          ✓ Implement service
│   │       └── ProductDetailServiceImpl.java    ✓ Implement service
│   ├── entity/
│   │   ├── Product.java                        ✓ MongoDB Document
│   │   ├── ProductDetail.java                  ✓ MongoDB Document
│   │   └── Supplier.java                       ✓ Value Object
│   ├── dto/
│   │   ├── request/
│   │   │   ├── ApiResponse.java                ✓ Common Response (TODO: Move to common-lib)
│   │   │   ├── ProductCreationRequest.java     ✓ Create product
│   │   │   ├── CreationProductRequest.java     ✓ Alternative create product
│   │   │   ├── ProductDetailCreationRequest.java ✓ Create product detail
│   │   │   └── UpdateProductDetailReq.java     ✓ Update product detail
│   │   └── response/
│   │       ├── ProductResponse.java            ✓ Product DTO
│   │       └── ProductDetailResponse.java      ✓ ProductDetail DTO
│   ├── repository/
│   │   ├── ProductRepository.java              ✓ MongoDB Repository
│   │   └── ProductDetailRepository.java        ✓ MongoDB Repository
│   ├── mapper/
│   │   ├── ProductMapper.java                  ✓ MapStruct Mapper
│   │   └── ProductDetailMapper.java            ✓ MapStruct Mapper
│   └── exception/
│       └── (TODO: Thêm custom exception handling)
└── src/main/resources/
    └── (TODO: Thêm application.yml configuration)
```

---

## 🔄 Luồng Dữ Liệu (Data Flow)

### 1. **Thêm Sản Phẩm (Create Product)**
```
ProductController.addProduct(ProductCreationRequest)
    ↓
ProductServiceImpl.addProduct(request)
    ├─ ProductMapper.toProductV1(request) → Product entity
    ├─ TODO: GeminiService.isImageSafe(image) ← Từ File Service
    ├─ ProductRepository.save(product)
    ├─ ProductDetailService.addProductDetail(detail)
    └─ return ProductResponse
```

### 2. **Lấy Sản Phẩm (Get Product)**
```
ProductController.getProductById(id)
    ↓
ProductServiceImpl.getProductById(id)
    ├─ ProductRepository.findById(id)
    ├─ ProductMapper.toProductResponse(product)
    └─ return ProductResponse
```

### 3. **Cập Nhật Sản Phẩm (Update Product)**
```
ProductController.updateProduct(id, request)
    ↓
ProductServiceImpl.updateProduct(id, request)
    ├─ ProductRepository.findById(id)
    ├─ TODO: GeminiService.isImageSafe(newImage) ← Từ File Service
    ├─ ProductDetailService.deleteProductDetailByProductId(id)
    ├─ ProductDetailService.addProductDetail(newDetail)
    └─ return ProductResponse
```

### 4. **Chi Tiết Sản Phẩm (Product Details)**
```
ProductDetailController.getProductDetailById(productId)
    ↓
ProductDetailServiceImpl.getProductDetailById(productId)
    ├─ ProductDetailRepository.findByProductId(productId)
    ├─ ProductDetailMapper.toProductDetailResponse(detail)
    └─ return ProductDetailResponse
```

---

## 📋 Endpoints

### Product Management
```
GET     /products                           → Lấy danh sách sản phẩm (phân trang)
GET     /products/newest?limit=10          → Sản phẩm mới nhất
GET     /products/best-selling?limit=10    → Sản phẩm bán chạy
GET     /products/asc?page=0               → Sắp xếp giá tăng dần
GET     /products/desc?page=0              → Sắp xếp giá giảm dần
GET     /products/id?id={id}               → Lấy sản phẩm theo ID
GET     /products/{name}?page=0            → Tìm sản phẩm theo tên
GET     /products/search?keyword=...       → Tìm theo tên/nhà cung cấp
POST    /products/add                      → Thêm sản phẩm
PUT     /products/update/{productId}       → Cập nhật sản phẩm
DELETE  /products/delete/{productId}       → Xóa sản phẩm
```

### Product Details
```
GET     /product-detail/{productId}        → Lấy chi tiết sản phẩm
```

---

## 🔗 Dependencies & TODO Items

### Internal Dependencies
- ✓ ProductRepository
- ✓ ProductDetailRepository
- ✓ ProductMapper
- ✓ ProductDetailMapper

### External Dependencies (TODO)
1. **TODO: File Service** - ImageValidationService
   - `GeminiService.isImageSafe(base64Image)` → Kiểm tra ảnh độc hại
   - `CloudinaryService.upload(image)` → Upload ảnh lên Cloudinary
   - Integration: ProductServiceImpl line 57, 140

2. **TODO: Order Service** - Lấy dữ liệu bán hàng
   - `getBestSellingProducts()` → Cần lấy top products từ orders
   - Integration: ProductServiceImpl line 49

3. **TODO: Common-Lib**
   - `ApiResponse<T>` (currently defined locally, should move to common-lib)
   - Exception handling classes
   - Integration: Tất cả DTOs

4. **TODO: API Gateway**
   - Route: `/api/v1/products/**` → product-service:8082
   - Authentication filter

---

## 📝 Implementation Notes

### Completed ✓
- All entities mapped to MongoDB
- All DTOs for request/response
- Repository interfaces with custom queries
- Service interfaces and implementations
- Controllers with RESTful endpoints
- MapStruct mappers for DTO conversion
- Pagination and sorting support
- Search functionality (name/supplier)

### Incomplete (TODO) ⚠️
1. **Configuration** - application.yml
   ```yaml
   spring:
     data:
       mongodb:
         uri: mongodb://...
     jpa:
       hibernate:
         ddl-auto: update
   server:
     port: 8082
   ```

2. **Exception Handling**
   - Custom AppException class
   - Global @ControllerAdvice
   - Error codes (PRODUCT_NOT_FOUND, etc.)

3. **File Upload Integration**
   - GeminiService injection (line 57, 140)
   - Base64 image processing
   - Cloudinary upload integration

4. **Image Upload Handling**
   - ProductDetailServiceImpl line 74 - Upload images từ Base64

5. **Order Service Integration**
   - ProductServiceImpl line 49 - Best selling aggregation

6. **Security**
   - JWT authentication filters
   - Role-based access control
   - Admin-only endpoints

7. **API Documentation**
   - Swagger/SpringDoc OpenAPI annotations
   - API descriptions

8. **Testing**
   - Unit tests cho services
   - Integration tests cho repositories
   - Controller tests

---

## 🔐 Access Control (TODO)

```
GET /products/*          → PUBLIC (Anyone)
POST /products/add       → TODO: ADMIN ONLY (Role check from Identity Service)
PUT /products/update/*   → TODO: ADMIN ONLY
DELETE /products/delete/* → TODO: ADMIN ONLY
```

---

## 📌 Key Points

1. **Database**: MongoDB (Document-based, no transactions support)
2. **ID Type**: ObjectId (generated by MongoDB)
3. **Pagination**: Spring Data Page/Pageable
4. **Sorting**: Default & price-based sorting
5. **Search**: Regex-based search on name & supplier
6. **Transaction**: @Transactional on create/update/delete
7. **Mapping**: MapStruct for DTO conversion

---

## 🚀 Next Steps

1. Setup common-lib and move shared DTOs/exceptions
2. Implement File Service integration (Gemini + Cloudinary)
3. Implement security/JWT validation via Gateway
4. Create application.yml configuration
5. Setup MongoDB connection strings
6. Add Swagger/OpenAPI documentation
7. Write unit & integration tests
8. Integrate with Order Service for best-selling logic
