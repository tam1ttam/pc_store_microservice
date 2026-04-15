## Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build
COPY . .
RUN mvn clean package -DskipTests -q

## Stage 2: Runtime
FROM eclipse-temurin:21-jre-jammy
VOLUME /tmp
WORKDIR /app

COPY --from=builder /build/target/api-gateway-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080 6060

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]