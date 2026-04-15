# Logging Stack: Grafana + Loki + Promtail

## Cấu trúc thư mục

```
docker/
  loki/
    loki-config.yml
  promtail/
    promtail-config.yml
  grafana/
    provisioning/
      datasources/
        loki.yml
docker-compose.yml
```

## Khởi động

```bash
docker-compose up -d loki promtail grafana
```

Truy cập Grafana: http://localhost:3000 (admin/admin)

---

## LogQL Queries cho Grafana Explore

### Xem log real-time tất cả 10 services

```logql
{job="docker-containers"}
```

### Lọc theo từng service

```logql
{service="api-gateway"}
{service="identity-service"}
{service="order-service"}
{service="payment-service"}
{service="product-service"}
{service="user-service"}
{service="notification-service"}
{service="media-service"}
{service="saga-orchestrator"}
{service="discovery-server"}
```

### Chỉ xem ERROR và WARN

```logql
{job="docker-containers"} |= "ERROR" or {job="docker-containers"} |= "WARN"
```

```logql
{job="docker-containers"} | logfmt | level =~ "ERROR|WARN"
```

### Xem Exception của một service cụ thể

```logql
{service="identity-service"} |~ "Exception|Error"
```

### Tìm log theo request ID / trace ID

```logql
{job="docker-containers"} |= "your-trace-id-here"
```

### Đếm số ERROR theo service (dùng cho panel metric)

```logql
sum by (service) (
  count_over_time({job="docker-containers"} |= "ERROR" [5m])
)
```

### Log rate của từng service

```logql
sum by (service) (
  rate({job="docker-containers"}[1m])
)
```

### Tìm slow request (Spring Boot log)

```logql
{job="docker-containers"} |~ "completed in [0-9]{4,}ms"
```

---

## Spring Boot: Thêm cấu hình để log đẹp hơn

Trong `application.yml` mỗi service, thêm:

```yaml
logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [${spring.application.name},%X{traceId},%X{spanId}] %logger{36} - %msg%n"
  level:
    root: INFO
    com.yourpackage: DEBUG
```

Hoặc dùng Logback JSON để Loki parse tốt hơn, thêm dependency:

```xml
<dependency>
  <groupId>net.logstash.logback</groupId>
  <artifactId>logstash-logback-encoder</artifactId>
  <version>7.4</version>
</dependency>
```

---

## Dashboard nhanh trong Grafana

1. Vào **Explore** (icon la bàn bên trái)
2. Chọn datasource **Loki**
3. Dán query vào, bật **Live** (nút góc phải trên) để xem real-time
4. Muốn lưu thành dashboard: click **Add to dashboard**

## Ports

| Service  | Port |
|----------|------|
| Grafana  | 3000 |
| Loki API | 3100 |
| Promtail | 9080 |