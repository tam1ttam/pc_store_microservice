# 📊 Product Service - Complete Architecture

## 🏗️ Cấu Trúc Chi Tiết

```
product-service/
│
├── src/main/java/com/devteria/product/
│   │
│   ├── ProductServiceApplication.java
│   │   └── Spring Boot main entry point
│   │
│   ├── entity/
│   │   ├── Product.java
│   │   │   ├── @Document(collection = "products")
│   │   │   ├── id (ObjectId)
│   │   │   ├── name, img, price fields...
│   │   │   └── supplier (Supplier object)
│   │   │
│   │   ├── ProductDetail.java
│   │   │   ├── @Document(collection = "product_details")
│   │   │   ├── id (ObjectId)
│   │   │   ├── processor, ram, storage...
│   │   │   ├── @DocumentReference product
│   │   │   └── images (List<String>)
│   │   │
│   │   └── Supplier.java
│   │       ├── name
│   │       └── address
│   │
│   ├── dto/
│   │   ├── request/
│   │   │   ├── ProductCreationRequest
│   │   │   │   ├── name, img, prices...
│   │   │   │   └── productDetailCreationRequest (nested)
│   │   │   │
│   │   │   ├── CreationProductRequest (alternative)
│   │   │   │
│   │   │   ├── ProductDetailCreationRequest
│   │   │   │   ├── processor, ram, storage...
│   │   │   │   └── coolingSystem, operatingSystem...
│   │   │   │
│   │   │   ├── UpdateProductDetailReq
│   │   │   │   └── + imagesUpload (List<String>)
│   │   │   │
│   │   │   └── ApiResponse<T> ⚠️ TODO: Move to common-lib
│   │   │
│   │   └── response/
│   │       ├── ProductResponse
│   │       │   ├── id
│   │       │   ├── name, img, prices...
│   │       │   └── supplier
│   │       │
│   │       └── ProductDetailResponse
│   │           ├── productId
│   │           ├── processor, ram, storage...
│   │           └── images (List<String>)
│   │
│   ├── repository/
│   │   ├── ProductRepository
│   │   │   ├── findById(ObjectId)
│   │   │   ├── searchByNameOrSupplierName(keyword)
│   │   │   ├── findByNameContaining(name, page)
│   │   │   ├── findByPriceAfterDiscountBetween(min, max)
│   │   │   └── (all extending MongoRepository<Product, ObjectId>)
│   │   │
│   │   └── ProductDetailRepository
│   │       ├── findByProductId(ObjectId)
│   │       ├── deleteByProductId(ObjectId)
│   │       └── (extending MongoRepository<ProductDetail, ObjectId>)
│   │
│   ├── mapper/
│   │   ├── ProductMapper (MapStruct)
│   │   │   ├── toProductV1(ProductCreationRequest)
│   │   │   ├── toProductV2(CreationProductRequest)
│   │   │   └── toProductResponse(Product)
│   │   │
│   │   └── ProductDetailMapper (MapStruct)
│   │       ├── toProductDetail(ProductDetailCreationRequest)
│   │       └── toProductDetailResponse(ProductDetail)
│   │
│   ├── service/
│   │   ├── ProductService (interface)
│   │   │   ├── getNewestProducts(limit)
│   │   │   ├── getBestSellingProducts(limit)
│   │   │   ├── addProduct(request)
│   │   │   ├── getProductById(id)
│   │   │   ├── updateProduct(id, request)
│   │   │   ├── deleteProductById(id)
│   │   │   ├── getProductsByPage(page, size)
│   │   │   ├── getProductsByPageAsc(page, size)
│   │   │   ├── getProductsByPageDesc(page, size)
│   │   │   ├── getProductByNameOrSupplier(keyword)
│   │   │   ├── getProductByName(name, page, size)
│   │   │   └── updateInStockProduct(id, quantity)
│   │   │
│   │   ├── ProductDetailService (interface)
│   │   │   ├── getProductDetailById(id)
│   │   │   ├── addProductDetail(product, request)
│   │   │   └── deleteProductDetailByProductId(id)
│   │   │
│   │   └── impl/
│   │       ├── ProductServiceImpl
│   │       │   ├── @Service
│   │       │   ├── @Transactional on create/update/delete
│   │       │   │
│   │       │   ├── getNewestProducts(limit)
│   │       │   │   ├─ Sort by _id DESC
│   │       │   │   └─ Return top N newest
│   │       │   │
│   │       │   ├── getBestSellingProducts(limit) ⚠️ TODO
│   │       │   │   ├─ Aggregation from orders collection
│   │       │   │   └─ Return top selling
│   │       │   │
│   │       │   ├── addProduct(request)
│   │       │   │   ├─ TODO: geminiService.isImageSafe()
│   │       │   │   ├─ productRepository.save()
│   │       │   │   ├─ productDetailService.addProductDetail() if exists
│   │       │   │   └─ return ProductResponse
│   │       │   │
│   │       │   ├── updateProduct(id, request)
│   │       │   │   ├─ TODO: Validate image via Gemini
│   │       │   │   ├─ Delete old details
│   │       │   │   ├─ Add new details
│   │       │   │   └─ return ProductResponse
│   │       │   │
│   │       │   └── deleteProductById(id)
│   │       │       ├─ Delete product details
│   │       │       ├─ Delete product
│   │       │       └─ return success status
│   │       │
│   │       └── ProductDetailServiceImpl
│   │           ├── @Service
│   │           ├── getProductDetailById(productId)
│   │           │   └─ productDetailRepository.findByProductId()
│   │           │
│   │           ├── addProductDetail(product, request)
│   │           │   ├─ Map request → ProductDetail
│   │           │   ├─ TODO: Upload images from Base64
│   │           │   ├─ productDetailRepository.save()
│   │           │   └─ return ProductDetailResponse
│   │           │
│   │           └── deleteProductDetailByProductId(id)
│   │               └─ productDetailRepository.deleteByProductId()
│   │
│   ├── controller/
│   │   ├── ProductController
│   │   │   ├── @RestController
│   │   │   ├── @RequestMapping("/products")
│   │   │   │
│   │   │   ├── GET /products/newest → getNewestProducts()
│   │   │   ├── GET /products/best-selling → getBestSellingProducts()
│   │   │   ├── GET /products → getProducts() [paginated]
│   │   │   ├── GET /products/asc → getProductsAsc() [sorted ASC]
│   │   │   ├── GET /products/desc → getProductsDesc() [sorted DESC]
│   │   │   ├── GET /products/id?id={id} → getProductById()
│   │   │   ├── GET /products/{name} → getProductByName() [paginated]
│   │   │   ├── GET /products/search?keyword=... → getProductByNameOrSupplier()
│   │   │   ├── POST /products/add → addProduct()
│   │   │   ├── PUT /products/update/{id} → updateProduct()
│   │   │   └── DELETE /products/delete/{id} → deleteProduct()
│   │   │
│   │   └── ProductDetailController
│   │       ├── @RestController
│   │       ├── @RequestMapping("/product-detail")
│   │       └── GET /product-detail/{productId} → getProductDetailById()
│   │
│   └── exception/ ⚠️ TODO: Implement
│       ├── AppException.java
│       ├── ErrorCode.java
│       └── GlobalExceptionHandler.java (@ControllerAdvice)
│
└── src/main/resources/
    ├── application.yml ⚠️ TODO
    ├── application-dev.yml ⚠️ TODO
    └── application-prod.yml ⚠️ TODO
```

---

## 🔗 Integration Points

### 1️⃣ **File Service Integration** ⚠️ TODO
```
ProductServiceImpl
├── Line 57: geminiService.isImageSafe(base64Image)
└── Line 140: geminiService.isImageSafe(newImage)

ProductDetailServiceImpl
├── Line 74: Upload images from Base64
└── TODO: cloudinaryService.upload(image)
```

### 2️⃣ **Order Service Integration** ⚠️ TODO
```
ProductServiceImpl
└── Line 49: getBestSellingProducts()
    └── Need to call OrderService.getTopSellingProducts()
```

### 3️⃣ **Common-Lib Integration** ⚠️ TODO
```
Current local definition:
├── ApiResponse.java (at dto/request/)
└── Should move to: common-lib/dto/response/ApiResponse.java

Also need in common-lib:
├── AppException.java
├── ErrorCode.java
└── JWT utilities
```

### 4️⃣ **API Gateway Integration** ⚠️ TODO
```yaml
Routes needed:
- id: product_service
  uri: http://localhost:8082
  predicates:
    - Path=/api/v1/products/**
  filters:
    - StripPrefix=2
```

---

## 📤 Request/Response Flow

### Create Product Request
```json
{
  "name": "Gaming Laptop XYZ",
  "img": "data:image/jpeg;base64,...",
  "priceAfterDiscount": 25000000,
  "originalPrice": 30000000,
  "discountPercent": 16.67,
  "priceDiscount": 5000000,
  "inStock": 50,
  "supplier": {
    "name": "TechStore Vietnam",
    "address": "Ho Chi Minh City"
  },
  "productDetailCreationRequest": {
    "processor": "Intel i7-13700K",
    "ram": "32GB DDR5",
    "storage": "1TB NVMe SSD",
    "graphicsCard": "RTX 4090",
    "powerSupply": "1000W",
    "motherboard": "ROG Maximus Z790",
    "case_": "Lian Li O11XL",
    "coolingSystem": "Corsair H150i",
    "operatingSystem": "Windows 11 Pro"
  }
}
```

### Create Product Response
```json
{
  "code": 1000,
  "result": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Gaming Laptop XYZ",
    "img": "https://res.cloudinary.com/...",
    "priceAfterDiscount": 25000000,
    "originalPrice": 30000000,
    "discountPercent": 16.67,
    "priceDiscount": 5000000,
    "supplier": {
      "name": "TechStore Vietnam",
      "address": "Ho Chi Minh City"
    }
  }
}
```

---

## 🔐 Security & Access Control (TODO)

```
Route                          | Method | Access Level
---------------------------------------------------
/products                      | GET    | PUBLIC
/products/newest               | GET    | PUBLIC
/products/best-selling         | GET    | PUBLIC
/products/{id}                 | GET    | PUBLIC
/products/search               | GET    | PUBLIC
/products/add                  | POST   | TODO: ADMIN ONLY
/products/update/{id}          | PUT    | TODO: ADMIN ONLY
/products/delete/{id}          | DELETE | TODO: ADMIN ONLY
/product-detail/{productId}    | GET    | PUBLIC
```

---

## 📊 Data Model Relationships

```
Product (1) ──── (1) ProductDetail
  │
  └── Supplier (embedded)
      ├── name
      └── address

ProductDetail
  ├── @DocumentReference → Product (references back to product)
  ├── images: List<String>
  └── specifications (processor, ram, storage, etc.)
```

---

## 🚀 Deployment Architecture

```
┌─────────────────┐
│   API Gateway   │ (Port 8888)
│  /api/v1/...    │
└────────┬────────┘
         │ /api/v1/products/**
         ↓
┌─────────────────────────────┐
│   Product Service           │ (Port 8082)
├─────────────────────────────┤
│  ├── Controllers            │
│  ├── Services               │
│  └── Repositories           │
│      ↓                      │
│  MongoDB (Collections)      │
│  ├── products               │
│  ├── product_details        │
│  └── ...                    │
└─────────────────────────────┘
         ↓ (integration)
┌──────────────────┐
│  File Service    │ (Gemini, Cloudinary)
└──────────────────┘
         ↓ (integration)
┌──────────────────┐
│  Order Service   │ (Best-selling logic)
└──────────────────┘
```

---

## ✨ Summary

- **21 files** created following monolithic pattern
- **Ready for**: Configuration, testing, deployment
- **Next**: Setup common-lib, file service integration, security
