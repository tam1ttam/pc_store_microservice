# 📋 Kiểm Tra Logging Stack: Grafana + Loki + Promtail

**Ngày kiểm tra:** 11/04/2026  
**Trạng thái:** ⚠️ **CÓ NHỮNG VẤN ĐỀ CẦN FIX**

---

## 1. ✅ YÊU CẦU CHUNG

| Yêu cầu | Trạng thái | Ghi chú |
|---------|-----------|---------|
| Loki container | ✅ | Cấu hình đúng, port 3100 |
| Promtail container | ✅ | Cấu hình đúng, port 9080 |
| Grafana container | ✅ | Cấu hình đúng, port 3000 |
| Health checks | ✅ | Loki, Grafana có health check |
| Network | ✅ | Tất cả trên `ecommerce-network` |
| Volumes | ✅ | Persistent storage được setup |

---

## 2. ⚠️ VẤN ĐỀ PHÁT HIỆN

### **2.1. Promtail Config - Vấn đề về __path__**

**Vị trí:** `docker/promtail/promtail-config.yml`

**Vấn đề:**
```yaml
# ❌ WRONG - có 2 __path__ config, config thứ 2 sẽ override config thứ 1
- source_labels: ["__meta_docker_container_id"]
  target_label: "__path__"
  replacement: "/var/lib/docker/containers/$1/*.log"

- source_labels: ["__meta_docker_container_id"]
  target_label: "__path__"   # ← Này sẽ override phần trên
```

**Impact:** Log path không được set đúng, Promtail không thể đọc logs từ containers.

**Fix:** Xóa config __path__ thứ 2

---

### **2.2. Promtail - Docker Socket Path (Windows Issue)**

**Vấn đề:** `docker-compose.yml` mount Docker socket Linux:
```yaml
promtail:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - /var/lib/docker/containers:/var/lib/docker/containers:ro
```

**Điều này KHÔNG HOẠT ĐỘNG trên:**
- ❌ Windows (WSL2 cần cấu hình khác)
- ❌ Docker Desktop for Mac (khác path)

**Fix:** Cần platform-specific volumes hoặc sử dụng Loki JSON plugin

---

### **2.3. Logging Config - Services CHƯA Config**

**Vấn đề:** Không tìm thấy `logging` section trong `application.yml`

**Services kiểm tra:**
- api-gateway: ❌ KHÔNG BẮNG LOG Config
- user-service: ❌ KHÔNG CÓ LOG Config (chỉ có: `logging.level.org.springframework.security: DEBUG`)

**Cần thêm:**
```yaml
logging:
  level:
    root: INFO
    com.tam: DEBUG
  pattern:
    console: "%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/app.log
    max-size: 10MB
    max-history: 10
```

---

### **2.4. Promtail Pipeline - Regex Không Tối Ưu**

**Vấn đề:** Regex cho `level` và `exception` không strict:

```yaml
# ❌ Regex này quá thoáng - sẽ match mọi log có chứa LOG_LEVEL_STRING
- regex:
    expression: '.*(?P<level>TRACE|DEBUG|INFO|WARN|ERROR|FATAL).*'

# ❌ Cần phải chỉ định pattern cho Spring Boot logs
```

**Recommendation:** Thêm stage riêng cho JSON parsing:
```yaml
- json:
    expressions:
      level: level
      message: message
      timestamp: timestamp
```

---

### **3.5. Loki Config - Retention Policy Quá Ngắn**

**Vị trí:** `docker/loki/loki-config.yml`

**Vấn đề:**
```yaml
# Chỉ giữ 7 ngày log
table_manager:
  retention_deletes_enabled: true
  retention_period: 168h  # ← 7 ngày
```

**Recommendation:** 
- Dev: 7 ngày OK
- Production: 30 ngày

---

### **3.6. Grafana Datasource - Thiếu Tracing Integration**

**Vị trí:** `docker/grafana/provisioning/datasources/loki.yml`

**Vấn đề:** Chưa config Zipkin/Jaeger tracing integration

**Cần thêm:**
```yaml
# Để integrate với Zipkin for distributed tracing
derivedFields:
  - name: TraceID
    matcherRegex: "traceId=([\\w-]+)"
    url: "http://zipkin:9411/zipkin/traces/$${__value.raw}"
    datasourceUid: zipkin-uid
```

---

## 3. 🔍 SERVICES KIỂM TRA CHI TIẾT

### **3.1. 10 Services được hỗ trợ:**

| Service | Spring Boot Ver | Dockerfile | Logging Config | Status |
|---------|-----------------|-----------|--------|--------|
| api-gateway | 3.4.4 | ✅ | ⚠️ Chỉ basic | ⚠️ |
| identity-service | ? | ❓ | ❓ | ❓ |
| user-service | 3.2.5 | ✅ | ✅ Basic | ✅ |
| product-service | ? | ❓ | ❓ | ❓ |
| order-service | ? | ❓ | ❓ | ❓ |
| payment-service | ? | ❓ | ❓ | ❓ |
| notification-service | ? | ❓ | ❓ | ❓ |
| media-service | ? | ❓ | ❓ | ❓ |
| saga-orchestrator-service | ? | ❓ | ❓ | ❓ |
| discovery-service | ? | ✅ | ❓ | ❓ |

**❓ = Cần kiểm tra chi tiết**

---

## 4. ✅ CHECKLIST FIX CẦN LÀM

### **Priority 1 (CRITICAL):**
- [ ] Fix `__path__` conflict trong Promtail config (xóa config thứ 2)
- [ ] Thêm logging config cho tất cả services
- [ ] Test Promtail container start thành công
- [ ] Verify Loki nhận được logs từ các services

### **Priority 2 (HIGH):**
- [ ] Upgrade Promtail pipeline với JSON parsing
- [ ] Add Zipkin/Jaeger tracing datasource
- [ ] Add health check cho Promtail container
- [ ] Setup Docker volume mounting cho multi-platform (Windows/Linux/Mac)

### **Priority 3 (MEDIUM):**
- [ ] Tối ưu Grafana dashboards
- [ ] Add alerting rules
- [ ] Tăng retention period lên 30 ngày
- [ ] Setup log level configs cho từng service

---

## 5. 🧪 TEST STEPS

Sau khi fix:

```bash
# 1. Start services
docker-compose up -d

# 2. Check Loki ready
curl http://localhost:3100/ready

# 3. Check Promtail logs
docker logs promtail

# 4. Query logs from Loki (via Grafana)
# Explore > Logs > Select datasource Loki
# Query: {job="docker-containers"}

# 5. Verify each service logs appear
# Filter by: {service="api-gateway"}
# Filter by: {service="user-service"}
# etc.
```

---

## 6. 📊 EXPECTED OUTPUT

Khi setup đúng, bạn sẽ thấy:

1. **Grafana** (http://localhost:3000)
   - ✅ Datasource Loki connected
   - ✅ Can query logs by service
   - ✅ See all 10 services in logs

2. **Loki** (http://localhost:3100)
   - ✅ Receiving logs from all services
   - ✅ Query examples: `{service="api-gateway"}` returns logs

3. **Promtail** (stdout logs)
   - ✅ Connected to Loki
   - ✅ Scraping all containers on network
   - ✅ No connection errors

---

## 7. 📝 NEXT STEPS

1. **Immediately fix Priority 1 issues**
2. **Test logging works for all 10 services**
3. **Implement Priority 2 improvements**
4. **Setup proper alerting & dashboards**
5. **Document in README_LOGGING.md**

---

**Status Update:** Ready to implement fixes ✅
