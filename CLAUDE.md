# PC Store — Project Overview

## Tổng quan kiến trúc

Hệ thống e-commerce bán PC/linh kiện, gồm **microservices Spring Boot** ở backend và **3 React app** ở frontend.

## Quy tắc code
- Ko được để xuất hiện ký tự BOM (\ueff) ở đầu mỗi file, làm sao để inteliji idea chạy được
- Khi sửa gì và phát hiện có bug gì hay tôi gửi những lỗi gì (chưa fix đc), hãy ghi thêm vào đây, còn bug/lỗi đã fix thì xóa khỏi file này
# FE
- Tận dụng component tối đa nhất có thể
- State chuẩn
- Bỏ những component thừa

# BE
- Ko hardcode trong logic
- Các biến final cần khai trong .yaml, hoặc
- Khi code thì ưu tiên tái sử dụng biến
- Ko phá cấu trúc hiện tại của BE

### Backend (`BE/`)

| Service | Port HTTP | Port gRPC | DB |
|---|---|---|---|
| api-gateway | 6060 | — | — |
| discovery-service | 6059 | — | — |
| identity-service | 6062 | — | MySQL |
| user-service | 6063 | 6163 | MongoDB |
| product-service | 6067 | 6167 | MongoDB + Elasticsearch |
| order-service | 6065 | 6165 | MongoDB |
| chat-service | 8085 | — | MongoDB (Socket.IO port 8099) |
| file-service | 8084 | 8184 | MongoDB + S3 + Gemini |
| notification-service | 6068 | — | MongoDB |
| saga-orchestrator | 6058 | 6158 | — |

Infrastructure (Docker): MongoDB `:6000`, MySQL `:6001`, Redis `:6002`, Kafka `:9094`, Elasticsearch `:9200`, Zipkin `:9411`, Grafana `:3000`

Cấu hình môi trường đặt tại `BE/.env` — Spring Boot **không tự đọc .env**, phải dùng IntelliJ EnvFile plugin hoặc export thủ công trước khi chạy.

### Frontend (`UI/`)

| App | Port | Mục đích |
|---|---|---|
| `UI/client` | 3000 | Giao diện khách hàng |
| `UI/manager` | 3004 | Giao diện quản lý/seller |
| `UI/admin` | 3003 | Giao diện system admin |

Stack: React 18 + TypeScript + Vite + Redux Toolkit + Tailwind CSS + Radix UI + Socket.IO client

---

## Quy tắc bắt buộc

### Backend
- Mọi thay đổi entity MongoDB phải kiểm tra index (`@Indexed`) — đặc biệt `participantsHash` trên `Conversation` là `unique`.
- Không thêm field mới vào entity mà không cập nhật mapper và response DTO tương ứng.
- Khi sửa chat-service, lưu ý Socket.IO server chạy riêng (port 8099), không phải HTTP port 8085.
- Env thật (AWS key, Gemini key) nằm trong `BE/.env` — không commit lên git, không hardcode.

### Frontend
- Mỗi UI app là project độc lập, có `node_modules` và `tsconfig` riêng — không nhầm lẫn giữa `UI/client`, `UI/manager`, `UI/admin`.
- Redux chat state (`state.chat.messages[conversationId]`) là nguồn sự thật duy nhất cho tin nhắn — không dùng local state song song.
- API chat đi qua `messageApi.ts`, socket đi qua `SocketClient.tsx` — không gọi socket trực tiếp trong component.
- Khi sửa `ManagerChatSidebar`, nhớ rằng sidebar dùng `right-72` → chat window phải đặt ở `right-72` để không bị che.

---

## Những gì đã làm (chat feature)

### [DONE] Fix toàn bộ luồng chat client ↔ manager

#### Root cause — Socket bị disconnect ngay khi connect (đã fix hoàn toàn)
- **Lần 1**: `IdentityClient` gọi Feign `POST /auth/introspect` nhưng identity-service có `context-path: /identity-service` → 404 → `valid=false` → disconnect. Fix: thêm `path = "/identity-service"` vào `@FeignClient`.
- **Lần 2** (root cause thực sự): Feign dùng `lb://IDENTITY-SERVICE` qua Eureka — nếu Eureka chậm hoặc identity-service chưa register → Feign throw exception → `valid=false` → disconnect. Socket.io-client v4 **không tự reconnect** khi bị server disconnect (`"io server disconnect"`) → session không bao giờ được tạo → không có real-time.
- **Fix cuối**: Thay toàn bộ Feign introspect trong `SocketHandler` bằng **local JWT validation** (`JwtService` dùng `MACVerifier` + `HS512` với signer key từ `application.yaml`). Không còn phụ thuộc network call khi auth socket.

#### Các fix khác đã thực hiện

**BE — `chat-service`**
- `ChatMessageService.getMessages`: cho phép `assignedManagerId` đọc tin nhắn dù không nằm trong `participants` list.
- `ChatMessageService.create` (SUPPORT conv): bypass kiểm tra participant cho client và assignedManager thay vì chỉ kiểm tra `participants`.
- `ChatMessageService.create` (sender info): fallback khi `profileGrpcClient` trả null (manager không có user-service profile) — dùng thông tin từ `participants` đã lưu.
- `ChatMessageService.create` (socket delivery): thêm `assignedManagerId` vào `userIds` nếu chưa có trong participants, để manager luôn nhận socket event.
- `ConversationService.createSupportConversation`: luôn thêm manager vào participants kể cả khi `profileGrpcClient` trả null (manager chỉ có identity profile, không có user-service profile).
- `ConversationService.claimConversation`: tương tự — thêm manager vào participants với fallback userId-only khi profile null.
- `SocketHandler`: thay `IdentityService.introspect()` bằng `JwtService.extractUserIdFromToken()` (local JWT validation, không dùng Feign). Fix thứ tự `addListeners()` trước `server.start()`.
- `JwtService` (mới): validate JWT bằng `MACVerifier` + `HS512`, trả về `sub` claim làm userId.

**FE — `UI/client/src/components/SellerChatModal.tsx`**
- Fix `handleSendMessage`: sau khi gọi API thành công, dispatch ngay vào Redux (không chờ socket) với `me: true`.
- Fix type xác định `"user"/"seller"`: dùng `msg.me` thay vì so sánh `msg.sender?.userName === currentUsername` (field là `username` lowercase).
- Fix `createdDate` parsing: dùng `typeof` check thay vì so sánh số để tránh NaN khi value là ISO string.

**FE — `UI/manager/src/components/ManagerChatSidebar.tsx`**
- Fix `CustomerChatWindow.isAssignedToMe`: decode JWT `sub` claim để lấy identity user ID, so sánh với `conversation.assignedManagerId` (thay vì dùng `state.user.info?.id` là user-service ID khác với identity ID).
- Fix null display: `conversation.assignedManagerName ?? "Manager khác"` thay vì render "null đang phụ trách".
- Fix HMR crash: `state.chat.conversations ?? []` khi state chưa có `conversations` field.
- Fix `send()`: dispatch sau API call tương tự client.
- Fix sidebar badge `isAssignedToMe`: dùng `conv.assignedManagerId === currentManagerId` (JWT decode) thay vì so sánh tên (luôn sai với manager không có user-service profile).
- Fix event listener: đổi `socket.on("send_message", ...)` → `socket.on("message", ...)`.

**FE — `UI/client/src/utils/socketClient.ts` & `UI/manager/src/utils/socketClient.ts`**
- Thêm `reconnect_attempt` handler: update token từ localStorage trước mỗi lần auto-reconnect.
- Thêm `disconnect` handler: tự reconnect với fresh token khi server kick (`"io server disconnect"`) — socket.io-client v4 không tự reconnect trong trường hợp này.
- `connectSocket`: disconnect + removeAllListeners socket cũ trước khi tạo mới (tránh orphaned socket).

**FE — `UI/client/src/SocketClient.tsx` & `UI/manager/src/SocketClient.tsx`**
- Bỏ `currentUserId` (user-service ID) khỏi useEffect deps — không liên quan đến socket, chỉ gây reconnect thừa khi user profile load.

### [DONE] Batch 3 — manager-to-manager chat, filter/search UI, assignedManagerName fix

**BE — `chat-service`**
- `ConversationService.create()`: rewrite dùng `buildParticipantInfo()` helper thay vì throw khi `profileGrpcClient` trả null → manager có thể tạo DIRECT conversation với nhau.
- `ConversationService.buildParticipantInfo(userId)`: helper mới — thử gRPC trước, fallback sang `fetchManagerUsername()` từ identity-service.
- `ConversationService.toConversationResponse()` & `buildBroadcastResponse()`: thêm fallback `fetchManagerUsername()` khi participant username null → fix `assignedManagerName` hiển thị null/"Manager khác".

**FE — `UI/manager/src/SocketClient.tsx`**
- `conversation_updated` handler: re-fetch cả SUPPORT và DIRECT conversations (merge, loại trùng) để DIRECT conversations cũng cập nhật real-time.

**FE — `UI/manager/src/services/api/messageApi.ts`**
- Thêm `createDirectConversation(participantId)` — POST `CREATE_CONVERSATION` với `type: "DIRECT"`.

**FE — `UI/manager/src/components/ManagerChatSidebar.tsx`** (major rewrite)
- Sidebar fetch cả SUPPORT (`getAllSupportConversations`) và DIRECT (`getMyConversations` filter non-SUPPORT) — merge, loại trùng.
- Filter tabs: "Tất cả" | "Khách" | "Manager" | "AI" — lọc danh sách hiển thị.
- Search input — lọc theo `conversationName` và `lastMessage`.
- Nút "+" trong header: mở picker chọn manager để bắt đầu DIRECT chat mới (lazy-load danh sách).
- Hai section trong sidebar: "Khách hàng" (SUPPORT, cam/đỏ) và "Manager" (DIRECT, indigo/tím).
- `CustomerChatWindow`: thêm `isDirect = conversation.type !== "SUPPORT"` — ẩn action bar (claim/transfer), màu indigo, input luôn enabled cho DIRECT.

### [DONE] Batch 2 — security, manager username, chuyển giao, UI

**BE — `identity-service`**
- `InternalController`: thêm `GET /internal/managers/details` trả về `[{id, username}]` cho tất cả manager — không cần auth (đã trong `PUBLIC_GET`).
- `ManagerInfoDto`: DTO mới trong package `dto.response`.

**BE — `chat-service`**
- `ChatMessageService.getMessages`: với conversation SUPPORT, chỉ `clientId` hoặc `assignedManagerId` mới được đọc tin nhắn (trước đây bất kỳ participant nào cũng đọc được — lỗ hổng khi manager đã transfer vẫn còn trong participants).
- `IdentityClient`: thêm `getManagerDetails()` gọi `/internal/managers/details`.
- `ConversationService.claimConversation` & `transferConversation` & `createSupportConversation`: khi `profileGrpcClient.getProfileByUserId(managerId)` trả null, gọi `fetchManagerUsername(managerId)` từ identity-service để lấy username — fix lỗi `assignedManagerName = null`.
- `ConversationService.getManagerList()`: public method trả danh sách manager cho FE picker.
- `ConversationController`: thêm `GET /conversations/managers` — expose danh sách manager cho FE.
- `ManagerInfoResponse`: DTO mới.

**FE — `UI/manager/src/SocketClient.tsx`**
- Khi `conversation_updated` fires: ngoài `dispatch(updateConversation)`, còn gọi `messageApi.getAllSupportConversations()` và `dispatch(setConversations)` để `lastMessage` luôn cập nhật real-time.

**FE — `UI/client/src/pages/Messages.tsx`**
- Fix `createdDate` parsing: dùng `typeof` check để xử lý cả number và ISO string (tránh NaN).
- Fix `handleSend`: dispatch message vào Redux ngay sau API thành công (không chờ socket event).

**FE — `UI/manager/src/components/ManagerChatSidebar.tsx`**
- Modal chuyển giao: thay text input nhập userId bằng dropdown load danh sách manager từ `GET /conversations/managers`. Lọc ra bản thân. Lazy-load khi mở panel.
- Tăng kích thước popup: `CustomerChatWindow` từ `w-80 h-[560px]` → `w-96 h-[620px]`; `AIChatWindow` từ `w-80 h-[520px]` → `w-96 h-[560px]`.
- Thêm timestamp `HH:MM` dưới mỗi tin nhắn (cả chat khách hàng lẫn AI chat).

**FE — `UI/manager/src/services/api/messageApi.ts`**
- Thêm `getManagerList()` gọi `GET /conversations/managers`.
- Thêm `ManagerInfo` interface `{id, username}`.

**FE — `UI/manager/src/constants/endpoint.ts`**
- Thêm `CHAT.MANAGERS`.

#### Kiến trúc quan trọng cần nhớ
- Manager là user của **identity-service**, KHÔNG có profile trong **user-service** → `profileGrpcClient.getProfileByUserId(managerId)` luôn trả `null` cho manager.
- `WebSocketSession.userId` = identity user ID (JWT `sub` claim), KHÔNG phải user-service profile ID.
- `ParticipantInfo.userId` trong Conversation = identity user ID (vì `ProfileGrpcClient.getProfileByUserId` trả `UserProfileResponse.userId = userId` truyền vào).
- Mọi so sánh user ID trong chat phải dùng identity ID (decode JWT), không dùng `state.user.info?.id`.

---

## TODO (ưu tiên từ trên xuống)

### 1. [CHAT] Nút yêu cầu tiếp quản + popup đồng ý/từ chối
- Manager chưa được assign có nút "Yêu cầu tiếp quản".
- Khi nhấn: gửi socket event tới manager đang phụ trách, hiện popup `"{username} muốn tiếp quản cuộc hội thoại này"` với nút Đồng ý / Từ chối.
- Nếu đồng ý: thực hiện transfer conversation.
- Cần thêm socket event mới ở BE (`takeover_request`, `takeover_response`).

### 2. [CHAT] Trạng thái đã xem cho tin nhắn cuối
- Hiện trạng thái "Đã xem" cho tin nhắn cuối.
- Cần thêm field `readBy: [userId]` vào `ChatMessage` entity và logic mark-as-read.

### 3. [CHAT] Trạng thái online/offline
- Client thấy manager online khi có ít nhất 1 manager đang kết nối socket.
- Manager thấy client online khi client đang kết nối socket.
- Cần dùng `WebSocketSession` để kiểm tra — phức tạp nhất, làm sau cùng.

---

### [MISC] Xác nhận Gemini image validation hoạt động sau khi đổi model
- Đã đổi sang `gemini-2.0-flash` + endpoint `v1` — cần test thực tế với ảnh upload.

## Các lỗi hiện tại

*(Không còn lỗi đã biết)*
