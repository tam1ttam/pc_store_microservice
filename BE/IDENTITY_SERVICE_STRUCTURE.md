# Identity Service Structure & Documentation

## Overview

The **Identity Service** is a centralized authentication and authorization microservice that handles:
- User authentication (login with username/password)
- JWT token generation and validation
- Token refresh and logout (token invalidation)
- Role-based access control (RBAC)
- Permission management
- User account management

## Architecture Pattern

**Database**: MySQL with JPA/Hibernate (Relational Model)
- Entities use `@Entity` with JPA mappings
- Primary key: String (UUID)
- Foreign keys: JPA `@ManyToMany`, `@OneToMany`, `@ManyToOne` relationships

**API Response Format**: Consistent `ApiResponse<T>` wrapper
```java
{
  "code": 0,
  "result": { ... },
  "message": "Success"
}
```

## Core Components

### 1. Entities

#### User Entity
```
@Entity
- id: String (UUID)
- username: String (unique, indexed)
- password: String (BCrypt hashed)
- email: String (unique, indexed)
- emailVerified: boolean
- roles: Set<Role> (@ManyToMany)
```

**Key Features**:
- Username and email must be unique
- Password stored as BCrypt hash (encoded with strength 10)
- Email verification flag for account status tracking
- Many-to-many relationship with roles

#### Role Entity
```
@Entity
- id: String
- name: String (e.g., "ADMIN", "USER", "MODERATOR")
- description: String
- permissions: Set<Permission> (@ManyToMany)
- createdAt: LocalDateTime
```

**Key Features**:
- Represents role definitions
- Can have multiple permissions
- Predefined roles: USER_ROLE, ADMIN_ROLE

#### Permission Entity
```
@Entity
- id: String
- name: String (e.g., "CREATE_POST", "DELETE_USER", "EDIT_PROFILE")
- description: String
- createdAt: LocalDateTime
```

**Key Features**:
- Granular permission definitions
- Can be assigned to multiple roles
- Used in scope building for JWT tokens

#### InvalidatedToken Entity
```
@Entity
- id: String (JWT ID - jti claim)
- expiryTime: Date
- createdAt: LocalDateTime
```

**Key Features**:
- Tracks invalidated tokens (logout/refresh)
- TTL index on `expiryTime` for automatic cleanup
- Prevents token reuse after logout/refresh

### 2. DTOs (Data Transfer Objects)

#### Request DTOs

**AuthenticationRequest**
```java
- username: String (required)
- password: String (required, min 6 chars)
```
Used in: POST /auth/token

**IntrospectRequest**
```java
- token: String (required)
```
Used in: POST /auth/introspect

**RefreshRequest**
```java
- token: String (required)
```
Used in: POST /auth/refresh

**LogoutRequest**
```java
- token: String (required)
```
Used in: POST /auth/logout

**RoleRequest**
```java
- name: String (required)
- description: String (optional)
- permissions: Set<String> (permission IDs)
```
Used in: POST /roles

**UserCreationRequest**
```java
- username: String (required)
- password: String (required, min 6)
- email: String (required, valid format)
- firstName: String
- lastName: String
```
Used in: POST /users (Admin endpoint)

**UserUpdateRequest**
```java
- password: String (optional)
- email: String (optional)
- firstName: String (optional)
- lastName: String (optional)
- roles: Set<String> (role IDs, optional)
```
Used in: PUT /users/{id} (Admin endpoint)

#### Response DTOs

**AuthenticationResponse**
```java
- token: String (JWT token)
- expiresIn: long (seconds)
```
Returns from: /auth/token, /auth/refresh

**IntrospectResponse**
```java
- valid: boolean
- userId: String (if valid)
- roles: List<String> (user roles)
```
Returns from: /auth/introspect

**RoleResponse**
```java
- id: String
- name: String
- description: String
- permissions: Set<PermissionResponse>
```
Returns from: /roles (GET), POST /roles, etc.

**UserResponse**
```java
- id: String
- username: String
- email: String
- emailVerified: boolean
- roles: Set<RoleResponse>
```
Returns from: /users endpoints

### 3. Services

#### AuthenticationService

**Responsibilities**:
- User authentication (username + password verification)
- JWT token generation and signing
- Token introspection (validation)
- Token refresh (invalidate old, generate new)
- Token logout (add to invalidated list)

**Key Methods**:

1. **authenticate(AuthenticationRequest)**
   - Input: username, password
   - Process:
     - Find user by username
     - Verify password with BCrypt
     - Generate JWT token via generateToken()
   - Output: AuthenticationResponse with token
   - Exceptions: USER_NOT_EXISTED, UNAUTHENTICATED

2. **generateToken(User)**
   - Input: User entity
   - Process:
     - Create JWT header (HS512 algorithm)
     - Create JWT claims:
       - `sub`: User ID
       - `iss`: "devteria.com"
       - `iat`: Issue time
       - `exp`: Expiration (VALID_DURATION seconds from now)
       - `jti`: Unique JWT ID (UUID)
       - `scope`: Built from roles and permissions (see buildScope())
     - Sign with MACSigner using SIGNER_KEY
   - Output: Signed JWT token string
   - Config: Uses `${jwt.signerKey}` and `${jwt.valid-duration}`

3. **introspect(IntrospectRequest)**
   - Input: JWT token
   - Process:
     - Verify token signature with MACVerifier
     - Check expiration time
     - Check if token is in InvalidatedToken collection
   - Output: IntrospectResponse with valid flag and user info
   - Used by: Other services to validate tokens

4. **refreshToken(RefreshRequest)**
   - Input: Refresh token (same as access token)
   - Process:
     - Verify token with extended duration (REFRESHABLE_DURATION)
     - Invalidate old token
     - Fetch user from database
     - Generate new token
   - Output: AuthenticationResponse with new token
   - Config: Uses `${jwt.refreshable-duration}` for extended validity

5. **logout(LogoutRequest)**
   - Input: JWT token
   - Process:
     - Verify token (allow expired tokens)
     - Extract JWT ID (jti)
     - Extract expiration time
     - Add to InvalidatedToken collection with TTL
   - Output: void
   - Side Effect: Token can no longer be used

6. **buildScope(User)**
   - Input: User entity
   - Process:
     - Iterate through roles
     - Add "ROLE_" + roleName to scope
     - Add permission names to scope
   - Output: Space-separated scope string
   - Example: "ROLE_ADMIN ROLE_USER CREATE_POST DELETE_USER"
   - Used in: JWT claims as "scope" field

7. **verifyToken(String, boolean)**
   - Private utility method
   - Input: token, isRefresh flag
   - Process:
     - Parse JWT
     - Verify signature with MACVerifier
     - Check expiration (uses REFRESHABLE_DURATION if isRefresh=true)
     - Check if token is invalidated
   - Output: SignedJWT
   - Exceptions: UNAUTHENTICATED

**Configuration**:
```yaml
jwt:
  signerKey: ${JWT_SIGNER_KEY}  # Secret key for signing (min 32 bytes for HS512)
  valid-duration: 3600          # Token validity in seconds (1 hour)
  refreshable-duration: 604800  # Refresh window in seconds (7 days)
```

**JWT Structure Example**:
```
Header: {
  "alg": "HS512",
  "typ": "JWT"
}

Claims: {
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "iss": "devteria.com",
  "iat": 1700000000,
  "exp": 1700003600,
  "jti": "550e8400-e29b-41d4-a716-446655440001",
  "scope": "ROLE_ADMIN ROLE_USER CREATE_POST DELETE_USER"
}
```

**Cross-Service Integration**:
- Used by: Profile, Product, Order, File services for token validation
- Method: Call `/auth/introspect` with token to validate and extract user info

#### RoleService

**Responsibilities**:
- Role CRUD operations
- Permission assignment to roles
- Admin-only access control

**Key Methods**:

1. **create(RoleRequest)**
   - Input: name, description, permission IDs
   - Process:
     - Map request to Role entity
     - Fetch permissions by IDs
     - Assign permissions to role
     - Save to database
   - Output: RoleResponse
   - Access: @PostAuthorize("hasAuthority('ROLE_ADMIN')")
   - Exceptions: Validation errors

2. **getAll()**
   - Output: List<RoleResponse>
   - Process: Stream and map all roles
   - Access: Public

3. **delete(String name)**
   - Input: Role name
   - Output: void
   - Process: Delete role by ID
   - Access: @PostAuthorize("hasAuthority('ROLE_ADMIN')")

#### UserService

**Responsibilities**:
- User account management
- User creation with Profile Service integration
- User profile updates
- Kafka event publishing for notifications

**Key Methods**:

1. **createUser(UserCreationRequest)**
   - Input: username, password, email, firstName, lastName
   - Process:
     - Create User entity
     - Encode password with BCryptPasswordEncoder
     - Assign default USER_ROLE
     - Save to database
     - **[INTEGRATION]** Call ProfileClient.createProfile() to sync with Profile Service
     - **[INTEGRATION]** Publish NotificationEvent to Kafka for email welcome message
   - Output: UserResponse
   - Exceptions: USER_EXISTED (duplicate username/email)

2. **getMyInfo()**
   - Process:
     - Extract current user from SecurityContextHolder
     - Fetch user from database
   - Output: UserResponse
   - Access: Authenticated users only
   - Security: Each user can only get their own info (enforced by getAuthentication().getName())

3. **updateUser(String userId, UserUpdateRequest)**
   - Input: User ID, updated fields
   - Process:
     - Fetch user
     - Update fields (password re-encoded)
     - Assign new roles
     - Save to database
   - Output: UserResponse
   - Access: @PreAuthorize("hasRole('ADMIN')")

4. **deleteUser(String userId)**
   - Input: User ID
   - Process: Delete user from database
   - Output: void
   - Access: @PreAuthorize("hasRole('ADMIN')")
   - **[TODO]** Should call Profile Service to delete associated profile

5. **getUsers()**
   - Output: List<UserResponse> (all users)
   - Access: @PreAuthorize("hasRole('ADMIN')")

6. **getUser(String id)**
   - Input: User ID
   - Output: UserResponse
   - Access: @PreAuthorize("hasRole('ADMIN')")

**Cross-Service Integration**:
- Calls: ProfileClient.createProfile() when user registers
- Dependency: Profile Service must have internal endpoint `/internal/users`
- Kafka: Publishes notifications for email delivery

### 4. Controllers

#### AuthenticationController

**Base Path**: `/auth`

**Endpoints**:

1. **POST /auth/token**
   - Request: AuthenticationRequest (username, password)
   - Response: ApiResponse<AuthenticationResponse>
   - Process: Calls authenticationService.authenticate()
   - Response Code: 1000 (success), 9401 (unauthenticated)

2. **POST /auth/introspect**
   - Request: IntrospectRequest (token)
   - Response: ApiResponse<IntrospectResponse>
   - Process: Calls authenticationService.introspect()
   - Used by: Other services for token validation

3. **POST /auth/refresh**
   - Request: RefreshRequest (token)
   - Response: ApiResponse<AuthenticationResponse> (new token)
   - Process: Calls authenticationService.refreshToken()

4. **POST /auth/logout**
   - Request: LogoutRequest (token)
   - Response: ApiResponse<Void>
   - Process: Calls authenticationService.logout()
   - Side Effect: Token invalidated

#### RoleController

**Base Path**: `/roles`

**Endpoints**:

1. **POST /roles**
   - Request: RoleRequest (name, description, permissions)
   - Response: ApiResponse<RoleResponse>
   - Access: ROLE_ADMIN only
   - Process: Create new role

2. **GET /roles**
   - Response: ApiResponse<List<RoleResponse>>
   - Process: List all roles
   - Access: Public

3. **DELETE /roles/{role}**
   - Path Param: role (role name)
   - Response: ApiResponse<Void>
   - Access: ROLE_ADMIN only
   - Process: Delete role

#### UserController

**Base Path**: `/users`

**Endpoints**:

1. **POST /users**
   - Request: UserCreationRequest
   - Response: ApiResponse<UserResponse>
   - Access: Public (user registration)
   - Process: Calls userService.createUser()
   - Side Effect: Creates profile in Profile Service, sends welcome email

2. **GET /users/my-info**
   - Response: ApiResponse<UserResponse>
   - Access: Authenticated users
   - Process: Get current user info

3. **PUT /users/{userId}**
   - Path Param: userId
   - Request: UserUpdateRequest
   - Response: ApiResponse<UserResponse>
   - Access: ROLE_ADMIN
   - Process: Update user

4. **DELETE /users/{userId}**
   - Path Param: userId
   - Response: ApiResponse<Void>
   - Access: ROLE_ADMIN
   - Process: Delete user

5. **GET /users**
   - Response: ApiResponse<List<UserResponse>>
   - Access: ROLE_ADMIN
   - Process: List all users

6. **GET /users/{userId}**
   - Path Param: userId
   - Response: ApiResponse<UserResponse>
   - Access: ROLE_ADMIN
   - Process: Get user by ID

#### PermissionController

**Base Path**: `/permissions`

**Endpoints**:

1. **POST /permissions**
   - Request: PermissionRequest
   - Response: ApiResponse<PermissionResponse>
   - Access: ROLE_ADMIN
   - Process: Create permission

2. **GET /permissions**
   - Response: ApiResponse<List<PermissionResponse>>
   - Access: Public
   - Process: List all permissions

3. **DELETE /permissions/{id}**
   - Path Param: id
   - Response: ApiResponse<Void>
   - Access: ROLE_ADMIN
   - Process: Delete permission

### 5. Repositories

**UserRepository**
- Extends: JpaRepository<User, String>
- Custom Methods:
  - `findByUsername(String)`: Find user by username
  - Additional: User JPA's built-in pagination, sorting

**RoleRepository**
- Extends: JpaRepository<Role, String>

**PermissionRepository**
- Extends: JpaRepository<Permission, String>

**InvalidatedTokenRepository**
- Extends: JpaRepository<InvalidatedToken, String>
- TTL Index: `expiryTime` with TTL for automatic cleanup

### 6. Exception Handling

**AppException** (Base custom exception)
```java
- errorCode: ErrorCode (enum)
- message: String
```

**Error Codes** (Defined in ErrorCode enum):
- 1000: SUCCESS
- 9401: UNAUTHENTICATED (invalid credentials, expired token)
- 9403: UNAUTHORIZED (insufficient permissions)
- 4001: USER_EXISTED (duplicate username/email)
- 4004: USER_NOT_EXISTED (user not found)

**Global Exception Handler**: Maps exceptions to ApiResponse with appropriate HTTP status codes

### 7. Configuration

**JWT Configuration** (application.yaml)
```yaml
jwt:
  signerKey: ${JWT_SIGNER_KEY}
  valid-duration: 3600
  refreshable-duration: 604800

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bookteria_identity
    driverClassName: com.mysql.cj.jdbc.Driver
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        format_sql: true
```

**Security Configuration** (SecurityConfiguration)
- Configures Spring Security filters
- Enables JWT token validation
- Sets up @PreAuthorize and @PostAuthorize
- CORS configuration
- HTTP method security

**AuthenticationRequestInterceptor** (Feign Client Configuration)
- Adds JWT token to outgoing requests to other services
- Extracts token from SecurityContextHolder
- Used by: ProfileClient and other Feign clients

### 8. Mappers

**UserMapper** (MapStruct)
- toUser(UserCreationRequest) → User
- toUserResponse(User) → UserResponse
- updateUser(User, UserUpdateRequest) → void

**RoleMapper** (MapStruct)
- toRole(RoleRequest) → Role
- toRoleResponse(Role) → RoleResponse

**ProfileMapper** (MapStruct)
- toProfileCreationRequest(UserCreationRequest) → ProfileCreationRequest

## Database Schema

### User Table
```sql
CREATE TABLE user (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL COLLATE utf8mb4_unicode_ci,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL COLLATE utf8mb4_unicode_ci,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Role Table
```sql
CREATE TABLE role (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Permission Table
```sql
CREATE TABLE permission (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User_Role (Many-to-Many)
```sql
CREATE TABLE user_role (
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);
```

### Role_Permission (Many-to-Many)
```sql
CREATE TABLE role_permission (
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE
);
```

### InvalidatedToken Table
```sql
CREATE TABLE invalidated_token (
  id VARCHAR(36) PRIMARY KEY,
  expiry_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TTL Index for automatic cleanup
ALTER TABLE invalidated_token ADD KEY (expiry_time);
```

## Protocol Buffer Definition

**File**: `identity-service.proto`
```protobuf
package com.devteria.identity.v1;

service IdentityService {
  rpc Authenticate(AuthenticateRequest) returns (AuthenticateResponse);
  rpc Introspect(IntrospectRequest) returns (IntrospectResponse);
  rpc RefreshToken(RefreshRequest) returns (AuthenticateResponse);
  rpc Logout(LogoutRequest) returns (LogoutResponse);
  rpc CreateRole(CreateRoleRequest) returns (RoleResponse);
  rpc GetAllRoles(GetAllRolesRequest) returns (GetAllRolesResponse);
  rpc DeleteRole(DeleteRoleRequest) returns (DeleteRoleResponse);
}

message AuthenticateRequest {
  string user_name = 1;
  string password = 2;
}

message AuthenticateResponse {
  bool is_authenticated = 1;
  string token = 2;
  int64 expires_in = 3;
}

message IntrospectRequest {
  string token = 1;
}

message IntrospectResponse {
  bool valid = 1;
  string user_name = 2;
  repeated string roles = 3;
}

message RefreshRequest {
  string token = 1;
}

message LogoutRequest {
  string token = 1;
}

message LogoutResponse {
  bool success = 1;
}

message CreateRoleRequest {
  string name = 1;
  string description = 2;
}

message RoleResponse {
  string id = 1;
  string name = 2;
  string description = 3;
}

message GetAllRolesRequest {
}

message GetAllRolesResponse {
  repeated RoleResponse roles = 1;
}

message DeleteRoleRequest {
  string name = 1;
}

message DeleteRoleResponse {
  bool success = 1;
}
```

## Cross-Service Integration Points

### 1. Outbound Calls (Identity Service → Other Services)

**Profile Service Integration**:
- **Feign Client**: `ProfileClient`
- **Endpoint Called**: `POST /internal/users`
- **When**: User registration (UserService.createUser())
- **Data Flow**:
  - Identity Service creates User
  - Calls Profile Service to create matching Customer profile
  - Returns profile ID to user
- **Configuration**: 
  ```yaml
  app:
    services:
      profile: http://profile-service:8080
  ```

**Kafka Event Publishing**:
- **Topic**: `notification-delivery`
- **When**: User registration
- **Event**: NotificationEvent with email recipient, subject, body
- **Consumer**: Notification Service

### 2. Inbound Calls (Other Services → Identity Service)

**Token Validation** (used by all other services):
- **Endpoint**: `POST /auth/introspect`
- **Used by**: Profile, Product, Order, File services
- **Purpose**: Validate JWT token and extract user info
- **Required in**: All protected endpoints of other services
- **Implementation Pattern**:
  ```java
  // Other services call:
  @FeignClient("identity-service")
  interface IdentityClient {
    @PostMapping("/auth/introspect")
    ApiResponse<IntrospectResponse> introspect(IntrospectRequest request);
  }
  ```

### 3. Token Flow in Request

```
Client Request (Other Service)
    ↓
[Token in Authorization header]
    ↓
Service Endpoint receives request
    ↓
Extract token from header
    ↓
Call Identity Service /auth/introspect
    ↓
Identity Service validates & returns user info
    ↓
Service proceeds with business logic
    ↓
Response to Client
```

## Security Features

### 1. Authentication
- **Method**: Username + Password
- **Password Storage**: BCrypt encoding (strength 10)
- **Token Type**: JWT with HS512 signature
- **Token Lifetime**: 1 hour (configurable)

### 2. Authorization
- **Method**: Spring Security with @PreAuthorize, @PostAuthorize
- **Role-Based**: ROLE_ADMIN, ROLE_USER, etc.
- **Permission-Based**: Fine-grained permissions
- **Scope**: Embedded in JWT claims for quick access

### 3. Token Invalidation
- **Logout**: Tokens added to InvalidatedToken collection
- **Refresh**: Old token invalidated before new token issued
- **Cleanup**: TTL index on expiryTime for automatic removal

### 4. Feign Client Interceptor
- **AuthenticationRequestInterceptor**
- **Purpose**: Propagate JWT token to inter-service calls
- **Implementation**: Extracts token from SecurityContextHolder, adds to Authorization header

## Testing Strategy

### Unit Tests
- AuthenticationService: Test token generation, verification, buildScope
- RoleService: Test create, getAll, delete with permission assignment
- UserService: Test create with Profile Service mocking, getMyInfo, update

### Integration Tests
- End-to-end authentication flow (login → token → introspect → refresh → logout)
- Role and permission assignment
- User creation with Profile Service call
- Database transactions and rollbacks

### Security Tests
- Invalid credentials rejection
- Token expiration handling
- Refresh window validation
- Token invalidation after logout
- Permission-based endpoint access

## Deployment Checklist

- [ ] JWT_SIGNER_KEY environment variable set (min 32 bytes)
- [ ] MySQL database initialized with schema
- [ ] Predefined roles (USER_ROLE, ADMIN_ROLE) created
- [ ] Profile Service endpoint configured in application.yaml
- [ ] Kafka broker configured for notifications
- [ ] JWT validity and refresh durations tuned
- [ ] CORS settings configured if needed
- [ ] SSL/TLS enabled in production
- [ ] Rate limiting configured for auth endpoints
- [ ] Monitoring and logging configured

## File Structure

```
identity-service/
├── src/main/java/com/devteria/identity/
│   ├── IdentityServiceApplication.java
│   ├── controller/
│   │   ├── AuthenticationController.java
│   │   ├── RoleController.java
│   │   ├── UserController.java
│   │   └── PermissionController.java
│   ├── service/
│   │   ├── AuthenticationService.java
│   │   ├── RoleService.java
│   │   ├── UserService.java
│   │   └── PermissionService.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── Role.java
│   │   ├── Permission.java
│   │   └── InvalidatedToken.java
│   ├── dto/
│   │   ├── request/
│   │   │   ├── AuthenticationRequest.java
│   │   │   ├── IntrospectRequest.java
│   │   │   ├── RefreshRequest.java
│   │   │   ├── LogoutRequest.java
│   │   │   ├── RoleRequest.java
│   │   │   ├── UserCreationRequest.java
│   │   │   ├── UserUpdateRequest.java
│   │   │   ├── PermissionRequest.java
│   │   │   ├── ProfileCreationRequest.java
│   │   │   └── ApiResponse.java
│   │   └── response/
│   │       ├── AuthenticationResponse.java
│   │       ├── IntrospectResponse.java
│   │       ├── RoleResponse.java
│   │       ├── UserResponse.java
│   │       ├── PermissionResponse.java
│   │       └── UserProfileResponse.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── RoleRepository.java
│   │   ├── PermissionRepository.java
│   │   ├── InvalidatedTokenRepository.java
│   │   └── httpclient/
│   │       └── ProfileClient.java (Feign)
│   ├── mapper/
│   │   ├── UserMapper.java
│   │   ├── RoleMapper.java
│   │   └── ProfileMapper.java
│   ├── exception/
│   │   ├── AppException.java
│   │   ├── ErrorCode.java
│   │   └── GlobalExceptionHandler.java
│   ├── configuration/
│   │   ├── SecurityConfiguration.java
│   │   ├── AuthenticationRequestInterceptor.java
│   │   └── FeignClientConfiguration.java
│   ├── constant/
│   │   └── PredefinedRole.java
│   └── validator/
│       └── (Custom validators if needed)
├── src/main/resources/
│   └── application.yaml
├── src/test/java/
│   └── (Test classes)
├── pom.xml
└── README.md
```

## Summary

The Identity Service is a **production-grade authentication and authorization microservice** that:

1. ✅ Handles user registration and authentication
2. ✅ Generates and validates JWT tokens with HS512 signature
3. ✅ Manages token refresh and logout (invalidation)
4. ✅ Implements role-based and permission-based access control
5. ✅ Integrates with Profile Service for user profile creation
6. ✅ Publishes notifications to Kafka
7. ✅ Provides token introspection endpoint for other services
8. ✅ Uses MySQL with JPA for persistent data storage
9. ✅ Includes security interceptor for inter-service JWT propagation
10. ✅ Follows consistent API response format with error handling

It serves as the **central trust authority** for the entire microservices ecosystem, validating requests from all other services and managing user identities and permissions.
