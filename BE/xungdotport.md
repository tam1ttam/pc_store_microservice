# Xử lý Port Already In Use & Java Process Trên Windows

## Tình huống: IntelliJ crash, restart lại bị lỗi "Port already in use"

### Bước 1 — Kiểm tra process Java đang chạy
```bash
jps -l
```
Sẽ thấy danh sách các service đang chiếm port.

---

### Bước 2 — Kill process

#### Cách 1: CMD (nhanh nhất)
```bash
taskkill /F /IM java.exe
```
> Chờ 10-15 giây. Nếu báo timeout → dùng Cách 2.

#### Cách 2: PowerShell (mạnh hơn)
Mở PowerShell (`Win + R` → gõ `powershell` → Enter):
```powershell
Get-Process java | Stop-Process -Force
```

#### Cách 3: Kill từng PID cụ thể (khi muốn giữ lại một số process)
```bash
# Lấy PID từ jps -l, rồi kill từng cái
taskkill /F /PID 12345 /PID 12346 /PID 12347
```

#### Cách 4: Task Manager (khi lệnh không ăn)
`Ctrl + Shift + Esc` → tab **Details** → tìm `java.exe`
→ Shift+click chọn tất cả → chuột phải → **End Task**

#### Cách 5: Restart máy (chắc chắn nhất)
Khi tất cả cách trên đều timeout hoặc lỗi.

---

### Bước 3 — Kiểm tra port cụ thể (nếu cần)
```bash
# Xem process nào đang dùng port (ví dụ 6060)
netstat -ano | findstr :6060

# Kill theo PID tìm được
taskkill /F /PID <PID>
```

---

## Lưu ý quan trọng

| Process | Có nên kill? |
|---|---|
| `java.exe` (các service Spring Boot) | ✅ Kill được |
| `com.intellij.idea.Main` | ❌ Giữ lại |
| `org.sonarsource.sonarlint...` | ❌ Giữ lại |
| `org.jetbrains.jps.cmdline.Launcher` | ❌ Giữ lại |

> `taskkill /IM java.exe` **không ảnh hưởng IntelliJ** vì IntelliJ chạy bằng `idea64.exe`, không phải `java.exe`.

---

## Phòng tránh IntelliJ ngốn RAM

- Vào **Help → Change Memory Settings** → tăng lên 4096MB nếu RAM máy cho phép
- Tắt bớt plugin không dùng: **Settings → Plugins**
- Không chạy quá nhiều service cùng lúc trong IntelliJ
- Dùng **Run Dashboard** để quản lý service, tắt những cái không cần