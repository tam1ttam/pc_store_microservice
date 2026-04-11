# Build Instructions

## Prerequisites
- Java 21 JDK
- Maven 3.8+
- Docker & Docker Compose (for infrastructure)

## Build Order
Services are standalone projects. Build in this exact order:

### 1. Build proto-common (required by all services)
```powershell
mvn clean install -DskipTests -f proto-common/pom.xml
```

### 2. Build common-lib (required by all services)
```powershell
mvn clean install -DskipTests -f common-lib/pom.xml
```

### 3. Build all services
```powershell
mvn clean install -DskipTests -f identity-service/pom.xml
mvn clean install -DskipTests -f user-service/pom.xml
mvn clean install -DskipTests -f product-service/pom.xml
mvn clean install -DskipTests -f order-service/pom.xml
mvn clean install -DskipTests -f payment-service/pom.xml
mvn clean install -DskipTests -f media-service/pom.xml
mvn clean install -DskipTests -f notification-service/pom.xml
mvn clean install -DskipTests -f saga-orchestrator-service/pom.xml
mvn clean install -DskipTests -f api-gateway/pom.xml
```

## Quick Build All (One Command)
```powershell
mvn clean install -DskipTests -f proto-common/pom.xml; mvn clean install -DskipTests -f common-lib/pom.xml; mvn clean install -DskipTests -f identity-service/pom.xml; mvn clean install -DskipTests -f user-service/pom.xml; mvn clean install -DskipTests -f product-service/pom.xml; mvn clean install -DskipTests -f order-service/pom.xml; mvn clean install -DskipTests -f payment-service/pom.xml; mvn clean install -DskipTests -f media-service/pom.xml; mvn clean install -DskipTests -f notification-service/pom.xml; mvn clean install -DskipTests -f saga-orchestrator-service/pom.xml; mvn clean install -DskipTests -f api-gateway/pom.xml
```

## Docker Infrastructure
```powershell
docker-compose -p iluttmab up -d
```

## Troubleshooting

### Port already in use (gRPC port 6164)
```powershell
netstat -ano | findstr :6164
taskkill /PID <PID> /F
```

### Run with tests
```powershell
mvn clean install -f identity-service/pom.xml
```

### Check Maven local repository
```powershell
dir %USERPROFILE%\.m2\repository\
```
