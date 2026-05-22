# Deploy lên VPS thật — Production

Kế thừa toàn bộ cấu hình từ VMware staging. Chỉ thay đổi những gì khác biệt.

## Thông tin môi trường

- **VPS**: RAM 8GB, 4 CPU, 20GB disk
- **OS**: Ubuntu 22.04
- **Domain thật**: `<your-domain>.com`
- **TLS**: Let's Encrypt tự động qua cert-manager
- **Registry**: GitLab Container Registry (giữ nguyên)
- **GitLab webhook**: có thể dùng (VPS có IP public) — thay SCM polling

---

## Những gì GIỮ NGUYÊN từ VMware

- k3s + ingress-nginx
- Cấu trúc namespace (jenkins, infra, monitoring, app, web)
- Custom Jenkins image (Docker CLI + kubectl + Maven)
- Jenkinsfile smart change detection
- Maven cache PVC
- GitHub Actions → GitLab mirror
- K8s manifests `k8s/app/` (10 services)
- K8s manifests `k8s/infra/` (5 services) — chỉ đổi password
- ConfigMap pattern — chỉ đổi URLs/domain
- Secret pattern — chỉ đổi passwords

---

## TODO theo thứ tự

### Phase 1 — Cài k3s + tooling (giống VMware)

> **Lưu ý:**
> - `kubectl` mặc định chỉ chạy được với `sudo`. Thêm user vào sudoers NOPASSWD cho kubectl hoặc dùng `sudo -S kubectl` (cần pipe password).
> - k3s cài sẵn cả **traefik** lẫn **nginx** ingress controller — dùng `ingressClassName: nginx` để chỉ định đúng, tránh nhầm.

- [ ] SSH vào VPS, cài k3s:
  ```bash
  curl -sfL https://get.k3s.io | sh -
  mkdir -p ~/.kube && cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
  ```
- [ ] Cài nginx Ingress controller
- [ ] Tạo namespaces (jenkins, infra, monitoring, app, web)
- [ ] Tạo `imagePullSecret` gitlab-registry cho 4 namespace
- [ ] Cài Docker trên host + fix socket permission (GID 999)

### Phase 2 — Deploy Jenkins (giống VMware)

- [ ] Apply `k8s/jenkins/` manifests (deployment, pvc, maven-cache-pvc, service)
- [ ] Vào Jenkins UI, cài plugin, thêm 3 credential:
  - `gitlab-credentials` — PAT clone repo
  - `gitlab-registry-credentials` — deploy token push image
  - `kubeconfig` — k3s kubeconfig
- [ ] Tạo Pipeline job, branch `*/prod`, Script Path `BE/Jenkinsfile`
- [ ] **Đổi Poll SCM → GitLab webhook** (VPS có IP public):
  - Jenkins: cài **GitLab Plugin**, bật `Build when a change is pushed to GitLab`
  - GitLab: Settings → Webhooks → URL `http://<VPS_IP>:30080/project/pc-store-microservice`

### Phase 3 — cert-manager + TLS *(mới so với VMware)*

- [ ] Cài cert-manager:
  ```bash
  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
  ```
- [ ] Tạo `k8s/base/cluster-issuer.yaml`:
  ```yaml
  apiVersion: cert-manager.io/v1
  kind: ClusterIssuer
  metadata:
    name: letsencrypt-prod
  spec:
    acme:
      server: https://acme-v02.api.letsencrypt.org/directory
      email: <your-email>
      privateKeySecretRef:
        name: letsencrypt-prod
      solvers:
        - http01:
            ingress:
              class: nginx
  ```
- [ ] Apply: `kubectl apply -f k8s/base/cluster-issuer.yaml`

### Phase 4 — Infra namespace *(đổi password)*

> **Lưu ý:**
> - **MySQL không tự tạo database cho app.** Sau khi MySQL pod `1/1 Running`, phải chạy thủ công:
>   ```bash
>   kubectl exec -n infra mysql-0 -- mysql -u root -p<MYSQL_PASS> \
>     -e "CREATE DATABASE IF NOT EXISTS identityservice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
>   ```
>   Nếu quên → identity-service crash với `Unknown database 'identityservice'`.
> - **Kafka topic `audit.action` không tự tạo** — identity-service sẽ log WARN liên tục nhưng không crash, bỏ qua được.
> - Đợi tất cả infra pod `1/1 Running` trước khi qua Phase 5/6, đặc biệt MongoDB và MySQL.

Giữ nguyên `k8s/infra/*.yaml`, chỉ đổi passwords trước khi apply:

- [ ] `mongodb.yaml`: đổi `MONGO_INITDB_ROOT_PASSWORD` → password mạnh
- [ ] `mysql.yaml`: đổi `MYSQL_ROOT_PASSWORD` → password mạnh
- [ ] Apply: `kubectl apply -f k8s/infra/ -n infra`
- [ ] Verify: `kubectl get pods -n infra`

### Phase 5 — Secrets + ConfigMap *(đổi domain + passwords)*

- [ ] Tạo `k8s/base/secret.yaml` trên VPS với passwords mới (khớp với infra Phase 4):
  ```bash
  # Thay mongo123 → <MONGO_PASS_MẠNH>, mysql123 → <MYSQL_PASS_MẠNH>
  kubectl apply -f k8s/base/secret.yaml
  ```
- [ ] Cập nhật `k8s/base/configmap.yaml` — đổi 3 dòng:
  ```yaml
  EUREKA_URI: "http://discovery-service.app.svc.cluster.local:6059/eureka/"
  CORS_ALLOWED_ORIGINS: "https://<your-domain>.com"
  ALLOWED_ORIGINS: "https://<your-domain>.com"
  ```
- [ ] Apply: `kubectl apply -f k8s/base/configmap.yaml`

### Phase 6 — App namespace

> **Lưu ý — quan trọng nhất, tốn thời gian nhất:**
>
> **1. KHÔNG apply all + scale up đồng thời trên server RAM thấp (≤8GB)**
> 10 JVM start cùng lúc = ~4GB heap + overhead → OOM kill liên hoàn. Làm theo thứ tự:
> ```bash
> kubectl apply -f k8s/app/           # apply manifests
> kubectl scale deployment -n app --replicas=0 --all   # tắt hết ngay
> # đợi tất cả terminate
> # scale từng cái một, đợi 1/1 Running rồi mới làm cái tiếp theo:
> kubectl scale deployment discovery-service -n app --replicas=1
> kubectl rollout status deployment/discovery-service -n app
> kubectl scale deployment identity-service -n app --replicas=1
> kubectl rollout status deployment/identity-service -n app
> # ... tiếp tục cho 8 service còn lại
> ```
>
> **2. Thứ tự scale up khuyến nghị** (dependency-aware):
> discovery-service → identity-service → user-service → product-service → order-service → notification-service → saga-orchestrator-service → file-service → chat-service → api-gateway
>
> **3. Tất cả probe là TCP socket** (đã có trong YAML) — KHÔNG đổi sang HTTP GET:
> - Services có `context-path` (identity, user, product, order, chat, file, notification, saga): Spring Security block `/actuator/health` với 401 dù đã thêm vào PUBLIC_GET — đây là behavior của Spring Security 6 + MvcRequestMatcher.
> - api-gateway (Spring Cloud Gateway/WebFlux): gateway intercept `/actuator/health` → 404.
> - TCP socket check port open là đủ và không bao giờ bị auth block.
>
> **4. Credentials mặc định admin:** `admin` / `123123123` (xem `ApplicationInitConfig.java`)
>
> **5. Sau reboot hoặc disk đầy → Eviction cascade:**
> Nếu thấy hàng chục pod `Evicted` trong `kubectl get pods -n app`, đây là dấu hiệu disk pressure hoặc memory pressure. Xử lý:
> ```bash
> # Dọn disk trước
> docker system prune -af --volumes
> # Xóa evicted pods (không tự dọn)
> kubectl delete pods --field-selector=status.phase=Failed -n app
> kubectl get pods -n app --no-headers | awk '$3=="ContainerStatusUnknown"{print $1}' | xargs -r kubectl delete pod --force --grace-period=0 -n app
> # Scale lại từng cái một như bước 1
> ```

- [ ] Apply: `kubectl apply -f k8s/app/`
- [ ] Scale down all ngay sau apply (xem lưu ý trên)
- [ ] Tạo MySQL database trước khi scale identity-service (xem Phase 4)
- [ ] Scale từng service một, theo dõi `kubectl rollout status`
- [ ] Verify: `kubectl get pods -n app`

### Phase 7 — Ingress với TLS *(mới so với VMware)*

> **Lưu ý:**
>
> **1. k3s cài sẵn Traefik → nginx-ingress LoadBalancer bị Pending mãi mãi**
> Traefik chiếm port 80 trên node. `svclb-ingress-nginx-controller` sẽ không bao giờ lấy được port → Pending.
> Giải pháp cho production: cài k3s **không có Traefik** ngay từ đầu:
> ```bash
> curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik" sh -
> ```
> Nếu đã cài rồi: `kubectl delete helmchart traefik -n kube-system` rồi mới dùng nginx-ingress.
>
> **2. `/api` prefix cần Strip trước khi vào api-gateway**
> api-gateway đăng ký routes dạng `/api-gateway/...` — nếu request vào với path `/api/something`, api-gateway không match.
> - **Nginx-ingress**: dùng annotation `nginx.ingress.kubernetes.io/rewrite-target: /$2` + path regex.
> - **Traefik** (nếu giữ): dùng Middleware CRD `stripPrefix: ["/api"]` và annotation `traefik.ingress.kubernetes.io/router.middlewares: app-strip-api-prefix@kubernetescrd`.
>
> **3. Socket.IO cần sticky session + timeout dài — thiếu sẽ disconnect liên tục:**
> ```yaml
> nginx.ingress.kubernetes.io/affinity: "cookie"
> nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
> nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
> ```
> Path `/socket.io` trỏ sang port **8099** (không phải 8085 HTTP port).
>
> **4. cert-manager cần vài phút để issue cert lần đầu** — đợi `kubectl get certificate -n app` hiển thị `READY=True` trước khi test HTTPS.

- [ ] Tạo `k8s/ingress/app-ingress.yaml`:
  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: app-ingress
    namespace: app
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
      nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
      nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
      nginx.ingress.kubernetes.io/affinity: cookie
  spec:
    ingressClassName: nginx
    tls:
      - hosts:
          - <your-domain>.com
        secretName: app-tls
    rules:
      - host: <your-domain>.com
        http:
          paths:
            - path: /api
              pathType: Prefix
              backend:
                service:
                  name: api-gateway
                  port:
                    number: 6060
            - path: /socket.io
              pathType: Prefix
              backend:
                service:
                  name: chat-service
                  port:
                    number: 8099
            - path: /grafana
              pathType: Prefix
              backend:
                service:
                  name: grafana
                  port:
                    number: 3000
  ```
- [ ] Apply: `kubectl apply -f k8s/ingress/ -n app`
- [ ] Verify TLS: `curl https://<your-domain>.com/api/actuator/health`

### Phase 8 — Frontend namespace `web`

> **Lưu ý:**
>
> **1. API URL được bundle cứng vào JS lúc build** — phải set đúng trong `.env.production` trước khi trigger Jenkins:
> ```
> VITE_API_URL=https://<your-domain>.com/api
> VITE_SOCKET_URL=https://<your-domain>.com
> ```
> Sau khi `vite build` xong không thể đổi runtime.
>
> **2. nginx.conf phải có `try_files`** — thiếu dòng này mọi URL trừ `/` trả 404 khi F5:
> ```nginx
> location / {
>     try_files $uri $uri/ /index.html;
> }
> ```
>
> **3. Build script phải là `"build": "vite build"`** — KHÔNG phải `tsc -b && vite build`.
> TypeScript strict errors sẽ block CI build (field name mismatch, TS18046 unknown type...). Vite build bỏ qua type errors.
>
> **4. Docker FE build ngốn ~2GB disk mỗi app** (node_modules layer) — disk dễ đầy:
> ```bash
> # Chạy trước khi trigger FE build
> docker system prune -af
> ```
> Nếu disk đầy giữa chừng, Jenkins build sẽ fail với exit -1 (không phải lỗi code). Re-trigger build sau khi dọn disk.
>
> **5. Jenkins restart giữa Docker build = build fail** với `exit code -1` — build tiếp theo sẽ phát hiện không có thay đổi mới (same commit) và bỏ qua FE stages. Cần trigger thủ công:
> ```bash
> CRUMB=$(curl -s -c /tmp/c.txt -u admin:<pass> 'http://localhost:30080/crumbIssuer/api/json' | python3 -c "import sys,json; print(json.load(sys.stdin)['crumb'])")
> curl -s -b /tmp/c.txt -u admin:<pass> -X POST "http://localhost:30080/job/pc-store-microservice/build" -H "Jenkins-Crumb: $CRUMB"
> ```
>
> **6. 3 app là project độc lập** — build riêng từng cái, không dùng chung `node_modules`.

- [ ] Viết Dockerfile cho mỗi app (`UI/client`, `UI/manager`, `UI/admin`):
  ```dockerfile
  FROM node:20-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM nginx:alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  ```
- [ ] Cập nhật API base URL: `https://<your-domain>.com/api`
- [ ] Thêm build FE vào Jenkinsfile (sau stage Deploy services)
- [ ] Tạo `k8s/web/` — Deployment + ClusterIP + Ingress cho `client`, `manager`, `admin`
- [ ] Ingress web:
  ```yaml
  - path: /           → web/client:80
  - path: /manager    → web/manager:80
  - path: /admin      → web/admin:80
  ```

### Phase 9 — Monitoring namespace

> **Lưu ý:**
>
> **1. Loki crash ngay khi start: `permission denied` tạo WAL**
> Loki 2.9.x mặc định viết WAL vào `/wal` (root filesystem read-only) → crash liên tục.
> **Bắt buộc** thêm vào config trước khi apply:
> ```yaml
> ingester:
>   wal:
>     enabled: true
>     dir: /loki/wal   # phải nằm trong PVC mount (/loki)
> ```
>
> **2. Grafana cần 3 env để hoạt động đúng sau sub-path `/grafana`:**
> ```yaml
> GF_SECURITY_ALLOW_EMBEDDING: "true"          # cho phép embed iframe trong Admin UI
> GF_SERVER_ROOT_URL: "https://<domain>/grafana"  # asset load đúng path
> GF_SERVER_SERVE_FROM_SUB_PATH: "true"          # thiếu cái này → redirect loop
> ```
> Thiếu `GF_SERVER_SERVE_FROM_SUB_PATH` → Grafana redirect vô hạn tại `/grafana/login`.
>
> **3. Deploy từng component một** — RAM VPS thấp, kéo image + start đồng thời dễ OOM:
> ```bash
> kubectl apply -f k8s/monitoring/zipkin.yaml  && kubectl rollout status deployment/zipkin -n monitoring
> kubectl apply -f k8s/monitoring/loki.yaml    && kubectl rollout status deployment/loki -n monitoring
> kubectl apply -f k8s/monitoring/promtail.yaml
> kubectl apply -f k8s/monitoring/grafana.yaml && kubectl rollout status deployment/grafana -n monitoring
> ```
>
> **4. Grafana Ingress đặt trong namespace `monitoring`** (không phải `app`) — Traefik và nginx-ingress đều đọc ingress cross-namespace.
>
> **5. Promtail log chỉ có raw text** cho đến khi BE thêm `logstash-logback-encoder` (Phase 10) — `json:` stage trong pipeline sẽ fail silently cho non-JSON lines, không gây lỗi.

- [ ] Apply `k8s/monitoring/zipkin.yaml`
- [ ] Apply `k8s/monitoring/loki.yaml` (nhớ thêm `wal.dir`)
- [ ] Apply `k8s/monitoring/promtail.yaml`
- [ ] Apply `k8s/monitoring/grafana.yaml` (nhớ `SERVE_FROM_SUB_PATH`)
- [ ] Verify: 4 pod `1/1 Running`, `curl -I https://<domain>/grafana` trả 302

### Phase 10 — Vận hành

> **Lưu ý:**
> - HPA cần **metrics-server** — k3s có sẵn, nhưng verify: `kubectl top nodes`. Nếu không có → cài: `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`
> - Sau reboot VPS, 10 JVM sẽ start đồng thời → OOM nếu RAM thấp. Giải pháp: thêm script `/etc/rc.local` hoặc systemd service scale up tuần tự sau khi k3s ready.

- [ ] **HPA** cho api-gateway + identity-service:
  ```bash
  kubectl autoscale deployment api-gateway -n app --cpu-percent=70 --min=1 --max=3
  kubectl autoscale deployment identity-service -n app --cpu-percent=70 --min=1 --max=3
  ```
- [ ] **Backup** MongoDB + MySQL (CronJob K8s hoặc VPS cron)
- [ ] Kiểm tra `kubectl get pods -A` — tất cả `1/1 Running`
- [ ] Test chat real-time qua WebSocket
- [ ] Theo dõi Grafana 30 phút, không có OOMKilled

---

## Checklist trước khi go-live

- [ ] Tất cả pod `1/1 Running` (`kubectl get pods -A`)
- [ ] HTTPS hoạt động, cert Let's Encrypt hợp lệ
- [ ] API gateway trả về 200 (`curl https://<domain>/api/actuator/health`)
- [ ] Chat real-time hoạt động (Socket.IO qua Ingress)
- [ ] CI/CD tự động khi push code (test bằng 1 commit nhỏ)
- [ ] Grafana accessible tại `/grafana`
- [ ] Không OOMKilled sau 30 phút
- [ ] Backup đã cấu hình

---

## So sánh nhanh VMware vs Production

| | VMware | Production |
|---|---|---|
| Domain | nip.io (IP giả) | Domain thật |
| TLS | Không | Let's Encrypt |
| Passwords | mongo123, mysql123 | Password mạnh |
| Jenkins trigger | Poll SCM 1 phút | GitLab webhook |
| Image tag deploy | latest (lần đầu) | commit hash |
| HPA | Không | Có |
| Backup | Không | Có |
