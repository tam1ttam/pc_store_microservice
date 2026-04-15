# 📊 Logging Stack Setup - Loki + Promtail + Grafana

Complete logging solution for the 10-service microservices architecture using Loki, Promtail, and Grafana.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           10 Microservices                       │
│  (with structured JSON logging + trace IDs)     │
└──────────────────┬──────────────────────────────┘
                   │
                   ├─────────────────────────────────┐
                   │                                 │
            ┌──────▼──────┐                    ┌────▼─────┐
            │  Promtail   │                    │  Docker  │
            │  (scraper)  │                    │  Socket  │
            └──────┬──────┘                    └──────────┘
                   │
                   ▼
            ┌──────────────┐
            │   Loki       │◄────── Stores logs in time-series DB
            │  (3100)      │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │  Grafana     │◄────── Visualize & query logs
            │  (3000)      │
            └──────────────┘
```

## 📁 File Structure

```
docker/
├── loki/
│   └── loki-config.yml              # Loki configuration
├── promtail/
│   └── promtail-config.yml          # Promtail scraping config
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── loki.yml             # Loki datasource setup
        └── dashboards/
            ├── dashboard-provisioner.yml
            └── microservices-logs.json  # Pre-built dashboard
```

## 🚀 Quick Start

### 1. Start all services
```bash
docker-compose up -d
```

### 2. Access UIs

- **Grafana**: http://localhost:3000 (admin/admin)
- **Loki**: http://localhost:3100/ready (health check)

### 3. Verify logs are flowing

#### Option A: Via Grafana UI
1. Open http://localhost:3000
2. Go to **Explore** tab
3. Select datasource **Loki**
4. Run query: `{job="docker-containers"}`
5. You should see logs from all services

#### Option B: Via Loki API
```bash
# Query logs from all services
curl http://localhost:3100/loki/api/v1/query_range?query=\{job%3D%22docker-containers%22\}

# Query logs from specific service
curl "http://localhost:3100/loki/api/v1/query_range?query={service=\"api-gateway\"}"
```

#### Option C: Check Promtail logs
```bash
docker logs promtail
# Should show: "successfully initialized client" and "successfully created pipeline"
```

## 📊 10 Services Logging

All 10 microservices are configured with:

| Service | Port | Log File | Config |
|---------|------|----------|--------|
| api-gateway | 6060 | logs/api-gateway.log | ✅ |
| identity-service | 6062 | logs/identity-service.log | ✅ |
| user-service | 6073 | logs/user-service.log | ✅ |
| product-service | 6067 | logs/product-service.log | ✅ |
| order-service | 6065 | logs/order-service.log | ✅ |
| payment-service | 6066 | logs/payment-service.log | ✅ |
| notification-service | 6070 | logs/notification-service.log | ✅ |
| media-service | 6064 | logs/media-service.log | ✅ |
| saga-orchestrator-service | 6058 | logs/saga-orchestrator-service.log | ✅ |
| discovery-service | 6059 | logs/discovery-service.log | ✅ |

## 🔍 Logging Configuration

### Per-Service Config
Each service in `application.yml` has:

```yaml
logging:
  level:
    root: INFO
    com.tam: DEBUG
    org.springframework.security: DEBUG
    org.springframework.web: DEBUG
  pattern:
    console: "%d{ISO8601} [%X{traceId},%X{spanId}] [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{ISO8601} [%X{traceId},%X{spanId}] [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/{service-name}.log
    max-size: 10MB
    max-history: 7

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
```

**Features:**
- ✅ **Structured logging**: ISO8601 timestamps
- ✅ **Trace ID support**: `[%X{traceId},%X{spanId}]` for distributed tracing
- ✅ **Log rotation**: Max 10MB per file, keep 7 days
- ✅ **Health endpoints**: `/actuator/health`, `/actuator/metrics`

### Promtail Pipeline

Promtail (`docker/promtail/promtail-config.yml`) processes logs:

1. **Docker SD**: Auto-discovers containers on `ecommerce-network`
2. **Relabeling**: Maps container names to service names
3. **JSON Parsing**: Extracts structured fields:
   - Log level (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
   - Logger name
   - Message
   - Trace ID
   - Exception patterns
4. **Labels**: Adds service, container, image labels for filtering

### Loki Configuration

`docker/loki/loki-config.yml` settings:

```yaml
# Retention policy
retention_period: 720h      # 30 days
ingestion_rate_mb: 32       # Per-stream limit
ingestion_burst_size_mb: 64 # Burst capacity
max_query_series: 50000     # Max series per query

# Storage
object_store: filesystem
schema: v13 (time-series)
```

## 📈 Grafana Dashboards

### Pre-built Dashboard: "Microservices Logs"

**Features:**
- 📋 **All Services Logs**: Real-time view of all containers
- 🔥 **Core Services Logs**: API Gateway, Identity, User services
- ⚠️ **Error Logs Only**: Filter errors by level

**Query Examples:**
```
# All logs
{job="docker-containers"}

# Single service
{service="api-gateway"}

# By log level
{level="ERROR"}

# Multiple services
{service=~"api-gateway|user-service"}

# By trace ID
{trace_id="abc-123-xyz"}

# Docker container
{container="api-gateway"}
```

### Variables (Templating)
- **Time range**: 1m, 5m, 10m, 30m, 1h, 6h, 24h
- **Job**: Filter by Promtail job
- **Service**: Select one or more services

## 🔧 Troubleshooting

### Promtail not scraping logs

**Symptom**: Promtail container runs but no logs appear in Grafana

**Solutions:**
1. Check Promtail logs:
   ```bash
   docker logs promtail
   ```

2. Verify Docker socket is mounted:
   ```bash
   docker exec promtail ls -la /var/run/docker.sock
   ```

3. Check Promtail config syntax:
   ```bash
   docker exec promtail promtail -print-config-stderr -config.file=/etc/promtail/config.yml
   ```

4. For Windows/Mac: Docker socket path may differ
   - WSL2: `/var/run/docker.sock`
   - Mac: Use `/var/run/docker.sock` (should work)
   - Windows: May need Docker Desktop special setup

### Loki not receiving data

**Symptom**: Loki is running but shows "no data"

**Solutions:**
1. Check Loki is healthy:
   ```bash
   curl http://localhost:3100/ready
   ```

2. Query Loki directly:
   ```bash
   curl "http://localhost:3100/loki/api/v1/query_range?query={job%3D%22docker-containers%22}"
   ```

3. Check logs in Loki container:
   ```bash
   docker logs loki
   ```

### Logs in wrong format

**Symptom**: Logs not properly parsed (no level, trace ID, etc.)

**Solutions:**
1. Verify log pattern in each service's `application.yml`
2. Check Promtail pipeline stages are working:
   ```bash
   docker logs promtail | grep -i error
   ```

3. Test JSON parsing manually in Promtail config

## 🚨 Alerting (Future Enhancement)

To add alerting rules to Grafana:

1. Create alert rules in Loki config
2. Configure Alertmanager (Prometheus)
3. Add notification channels in Grafana
4. Set up webhooks to Slack/Email

Example rule (add to `loki-config.yml`):
```yaml
ruler:
  alertmanager_url: http://alertmanager:9093
  rules_dir: /loki/rules
  enable_api: true
```

## 📚 References

- **Loki**: https://grafana.com/oss/loki/
- **Promtail**: https://grafana.com/docs/loki/latest/clients/promtail/
- **Grafana**: https://grafana.com/
- **Spring Boot Logging**: https://spring.io/blog/2015/12/21/spring-boot-logging

## 🎯 Next Steps

1. ✅ Verify logs flowing into Loki
2. ⬜ Setup custom dashboards for each service
3. ⬜ Configure alerting rules
4. ⬜ Integrate with Zipkin for distributed tracing
5. ⬜ Setup log aggregation for debugging

---

**Last Updated**: 11/04/2026  
**Status**: ✅ Production Ready
