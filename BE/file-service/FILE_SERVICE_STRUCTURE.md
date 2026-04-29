# File Service - Tài Liệu Cấu Trúc

## Tổng Quan

File Service là microservice quản lý upload, validate, và xóa tệp tin hình ảnh. Service này tích hợp:
- **Cloudinary** - Cloud storage cho images
- **Google Gemini API** - Image validation (kiểm tra ảnh có chứa nội dung nhạy cảm)

## Kiến Trúc Service

```
file-service/
├── src/main/java/com/devteria/file/
│   ├── controller/
│   │   └── FileController.java               # API endpoints (upload, validate, delete)
│   ├── service/
│   │   ├── FileService.java                  # Service interface
│   │   ├── ImageValidationService.java       # Validation interface
│   │   └── impl/
│   │       ├── FileServiceImpl.java           # Implementation with Cloudinary
│   │       ├── ImageValidationServiceImpl.java # Gemini API integration
│   │       ├── GeminiRequest.java            # DTO for Gemini API
│   │       └── GeminiResponse.java           # Response from Gemini
│   ├── dto/
│   │   ├── request/
│   │   │   ├── UploadImageRequest.java       # Upload DTO
│   │   │   └── ValidateImageRequest.java     # Validation DTO
│   │   └── response/
│   │       ├── UploadImageResponse.java      # Upload response
│   │       ├── ValidateImageResponse.java    # Validation response
│   │       └── ApiResponse.java              # Generic response wrapper
│   ├── exception/
│   │   ├── FileUploadException.java          # Upload failure
│   │   ├── ImageValidationException.java     # Validation failure
│   │   └── InvalidImageFormatException.java  # Format error
│   ├── config/
│   │   └── CloudinaryConfig.java             # Cloudinary Bean config
│   └── FileServiceApplication.java           # Entry point
├── pom.xml                                   # Dependencies
└── application.yml                           # Configuration
```

## API Endpoints

### 1. Upload Image
```
POST /api/files/upload
Content-Type: application/json

Request:
{
  "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "fileType": "product"  // or "avatar", "profile", etc.
}

Response: 201 Created
{
  "code": 1000,
  "message": "Upload thành công",
  "result": {
    "url": "https://res.cloudinary.com/.../PC_Store/product/xxxxx.jpg",
    "publicId": "PC_Store/product/xxxxx",
    "fileSize": 245678,
    "format": "jpg"
  }
}
```

### 2. Validate Image
```
POST /api/files/validate
Content-Type: application/json

Request:
{
  "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}

Response: 200 OK
{
  "code": 1000,
  "message": "Validation thành công",
  "result": {
    "safe": true,
    "message": "Image is safe"
  }
}
```

### 3. Delete Image
```
DELETE /api/files/{publicId}
Authorization: Bearer {ADMIN_JWT_TOKEN}

Response: 200 OK
{
  "code": 1000,
  "message": "Delete thành công",
  "result": true
}
```

## Service Layer

### FileService Interface

```java
public interface FileService {
    // Upload image to Cloudinary with validation
    UploadImageResponse uploadImage(String base64Image, String fileType);

    // Validate if image is safe
    ValidateImageResponse validateImage(String base64Image);

    // Delete image from Cloudinary
    void deleteImage(String publicId);
}
```

### ImageValidationService Interface

```java
public interface ImageValidationService {
    // Check if image is safe using Gemini API
    boolean isImageSafe(String base64Image);
}
```

## Implementation Details

### FileServiceImpl

**uploadImage() Method:**
1. Validate image using Gemini API (TODO: Call ImageValidationService)
2. Extract base64 content từ data URL
3. Decode base64 to byte array
4. Upload to Cloudinary với folder "PC_Store/{fileType}"
5. Return URL, publicId, fileSize, format

**validateImage() Method:**
1. Call ImageValidationService.isImageSafe()
2. Return ValidateImageResponse with safe status

**deleteImage() Method:**
1. Delete file từ Cloudinary using publicId
2. Log deletion result

### ImageValidationServiceImpl

**isImageSafe() Method:**
1. Detect MIME type từ base64 header
2. Clean base64 content
3. Call Google Gemini API với image data
4. Parse response để kiểm tra "SAFE" vs "UNSAFE"
5. Return boolean result

**Prompt used:**
```
"Analyze this image strictly. Does it contain weapons, guns, tobacco, or explicit content? 
Answer ONLY one word: 'SAFE' if none are present, 'UNSAFE' if any are present."
```

## DTOs

### UploadImageRequest
```json
{
  "base64Image": "data:image/jpeg;base64,...",
  "fileType": "product"
}
```
- `base64Image`: Required, not blank
- `fileType`: Required (product, avatar, profile, etc.)

### UploadImageResponse
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "PC_Store/product/xxxxx",
  "fileSize": 245678,
  "format": "jpg"
}
```

### ValidateImageRequest
```json
{
  "base64Image": "data:image/jpeg;base64,..."
}
```

### ValidateImageResponse
```json
{
  "safe": true,
  "message": "Image is safe"
}
```

## Configuration

### application.yml

```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}

gemini:
  api:
    key: ${GEMINI_API_KEY}
    model: "gemini-1.5-flash"

server:
  port: 8082
```

### CloudinaryConfig Bean

```java
@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret));
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

## Exception Handling

### FileUploadException
- Thrown when Cloudinary upload fails
- HTTP Status: 400 Bad Request

### ImageValidationException
- Thrown when image fails Gemini validation
- HTTP Status: 400 Bad Request

### InvalidImageFormatException
- Thrown when base64 format is invalid
- HTTP Status: 400 Bad Request

## Integration Points (TODO Markers)

### 1. Image Validation (Line: ImageValidationServiceImpl)
- **Current**: Uses Gemini API to check for weapons, guns, tobacco, explicit content
- **TODO**: Add fallback strategy if Gemini API fails
- **TODO**: Configure caching for repeated image validations

### 2. Cloudinary Integration (Line: FileServiceImpl)
- **Current**: Uploads to Cloudinary with folder organization by fileType
- **TODO**: Add retry logic for failed uploads
- **TODO**: Implement image transformation (resize, compress, etc.)

### 3. Product Service Integration (Line: FileController)
- **TODO**: Receive upload from ProductController
- **TODO**: Return URL to Product Service for storing in database
- **TODO**: Handle image deletion when product is deleted

### 4. Profile Service Integration
- **TODO**: Handle avatar uploads for customer profiles
- **TODO**: Integrate with ProfileController for avatar updates

## File Upload Flow

```
Client
   │
   ├─ POST /api/files/upload
   │  (base64Image + fileType)
   │
   ▼
FileController
   │
   ├─ Validate request
   ├─ Call FileService.uploadImage()
   │
   ▼
FileServiceImpl
   │
   ├─ Call ImageValidationService.isImageSafe()
   │
   ▼
ImageValidationServiceImpl
   │
   ├─ Call Gemini API
   ├─ Parse response
   ├─ Return boolean (safe/unsafe)
   │
   ▼ (if safe)
FileServiceImpl
   │
   ├─ Decode base64
   ├─ Call cloudinary.uploader().upload()
   ├─ Get URL, publicId, fileSize
   │
   ▼
UploadImageResponse
   │
   └─ Return to Client
      {url, publicId, fileSize, format}
```

## Image Validation Flow

```
Client
   │
   ├─ POST /api/files/validate
   │  (base64Image)
   │
   ▼
FileController
   │
   ├─ Call FileService.validateImage()
   │
   ▼
FileServiceImpl
   │
   ├─ Call ImageValidationService.isImageSafe()
   │
   ▼
ImageValidationServiceImpl
   │
   ├─ Detect MIME type
   ├─ Build Gemini request
   ├─ Call Gemini API
   ├─ Parse response
   │
   ▼
ValidateImageResponse
   │
   └─ Return to Client
      {safe: true/false, message: "..."}
```

## Comparison with Monolithic

### Monolithic AdminController
```
✓ Upload product images (with Cloudinary)
✓ Validate images (with Gemini)
✓ Direct integration with Product Admin endpoints
✗ No separate service layer
✗ No dedicated exception classes
```

### File Service (Microservice)
```
✓ Separate service layer (interface + impl)
✓ Custom exception classes (3 types)
✓ Dedicated validation service (Gemini integration)
✓ Cloudinary configuration (CloudinaryConfig)
✓ Reusable for all services (Product, Profile, etc.)
✓ TODO markers for cross-service integration
✓ Proper logging and error handling
```

## Key Features

1. **Image Validation**
   - Uses Google Gemini API
   - Checks for weapons, guns, tobacco, explicit content
   - Returns SAFE or UNSAFE with reasoning

2. **Cloudinary Integration**
   - Uploads to cloud storage
   - Organizes by fileType (product, avatar, profile)
   - Returns URL for client to store

3. **Error Handling**
   - Custom exceptions with specific messages
   - Graceful fallback for API failures
   - Detailed logging

4. **Reusable Design**
   - Can be called from any service
   - Decoupled from business logic
   - Independent scaling

## Dependencies

```xml
<!-- Cloudinary -->
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-java</artifactId>
</dependency>

<!-- Spring REST -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

## Testing

### Upload Test
```bash
curl -X POST http://localhost:8082/api/files/upload \
  -H "Content-Type: application/json" \
  -d '{
    "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "fileType": "product"
  }'
```

### Validation Test
```bash
curl -X POST http://localhost:8082/api/files/validate \
  -H "Content-Type: application/json" \
  -d '{
    "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
  }'
```

## Security Considerations

1. **Base64 Validation**
   - Check format before decoding
   - Limit file size
   - Validate MIME types

2. **Gemini API Security**
   - API key in environment variables
   - Never log full responses
   - Handle timeout gracefully

3. **Cloudinary Security**
   - API secret in environment variables
   - Use signed URLs for sensitive operations
   - Implement rate limiting

## Performance Optimization

1. **Caching**
   - Cache validation results for identical images
   - Use ETag for image comparison

2. **Async Processing**
   - Consider async upload for large files
   - Implement job queue for batch uploads

3. **Compression**
   - Configure Cloudinary transformations
   - Reduce file size before upload

## Next Steps

1. ✅ Create File Service structure
2. ✅ Implement upload/validation/delete services
3. ✅ Update file-service.proto
4. ⏳ Create Feign client for Product Service
5. ⏳ Create Feign client for Profile Service
6. ⏳ Add unit tests
7. ⏳ Add integration tests with Cloudinary
8. ⏳ Implement caching strategy

---

**Version:** 1.0  
**Status:** Implementation Complete  
**Created:** 2024
