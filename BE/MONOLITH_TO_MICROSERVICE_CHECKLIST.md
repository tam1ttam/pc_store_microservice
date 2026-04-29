# Monolith to Microservice Checklist

Muc tieu: doi chieu `monolithic_example` voi cac service `identity`, `product`, `profile`, `order`, `file` theo 2 tieu chi:

- Endpoint da du so voi monolith chua
- DTO request/response co giong contract cua monolith khong

Ghi chu:

- Checklist nay so theo controller/service hien co, chua tinh rewrite path tai API Gateway.
- `profile-service` duoc doi chieu voi phan `CustomerController` va mot phan `AdminController` cua monolith.
- `file-service` la hop dong moi, khong phai ban tach 1:1 tu monolith.

## 1. Identity Service

### Endpoint checklist

- [ ] Can quyet dinh giu contract dang nhap cu hay chuyen han sang contract moi
  - Monolith: `POST /api/auth/log-in`
  - Micro: `POST /auth/token`
- [x] `POST /introspect` da co
- [x] `POST /refresh` da co
- [x] `POST /logout` da co
- [x] CRUD role co co ban tuong duong
  - Monolith: `/api/roles`
  - Micro: `/roles`
- [ ] Thieu endpoint gan role cho user theo contract cu
  - Monolith: `POST /api/admin/update-role/{userName}`
  - Micro: chua co endpoint 1:1, hien chi co `PUT /users/{userId}` de cap nhat roles
- [ ] Can quyet dinh co giu them cac endpoint user moi hay khong
  - `POST /users/registration`
  - `GET /users`
  - `GET /users/{userId}`
  - `GET /users/my-info`
  - `DELETE /users/{userId}`
  - `PUT /users/{userId}`

### DTO checklist

- [ ] `AuthenticationRequest` chua giong monolith
  - Monolith: `userName`, `password`
  - Micro: `username`, `password`
- [ ] `AuthenticationResponse` chua giong monolith
  - Monolith: `token`, `isAuthenticated`
  - Micro: `token`, `expiryTime`
- [ ] `IntrospectResponse` chua giong monolith
  - Monolith: `valid`
  - Micro: `valid`, `userId`
- [x] `RefreshRequest` giong monolith
- [x] `LogoutRequest` giong monolith
- [ ] `RoleRequest` chua giong monolith
  - Monolith: `name`, `description`, `userName`
  - Micro: `name`, `description`, `permissions`
- [ ] `RoleResponse` chua giong monolith
  - Monolith: `name`, `description`
  - Micro: `name`, `description`, `permissions`
- [ ] Neu muon giu luong tao customer cu, can map lai giua `CustomerCreationResquest` cua monolith va `UserCreationRequest` cua identity
  - Monolith customer create: `userName`, `firstName`, `lastName`, `email`, `phoneNumber`, `password`
  - Identity user create: `username`, `password`, `email`, `firstName`, `lastName`, `dob`, `city`

### Danh gia nhanh

- Identity da co nhieu chuc nang hon monolith, nhung contract chua 1:1.
- Can uu tien chot 1 contract auth va 1 contract gan role cho user.

## 2. Product Service

### Endpoint checklist

- [x] `GET /products/newest` da co
- [x] `GET /products/best-selling` da co
- [x] `GET /products` da co
- [x] `GET /products/asc` da co
- [x] `GET /products/desc` da co
- [x] `GET /products/id?id=...` da co
- [x] `GET /products/{name}` da co
- [x] `POST /products/add` da co
- [x] `GET /products/search` da co
- [x] `PUT /products/update/{productId}` da co
- [x] `DELETE /products/delete/{productId}` da co
- [x] `GET /product-detail/{productId}` da co
- [ ] Thieu endpoint admin update product detail theo monolith
  - Monolith: `PUT /api/admin/update-product-detail`
  - Micro: chua expose controller tuong ung
- [ ] Can quyet dinh co tach rieng hay giu lai admin APIs cho product
  - Monolith: `POST /api/admin/add-product`
  - Monolith: `PUT /api/admin/update-product/{id}`
  - Monolith: `DELETE /api/admin/delete-product/{id}`
  - Hien tai micro dang dung truc tiep `/products/add`, `/products/update/{id}`, `/products/delete/{id}`

### DTO checklist

- [x] `ProductCreationRequest` giong monolith
- [x] `ProductResponse` giong monolith
- [x] `ProductDetailResponse` giong monolith
- [ ] `UpdateProductDetailReq` chua giong monolith
  - Monolith: `id`, `images`, `processor`, `ram`, `storage`, `graphicsCard`, `productId`, `powerSupply`, `motherboard`, `case_`, `coolingSystem`, `operatingSystem`, `imagesUpload`
  - Micro: `processor`, `ram`, `storage`, `graphicsCard`, `powerSupply`, `motherboard`, `case_`, `coolingSystem`, `operatingSystem`, `imagesUpload`
- [ ] `CreationProductRequest` cua monolith chua co DTO tuong ung 1:1 trong micro
  - Monolith admin request chi gom thong tin product co ban va `img` base64/url
  - Micro dang dung `ProductCreationRequest` co them `productDetailCreationRequest`

### Danh gia nhanh

- Product la service sat monolith nhat o public API.
- Phan con thieu lon nhat la admin product detail update va contract admin upload anh.

## 3. Profile Service

### Endpoint checklist

- [x] `POST /api/customers/register` da co
- [x] `GET /api/customers/{userName}` da co
- [x] `GET /api/customers/info` da co
- [x] `GET /api/admin/customers` da co ban tuong duong voi `GET /api/admin/customers`
- [ ] Thieu endpoint doi role cua customer theo monolith
  - Monolith: `POST /api/admin/update-role/{userName}`
  - Thuc chat nen nam ben `identity-service`, khong phai `profile-service`
- [ ] Can quyet dinh co can bo sung API admin tim kiem/update/delete customer vao monolith hay khong
  - Micro hien co them:
    - `GET /api/admin/customers/search`
    - `PUT /api/admin/customers/{userName}`
    - `DELETE /api/admin/customers/{userName}`
- [ ] Can quyet dinh co giu cac endpoint profile moi hay khong
  - `GET /users/{profileId}`
  - `GET /users`
  - `GET /users/my-profile`
  - `PUT /users/my-profile`
  - `PUT /users/avatar`
  - `POST /users/search`
  - `POST /internal/users`
  - `GET /internal/users/{userId}`

### DTO checklist

- [ ] `CustomerCreationRequest` chua giong monolith
  - Monolith: co `password`
  - Micro: khong co `password`
- [ ] `CustomerResponse` chua giong monolith
  - Monolith: `id:ObjectId`, `userName`, `firstName`, `lastName`, `email`, `phoneNumber`, `roles`
  - Micro: `id:String`, `userName`, `firstName`, `lastName`, `email`, `phoneNumber`
- [ ] Response admin customer list chua giong monolith
  - Monolith: `Page<Customer>`
  - Micro: `Page<CustomerResponse>`
- [ ] Can xac dinh ro flow register
  - Monolith: 1 request tao customer da gom password
  - Micro: can ket hop `identity-service` + `profile-service`

### Danh gia nhanh

- Public customer endpoints da co.
- Contract dang ky va response customer da thay doi do tach auth/profile.

## 4. Order Service

### Endpoint checklist

- [x] `POST /api/orders` da co
- [x] `GET /api/orders/{customerId}` da co
- [x] `PUT /api/orders/{orderId}?status=...` da co
- [x] Micro co them endpoint bo sung
  - `GET /api/orders/{customerId}/status/{status}`
  - `GET /api/orders/id/{orderId}`
  - `DELETE /api/orders/{orderId}`
- [ ] Thieu endpoint admin list orders theo contract cu
  - Monolith: `GET /api/admin/list-orders`
- [ ] Thieu endpoint admin update payment status theo contract cu
  - Monolith: `PUT /api/admin/update-payment-status/{id}`
- [ ] Payment flow chua giong monolith
  - Monolith: `POST /api/payment/create_payment`
  - Monolith: `GET /api/payment/inspect/{paymentId}`
  - Monolith: `GET /api/payment/cancel/{paymentId}`
  - Monolith: `GET /api/payment/{paymentId}`
  - Micro: `POST /api/payment/create_payment`
  - Micro: `GET /api/payment/return/{id}`
  - Micro: `GET /api/payment/cancel/{id}`
  - Micro: `GET /api/payment/{paymentId}`
  - Micro: `GET /api/payment/order/{orderId}`

### DTO checklist

- [x] `OrderCreationRequest` giong monolith
- [ ] `PaymentRequest` chua giong monolith
  - Monolith: `amount`, `userId`, `shipAddress`, `items`
  - Micro: `userId`, `amount`, `paymentMethod`, `description`
- [ ] `PaymentResponse` chua giong monolith
  - Monolith: `status`, `message`, `paymentId`, `URL`
  - Micro: `id`, `paymentId`, `userId`, `paymentMethod`, `orderId`, `amount`, `currency`, `description`, `status`
- [ ] `GET /api/payment/{paymentId}` chua giong response monolith
  - Monolith: tra `String` status
  - Micro: tra full payment object wrapped trong `ApiResponse`
- [ ] `GET /api/payment/inspect/{paymentId}` chua co dung contract
  - Micro dang dung `/return/{id}` va tra `ApiResponse<Boolean>`

### Danh gia nhanh

- Order core API da co va tot.
- Payment contract dang khac kha xa monolith, can chot lai som neu FE dang phu thuoc contract cu.

## 5. File Service

### Endpoint checklist

- [ ] Khong co endpoint 1:1 de doi chieu tu monolith
  - Monolith khong co `FileController` rieng
  - Upload anh dang nam trong `AdminController`
- [x] Micro da co contract file rieng
  - `POST /media/upload`
  - `GET /media/download/{fileName}`
- [ ] Can quyet dinh cach thay the flow upload anh cu
  - Monolith: FE gui base64 truc tiep vao product admin APIs
  - Micro: FE upload file truoc, nhan `url`, sau do gui `url` vao cac service khac

### DTO checklist

- [ ] Khong co DTO 1:1 de doi chieu
  - Monolith: `CreationProductRequest.img` va `UpdateProductDetailReq.imagesUpload` nhan base64
  - Micro: `FileResponse` tra `originalFileName`, `url`

### Danh gia nhanh

- `file-service` la thiet ke moi, khong phai migration 1:1.
- Neu muon tuong thich monolith, can them adapter hoac doi FE flow upload.

## 6. Uu tien sua de dat muc "tuong thich monolith"

- [ ] Chot co can tuong thich 100% contract monolith hay chap nhan contract moi qua API Gateway adapter
- [ ] Identity: them alias endpoint `POST /api/auth/log-in` hoac rewrite sang `/auth/token`
- [ ] Identity: quyet dinh shape cua `AuthenticationRequest/Response`
- [ ] Identity: them endpoint gan role cho user theo `userName` neu FE cu can
- [ ] Product: expose endpoint update product detail
- [ ] Product: quyet dinh co giu contract admin product cu hay dung contract product moi
- [ ] Profile: quyet dinh flow register 1 buoc hay 2 buoc
- [ ] Profile: neu can tuong thich FE cu, phai xu ly `password` o tang gateway/orchestration
- [ ] Order: them admin list orders
- [ ] Order: them admin update payment status
- [ ] Order: dong bo lai payment request/response neu FE cu dang goi truc tiep
- [ ] File: chot flow upload moi va cap nhat cac API product/profile neu can

## 7. Tong ket theo muc do hoan thien

- `product-service`: gan hoan chinh nhat so voi monolith public API
- `profile-service`: du endpoint customer co ban, nhung contract da doi do tach auth/profile
- `order-service`: order core on, payment/admin chua tuong thich monolith
- `identity-service`: co nhieu chuc nang, nhung contract va path chua 1:1
- `file-service`: la flow moi, can quyet dinh adapter hay doi FE
