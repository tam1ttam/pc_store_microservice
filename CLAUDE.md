# PC Store — Project Overview

## Tổng quan kiến trúc

Hệ thống e-commerce bán PC/linh kiện, gồm **microservices Spring Boot** ở backend và **3 React app** ở frontend.

## Quy tắc code
- Ko được để xuất hiện ký tự BOM (\ueff) ở đầu mỗi file, làm sao để inteliji idea chạy được
- Khi sửa gì và phát hiện có bug gì hay tôi gửi những lỗi gì (chưa fix đc), hãy ghi thêm vào đây, còn bug/lỗi đã fix thì xóa khỏi file này
- Các task đã done thì ko cần làm nữa, chỉ xem qua thôi
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

### [DONE] Batch 4 — quyền gửi tin, real-time chat window, avatar/username

**BE — `chat-service`**
- `ChatMessageService.create` (SUPPORT): chỉ `clientId` hoặc `assignedManagerId` mới được gửi — manager không phụ trách không gửi được (trước đây bất kỳ manager nào cũng gửi được).
- `ConversationService.toConversationResponse`: fallback gọi `fetchManagerUsername()` riêng lẻ khi batch `getManagerNameMap()` trả null cho một `assignedManagerId` — đảm bảo `assignedManagerName` luôn được fill.

**FE — `UI/manager/src/redux/slices/chat.ts`**
- Fix `ChatMessage.sender` type: đổi sang đúng field của BE `ParticipantInfo` (`userId`, `username`, `avatar`) thay vì field cũ sai (`id`, `userName`).
- `setMessages` giờ **merge** thay vì replace: message đã add qua socket event không bị ghi đè khi API response về sau — fix race condition.

**FE — `UI/manager/src/components/ManagerChatSidebar.tsx`**
- `canSend = isDirect || isAssignedToMe`: chỉ manager đang phụ trách mới nhắn được trong SUPPORT. Input bị `disabled` + placeholder hiện `"{tên} đang phụ trách"` khi không có quyền.
- `useEffect` fetch messages thêm dep `conversation.lastMessageAt`: khi `conversation_updated` socket event về → `lastMessageAt` thay đổi → tự refetch messages (silent, không hiện loading spinner). Fix real-time cho manager không phụ trách.
- `prevConvIdRef`: phân biệt lần đầu mở conversation (hiện spinner) với update sau (silent refresh).
- Thêm **avatar** cho mỗi tin nhắn: `isMe=true` → User icon màu cam/indigo; `isMe=false` → avatar thật (nếu có) hoặc User icon xám.
- Thêm **username** dưới mỗi bubble (cạnh timestamp) lấy từ `msg.sender.username`.

**FE — `UI/manager/src/constants/endpoint.ts`**
- `CHAT.MANAGERS` đổi sang trỏ thẳng `identity-service/internal/managers/details` thay vì qua chat-service.

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
- Thêm `CHAT.MANAGERS` (ban đầu trỏ chat-service, sau đổi sang identity-service ở Batch 4).

#### Kiến trúc quan trọng cần nhớ
- Manager là user của **identity-service**, KHÔNG có profile trong **user-service** → `profileGrpcClient.getProfileByUserId(managerId)` luôn trả `null` cho manager.
- `WebSocketSession.userId` = identity user ID (JWT `sub` claim), KHÔNG phải user-service profile ID.
- `ParticipantInfo.userId` trong Conversation = identity user ID (vì `ProfileGrpcClient.getProfileByUserId` trả `UserProfileResponse.userId = userId` truyền vào).
- Mọi so sánh user ID trong chat phải dùng identity ID (decode JWT), không dùng `state.user.info?.id`.

### [DONE] Batch 5 — gửi file, online indicator, transfer tabs

**BE — `chat-service`**
- `Attachment.java` (entity mới): embedded value object `{ url, originalFileName, fileType }`.
- `ChatMessage.java`: thêm `List<Attachment> attachments`.
- `ChatMessageRequest.java`: bỏ `@NotBlank` trên `message`, thêm `List<Attachment> attachments`.
- `ChatMessageResponse.java`: thêm `List<Attachment> attachments`.
- `ChatMessageService.create`: validate ít nhất `message` hoặc `attachments` phải có; `lastMessage` preview dùng `📎 fileName` khi không có text.
- `ConversationController`: thêm `GET /conversations/users/{userId}/online` → `ApiResponse<Boolean>`.
- `ConversationService`: thêm `isUserOnline(userId)` dùng `WebSocketSessionRepository.existsByUserId`.

**FE Client**
- `presence.ts` (mới): Redux slice giống manager, track `onlineUserIds[]`.
- `store.tsx`: thêm `presenceReducer`.
- `SocketClient.tsx`: lắng nghe `user_online`/`user_offline`, gọi `getOnlineManagers()` khi connect.
- `chat.ts`: fix sender type (`userId/username/avatar`), thêm `attachments`, `setMessages` merge thay vì replace.
- `endpoint.ts`: thêm `CHAT.MANAGERS_ONLINE`, `CHAT.USER_ONLINE`.
- `messageApi.ts`: thêm `uploadFile`, `getOnlineManagers`, cập nhật `sendMessage` hỗ trợ `attachments`.
- `SellerChatModal.tsx`: green dot + "Đang hoạt động" khi `onlineUserIds.length > 0`; nút paperclip upload file; preview file trước khi gửi; render `AttachmentPreview` (ảnh/video/audio/tài liệu) trong bubble.

**FE Manager**
- `endpoint.ts`: thêm `CHAT.USER_ONLINE`.
- `messageApi.ts`: thêm `uploadFile`, `isUserOnline`, cập nhật `sendMessage` hỗ trợ `attachments`.
- `chat.ts` (manager): thêm `Attachment` interface + `attachments` field trên `ChatMessage`.
- `ManagerChatSidebar.tsx`:
  - `CustomerChatWindow`: green dot trên avatar header khi client online; bootstrap client online status via `isUserOnline` API khi window mở; nút paperclip + pending attachment preview + `AttachmentBubble` render; `send()` truyền attachments.
  - Transfer picker: 2 tab "Đang hoạt động" / "Tất cả" với chấm xanh.

### [DONE] Admin features — Dashboard, Track log, Audit Trail

**BE — `order-service`**
- `OrderStatsResponse.java` (DTO): `totalOrders`, `totalRevenue`, `paidOrders`, `pendingOrders`, `completedOrders`, `cancelledOrders`.
- `OrderService.getStats()` + `OrderServiceImpl`: compute stats from `findAll()`.
- `OrderController`: `GET /api/orders/stats`.
- `AuditEvent.java` (package `com.devteria.event.dto`): Kafka event DTO.
- `OrderServiceImpl.publishAudit()`: publishes to `audit.action` topic after `saveOrder` and `updateOrderStatus`.

**BE — `user-service`**
- `CustomerService.countCustomers()` + impl: `customerRepository.count()`.
- `ProfileAdminController`: `GET /api/admin/customers/count`.

**BE — `product-service`**
- `ProductService.countProducts()` + impl: `productRepository.count()`.
- `ProductController`: `GET /products/count`.

**BE — `identity-service`**
- `AdminService`: fixed `LocalDateTime.now()` bug, added `saveHistory()` (bypasses SecurityContext for Kafka consumer), added `getFilteredHistory()`.
- `HistoryActionRepository`: `findFiltered()` JPQL query with optional `search`, `from`, `to` params.
- `AdminController.GET /api/admin/history`: accepts `?search=`, `?from=`, `?to=` ISO datetime params.
- `AuditEventConsumer.java` (`@KafkaListener(topics="audit.action")`): consumes events and calls `adminService.saveHistory()`.
- `AuthenticationService`: publishes audit event on successful login via `authenticateForPortal()`.
- `application.yaml`: added Kafka consumer config block.

**Infrastructure**
- `docker-compose.yml`: added `GF_SECURITY_ALLOW_EMBEDDING: "true"` to Grafana env (fixes iframe embedding).

**FE — `UI/admin`**
- `Dashboard.tsx`: 4 main stat cards + 3 order status cards + progress bar, `Promise.allSettled` parallel fetch, `formatCurrency()` helper, skeleton loading.
- `AuditTrail.tsx`: search + from/to date filters, skeleton loading rows, record count display.
- `adminApi.ts`: `getOrderStats()`, `getCustomerCount()`, `getProductCount()`.
- `endpoint.ts`: `ORDER_STATS`, `CUSTOMER_COUNT`, `PRODUCT_COUNT`.

### [DONE] Batch 9 — chat read status ("Đã xem")

**BE — `chat-service`**
- `ChatMessage.java`: added `readBy: List<String>` field (`@Builder.Default` to `new ArrayList<>()`).
- `ChatMessageResponse.java`: added `readBy: List<String>`.
- `ChatMessageRepository.java`: added `findAllByConversationIdAndSenderUserIdNotAndReadByNotContaining()` for efficient unread lookup.
- `ChatMessageService.markAsRead(conversationId)`: finds all messages NOT sent by current user that don't have current userId in `readBy`, adds userId, saves, and broadcasts `messages_read` socket event `{conversationId, readerId}`.
- `ChatMessageController.java`: added `POST /messages/read?conversationId=` endpoint.

**FE — both `UI/manager` and `UI/client`**
- `chat.ts` slice: added `readBy?: string[]` to `ChatMessage`, added `markMessagesRead` action.
- `endpoint.ts`: added `CHAT.MARK_READ(conversationId)`.
- `messageApi.ts`: added `markAsRead(conversationId)`.
- `ManagerChatSidebar.tsx`: calls `markAsRead` after fetching messages; `messages_read` socket listener dispatches `markMessagesRead`; shows "Đã xem" (blue, 10px) below the last outgoing message that has been read.
- `SellerChatModal.tsx`: calls `markAsRead` after fetching messages; shows "Đã xem" on last read outgoing message.
- `SocketClient.tsx` (client): added `messages_read` listener → `dispatch(markMessagesRead(...))`.

### [DONE] Batch 8 — chat takeover request feature

**BE — `chat-service`**
- `ConversationService.acceptTakeover(conversationId, currentManagerId, newManagerId)`: socket-driven transfer that bypasses `SecurityContextHolder` (called from SocketHandler, not HTTP layer).
- `SocketHandler`: added `takeoverRequests` ConcurrentHashMap (conversationId → requesterId), `registerTakeoverListeners()` called before `server.start()`.
  - `takeover_request`: stores requesterId, broadcasts payload to all clients (FE filters by conversationId + isAssignedToMe).
  - `takeover_accept`: calls `acceptTakeover()`, then sends `takeover_accepted` event directly to requester's socket via `server.getClient(UUID)`.
  - `takeover_reject`: sends `takeover_rejected` event to requester's socket.

**FE — `UI/manager/src/components/ManagerChatSidebar.tsx`**
- Added "Yêu cầu tiếp quản" button (blue, `UserCheck` icon) in action bar for `!isUnassigned && !isAssignedToMe` case.
- Added `takeoverPopup` and `takeoverStatus` local state.
- `useEffect` registers `takeover_request`/`takeover_accepted`/`takeover_rejected` socket listeners per conversation window.
- `takeover_request` received → show full-screen overlay popup with "Đồng ý" / "Từ chối" buttons (only shown to `isAssignedToMe`).
- Accept → emits `takeover_accept`; Reject → emits `takeover_reject`.
- Status toast shown to requester after accept/reject (3s auto-dismiss).

### [DONE] Batch 7 — fix username null + isMe bug (chat-service)

**Root cause username null**: Khi manager gửi tin trong SUPPORT conversation (manager không có trong `participants`), code fallback sang `fetchManagerUsernameById()` — Feign call tới identity-service. Nếu Feign fail intermittently → `sender.username = null` lưu vào MongoDB → không hiện username.

**Root cause isMe**: `ChatMessageResponse` dùng chung 1 object, bị mutate (`setMe()`) trong `forEach` broadcast loop — tiềm ẩn race condition.

**BE — `chat-service`**
- `WebSocketSession.java`: thêm field `username` để cache manager username khi connect.
- `WebSocketSessionRepository.java`: thêm `findFirstByUserId(String userId)`.
- `SocketHandler.java`: inject `IdentityClient`, gọi `getManagerDetails()` 1 lần khi manager connect socket → lưu `username` vào `WebSocketSession`. Nếu Feign fail → lưu null (non-fatal).
- `ChatMessageService.create` (sender info): trước khi gọi Feign `fetchManagerUsernameById()`, tra cứu `webSocketSessionRepository.findFirstByUserId(userId)` lấy username đã cache → Feign chỉ gọi khi session không có username.
- `ChatMessageService.create` (broadcast): tạo `ChatMessageResponse perRecipient` mới cho mỗi client thay vì mutate object chung → loại bỏ shared mutable state.

### [DONE] Batch 6 — fix transfer picker "Đang hoạt động" luôn rỗng

**Root cause**: `ConversationService.getOnlineManagerIds()` gọi `fetchManagerIds()` qua Feign tới identity-service. Nếu Eureka chậm → Feign throw → trả `List.of()` rỗng → tab "Đang hoạt động" luôn empty.

**BE — `chat-service`**
- `ConversationService.getOnlineManagerIds()`: bỏ Feign, dùng `webSocketSessionRepository.findAll()` lấy tất cả active session userIds trực tiếp từ MongoDB. FE tự lọc ra manager qua `managerList`.
- Import `WebSocketSession` entity vào `ConversationService`.

**FE Manager — `ManagerChatSidebar.tsx`**
- `handleShowTransfer`: luôn gọi `getOnlineManagers()` HTTP fresh mỗi lần mở picker (không dùng Redux cache stale). Dùng `Promise.all` song song với fetch manager list.
- Thêm local state `onlineManagerIds` thay thế `onlineUserIds` từ Redux cho transfer picker.

---

### [DONE] file-service — chuyển upload sang S3

**BE — `file-service`**
- `FileController`: inject `FileServiceImpl` trực tiếp (bỏ `FileService`), upload gọi `fileServiceImpl.uploadImage(base64, "chat-attachments")`.
- `FileServiceImpl` (`com.tam.file.service.FileServiceImpl`): class duy nhất xử lý upload — validate ảnh qua Gemini, upload lên S3, lưu metadata vào `UploadedFile` MongoDB collection.
- `S3FileUploadService`: xử lý tương tác S3 (`upload`, `delete`). URL trả về dạng `https://{bucket}.s3.{region}.amazonaws.com/{key}` — FE dùng URL này trực tiếp, không qua download proxy.
- `FileService` (local storage cũ): vẫn còn trong codebase nhưng không còn được controller gọi.
- Download endpoint: hiện **comment out** — S3 file có URL public dùng trực tiếp, không cần proxy.
- File duplicate `com.tam.file.service.impl.FileServiceImpl` đã bị xóa — chỉ giữ class ở package `com.tam.file.service`.

**Kiến trúc file-service cần nhớ**
- `UploadedFile` entity lưu: `url` (full S3 URL), `publicId` (S3 key), `format`, `fileSize`, `fileType`, `resourceType`.
- `app.file.download-prefix` trong yaml chỉ dành cho local storage mode cũ — với S3, FE dùng `url` từ `UploadImageResponse` trực tiếp.
- `/media/**` đã được thêm vào `permit-all-endpoints` → upload không cần auth token.

### [DONE] Notification system — lưu thông báo vào DB

**Kafka topic `notification.store`** — notification-service consume và lưu MongoDB.

**Đã publish:**
- `identity-service/AuthenticationService.authenticate()` → type `LOGIN`
- `identity-service/UserService.createUser()` → type `REGISTER`
- `order-service/OrderServiceImpl.publishOrderCreatedEvent()` → type `ORDER_PLACED` (chỉ COD, dùng `identityUserId` từ request)

**Kiến trúc notification cần nhớ**
- `notification.store` topic → `NotificationEventConsumer` → `NotificationServiceImpl.create()` → MongoDB `notifications`.
- `identityUserId` (JWT `sub`) ≠ `customerId` (MongoDB ObjectId của Customer profile) — luôn dùng identity userId khi publish `StoreNotificationEvent`.
- FE decode JWT bằng `utils/jwtUtils.ts:decodeJwtSub()` để lấy identity userId.
- `notification-service` REST: `GET /api/notifications`, `PUT /{id}/read`, `PUT /read-all`, `PUT /{id}/action-done`.

### [DONE] Profile completion flow

**BE — `user-service`**
- `Customer.isActive` mặc định `false`. Set `true` sau khi `completeProfile()`.
- `PUT /api/customers/complete-profile` — yêu cầu ít nhất 1 địa chỉ.

**FE — `UI/client`**
- `ProfileCompletionModal.tsx`: 2 bước (profile → fake OTP). Dispatch `setProfileActive()` sau OTP.
- `Header.tsx`: dismissible banner khi `isActive === false`.
- `Cart.tsx`: block checkout nếu `isActive === false`, hiện `ProfileCompletionModal`.

### [DONE] Product image upload qua gRPC + avatar client qua file-service HTTP

**BE — `product-service/ProductServiceImpl`**
- `addProduct` + `updateProduct`: `isBase64(img)` check → nếu là base64 thì `fileServiceGrpcClient.uploadFile(base64, "product")` → lưu S3 URL. Tương tự cho `detailReq.getImagesUpload()` (gallery images).
- Upload TRƯỚC khi ghi DB → tránh duplicate product khi client retry.

**FE — `UI/client/Header.tsx`**
- `handleAvatarChange`: gọi `messageApi.uploadFile(file)` → HTTP POST `/media/upload` lên file-service → S3 URL → `userApi.updateAvatar(url)`. FE không gọi gRPC trực tiếp (gRPC chỉ dành cho BE-to-BE).

### [DONE] Flexible product attributes — thay thế fixed spec fields

**BE — `product-service`**
- `ProductAttribute.java` (entity embedded): `name`, `value`, `unit`, `description`.
- `ProductDetail.java`: bỏ 9 field cứng (processor, ram, storage, ...), thay bằng `List<ProductAttribute> attributes`.
- `ProductAttributeRequest.java` + `ProductAttributeResponse.java`: DTO mới.
- `ProductDetailCreationRequest.java` + `UpdateProductDetailReq.java`: thay fixed fields bằng `List<ProductAttributeRequest> attributes`.
- `ProductDetailResponse.java`: thay fixed fields bằng `List<ProductAttributeResponse> attributes`.
- `ProductDetailMapper.java`: thêm mapping methods `toProductAttribute`, `toProductAttributeResponse`, `toProductAttributeList`, `toProductAttributeResponseList`.
- `ProductDetailServiceImpl.java`: cập nhật `addProductDetail` + `updateProductDetail` dùng attribute list.

**FE — `UI/manager`**
- `product.schema.ts`: thêm `productAttributeSchema` + `ProductAttribute` type; `productDetailSchema` dùng `attributes: z.array(...)`.
- `Admin/Product.tsx`: bỏ 9 spec input cứng; thêm section "Thông số kỹ thuật" với nút "+ Thêm thuộc tính" → mỗi row gồm Tên | Giá trị | Đơn vị | Mô tả | X. Dữ liệu lưu trong state `attributes` riêng, gửi kèm `detailRequest.attributes` khi submit. Đã bỏ Excel import (không phù hợp với cấu trúc động mới).

**FE — `UI/client`**
- `ProductDetail.tsx`: thay `specs` array cứng bằng `product.attributes ?? []`; `SpecRow` render label + value + unit; description block dùng `attributes.slice(0, 5)` thay vì hardcode field names.

**Lưu ý migration**: Dữ liệu `ProductDetail` cũ trong MongoDB vẫn còn các field cứng — sẽ được bỏ qua (MongoDB schemaless). Sản phẩm mới sẽ dùng `attributes`.

### [DONE] Manager — multi-category filter + category management UI + fix 403

**BE — `product-service`**
- `ProductRepository`: thêm `findByCategoryIn(List<String> categories, Pageable pageable)` với `@Query("{ 'category': { $in: ?0 } }")`.
- `ProductService` + `ProductServiceImpl`: thêm `getProductsByCategories(List<String>, int, int)` và `countProductsByCategories(List<String>)` (dùng `mongoTemplate.count` per-category).
- `ProductController`: thêm `GET /products/by-categories?names=...&page=` và `GET /products/category-counts?names=...`.

**FE — `UI/manager`**
- `endpoint.ts`: thêm `PRODUCTS_BY_CATEGORIES`, `PRODUCTS_CATEGORY_COUNTS`.
- `adminApi.ts`: thêm `listProductsByCategories(categories, page)` và `getCategoryCounts(categoryNames)` — build URL thủ công với repeated `names=` params (Spring `@RequestParam List<String>` không nhận `names[0]=`).
- `Admin/Product.tsx`:
  - Multi-select dropdown filter theo danh mục (checkbox, click-outside đóng).
  - Filter chips hiển thị danh mục đang chọn, nút xóa từng chip.
  - `loadProducts(page, catFilters)`: nếu có filter → `listProductsByCategories`, ngược lại `listProducts`.
  - Category tab: search input, scrollable list `max-h-[calc(100vh-280px)]`, count badge per item, "X / Y danh mục" footer.
  - "Thêm danh mục" input chuyển lên header (giống tab sản phẩm), bỏ `pt-24`.

**BE — `user-service`** — fix 403 MANAGER gọi `GET /api/admin/customers`
- `CustomerServiceImpl.getAllCustomers`: đổi `@PreAuthorize("hasRole('ADMIN')")` → `@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")`.
- Root cause: controller cho phép MANAGER nhưng service method chặn lại → `AccessDeniedException` → `GlobalExceptionHandler` trả code 1007.

**FE — `UI/client`**
- `product.ts` slice: thêm `fetchProductsByCategories` thunk + reducers.
- `Product.tsx`: dùng `fetchProductsByCategories` khi `selectedCategories.length > 0` (hỗ trợ multi-select thay cho single).

### [DONE] Import sản phẩm từ Excel / Google Sheets (UI/manager)

**FE — `UI/manager/src/pages/Admin/ImportProductDialog.tsx`**
- Thứ tự 8 cột cố định đúng theo `Product` entity: Tên · URL ảnh · Giá · Đơn vị · Số lượng · **Danh mục** · Nhà cung cấp · Địa chỉ NCC (cột category được dịch về đúng vị trí trước supplier).
- Cột thuộc tính linh hoạt từ cột 8 trở đi, mỗi thuộc tính gồm 4 cột (Tên / Giá trị / Đơn vị / Mô tả), tối đa 20 thuộc tính.
- Upload file `.xlsx/.xls` trực tiếp hoặc nhập URL Google Drive / Google Sheets.
- Với Google Sheets: thử CSV pub URL trước (không bị CORS với sheet "Published to the web"), fallback sang xlsx export, có hướng dẫn "Publish to the web".
- Preview table hiển thị đủ 8 cột cố định gồm cả Danh mục (badge màu xanh).
- Cảnh báo validation trước khi import: highlight dòng thiếu tên, giá = 0, thiếu ảnh.
- Progress bar real-time, kết quả chi tiết từng dòng (OK / lỗi), nút "Import thêm" để nhập thêm file khác mà không đóng dialog.
- Nút tải `product_template.xlsx` vẫn giữ nguyên.

### [DONE] Voucher PUBLIC/PRIVATE + giá sản phẩm sau voucher

**BE — `order-service`**
- `Voucher` entity: đã có `accessType` (PUBLIC/PRIVATE), `userId` (null = public), `maxUsagePerUser`, `VoucherUsage` per-user tracking.
- `VoucherServiceImpl.applyVoucher`: sau khi apply PRIVATE voucher → set `isActive=false` (soft-delete, biến mất khỏi danh sách available).
- `VoucherServiceImpl.unapplyVoucher`: khi unapply PRIVATE voucher → set `isActive=true` (khôi phục nếu đơn hàng bị hủy).
- `VoucherRepository.findAvailableForUser`: query lọc `isActive=true`, chưa hết hạn, chưa hết lượt, và (PUBLIC hoặc PRIVATE với đúng userId).

**FE — `UI/client`**
- `redux/slices/voucher.ts` (mới): `AvailableVoucher` type, `fetchAvailableVouchers` thunk (gọi `GET /vouchers`), `clearVouchers` action, `computeBestDiscount(price, vouchers)` helper.
- `redux/store.tsx`: thêm `voucherReducer`.
- `App.tsx`: `useEffect` load voucher khi `isLogin=true`, clear khi logout.
- `ProductCard.tsx`: dùng `computeBestDiscount` để tính giá sau voucher tốt nhất; hiển thị giá gốc gạch ngang + giá sau giảm màu đỏ + badge "-X%"/"-Yđ" góc trái trên.
- `ProductSlider.tsx`: tương tự ProductCard — hiển thị giá sau voucher + badge "Có voucher" khi user đăng nhập và có voucher áp dụng được.

**Kiến trúc quan trọng**
- Voucher PRIVATE: soft-delete (isActive=false) sau khi dùng, không hard-delete để tránh mất FK của OrderVoucher và có thể khôi phục khi unapply.
- Giá "sau voucher" trên product card là giá ước tính (giả định mua 1 sản phẩm, áp voucher tốt nhất). Giá thực tế vẫn tính ở Checkout với order total.
- Chỉ hiển thị giá sau voucher khi user đã đăng nhập (voucher list từ `state.voucher.available`).

### [DONE] order-service — Cart, Order, Voucher (BE + FE client)

**BE — `order-service`** (migrate MongoDB → MySQL, db `orderservice`)
- Entity: `Cart 1──* CartItem`, `Order 1──* OrderItem`, `Order *──* Voucher` (qua `OrderVoucher`), tất cả JPA/Hibernate.
- `CartItem`: thêm `productImage TEXT` để lưu S3 URL ảnh sản phẩm.
- `CartServiceImpl.upsertItem`: lazy create cart, SET quantity (không ADD).
- API Cart: `GET /cart`, `PUT /cart/items`, `DELETE /cart/items/{id}`, `DELETE /cart/clear`.
- API Order client: `POST /api/orders/checkout`, `GET /api/orders`, `GET /api/orders/{id}`, `PATCH /api/orders/{id}/cancel`.
- API Order manager: `PATCH /api/orders/{id}/status`, `DELETE /manager/orders/{id}`.
- API Voucher manager: CRUD `/manager/vouchers/**`.
- API Voucher client: `POST /vouchers/apply`, `DELETE /vouchers/unapply`, `GET /vouchers` (public).
- Kafka: `UserRegistrationConsumer` lắng nghe `user.registered` → tạo Cart mới.
- `PermissionInitConfig`: thêm đầy đủ quyền cart/order/voucher cho USER và MANAGER role.

**FE — `UI/client`**
- Toàn bộ cart/order layer migrate từ service cũ sang order-service mới (không còn dùng port 8282).
- `cartApi`, `orderApi`, `voucherApi` mới; Redux thunks/slices cập nhật; types mới.
- `ProductDetail`, `ProductSlider`, `ProductCard`: truyền `productImage` khi add to cart.
- **Cart page** viết lại kiểu Shopee: checkbox per item, sticky bottom bar, "Mua hàng (N)" → navigate `/checkout`.
- **Checkout page** (`/checkout`): địa chỉ, danh sách item, voucher picker/input, payment method, tóm tắt + "Đặt hàng".
- **Order page** + **Order detail page**: hiển thị theo schema mới, nút "Hủy đơn hàng".

---

## TODO (ưu tiên từ trên xuống)

## Rule for todo: 
- Nếu trong 1 job trong primary mà có liên quan đến việc hiện thông báo trong secondary, hãy làm sau khi làm xong cái job primary đó
- Nếu hiện thực thêm API gì, hãy viết ngay nó vào file PermissionInitConfig để các API đó vào trong db

## primary
1. **i18n — Chuyển đổi ngôn ngữ (VI/EN) cho cả 3 UI app**
   - Dùng `react-i18next` cho `UI/client`, `UI/manager`, `UI/admin`
   - Mỗi app có `src/i18n/` riêng với file `locales/vi/*.json` và `locales/en/*.json`
   - Nút chuyển ngôn ngữ đặt ở Header, lưu lựa chọn vào `localStorage`
   - Toàn bộ label, button, toast, placeholder đều dùng `t('key')` — không hardcode text
   - BE không thay đổi gì (chỉ là presentation layer)

### secondary: Notification — trigger thêm sự kiện

1. **`CHAT_ASSIGNED`** — `chat-service/ConversationService.claimConversation()`:
   - Publish tới `clientId` của conversation
   - "Yêu cầu hỗ trợ của bạn đã được {manager} tiếp nhận"

2. **`PROFILE_COMPLETED`** — `user-service/CustomerServiceImpl.completeProfile()`:
   - Cần thêm KafkaTemplate vào user-service (hiện chưa có)
   - "Hồ sơ của bạn đã được hoàn thiện"

### Dashboard — UI/admin

6. **Request/min chart** — dùng Actuator `/actuator/metrics/http.server.requests` hoặc Prometheus

### Monitoring — Admin UI System Logs

7. **BE — log JSON** (10 service): thêm `logstash-logback-encoder` vào `pom.xml`, thêm `logback-spring.xml` output JSON với field `level`, `service`, `message`, `@timestamp`
8. **BE — proxy endpoint** `identity-service/AdminLogController.GET /api/admin/logs` → gọi Loki `query_range`
9. **FE — `UI/admin/SystemLogs.tsx`**: dropdown service, filter level (ERROR/WARN/INFO/DEBUG), date range, bảng log badge màu

---

> **Deploy VPS** — xem [`DEPLOY-VPS.md`](DEPLOY-VPS.md) (Phase 1–10, lưu ý chi tiết từng bước).