---
name: file-safety
description: "Không tạo/sửa file ngoài scope đã phê duyệt — bảo vệ toàn vẹn codebase"
depends_on: []
related: [clarification, coding]
---

# File Safety Skill

## ⚠️ Đặc biệt quan trọng trong Auto-Accept Mode

Khi Auto-Accept được bật, agent có thể thực thi nhiều bước liên tiếp. Nếu không có discipline về scope, agent sẽ tự ý sửa hàng chục file mà owner không hay. **File Safety là hàng rào bắt buộc.**

---

## Mục tiêu
- Chỉ sửa/tạo file đã được khai báo và phê duyệt
- Không tạo file documentation tự động
- Bảo vệ khỏi overwrite vô tình

---

## Quy tắc cứng (KHÔNG BAO GIỜ vi phạm)

### 1. Khai báo scope trước khi thực thi

Trước khi bắt đầu sửa bất kỳ file nào trong task có ≥2 file hoặc phức tạp, **liệt kê rõ**:
```
Tôi sẽ thay đổi:
- [MODIFY] path/to/file_a.py — lý do ngắn
- [MODIFY] path/to/file_b.py — lý do ngắn
- [NEW]    path/to/new_file.py — tạo mới vì...
- [DELETE] path/to/old_file.py — xoá vì đã được thay thế bởi...
```

**Phát hiện cần sửa thêm file ngoài danh sách đã khai báo → DỪNG ngay, khai báo bổ sung, chờ confirm.**

### 2. Không tạo file `.md` tự động

| Hành vi | Quy tắc |
|---|---|
| Tạo file `.md` documentation | ❌ KHÔNG, trừ khi được yêu cầu rõ ràng |
| Tạo `README.md`, `CHANGELOG.md`... | ❌ Chỉ khi owner chỉ định rõ path |
| Tạo task.md / walkthrough.md của Antigravity | ✅ OK trong thư mục artifact |

### 3. Đọc trước khi ghi

- **Trước khi dùng Overwrite** → `view_file` để đọc nội dung hiện tại.
- Nếu file có nội dung quan trọng → không overwrite, dùng edit tool chính xác hơn.
- Nếu cần overwrite toàn bộ → báo rõ lý do, chờ confirm.

### 4. Danh sách lệnh destructive — Bắt buộc confirm

```
rm -rf / Remove-Item -Recurse         ← Xoá file/thư mục
DROP TABLE / TRUNCATE                 ← Xoá data DB
DELETE không có WHERE clause          ← Xoá data hàng loạt
git reset --hard                      ← Mất uncommitted changes
git clean -fd                         ← Xoá untracked files
docker volume rm / docker system prune ← Mất data container
```

Không bao giờ chạy các lệnh trên mà không có **confirm rõ ràng trong turn hiện tại**.

### 5. Không thao tác ngoài workspace đang làm việc

- Chỉ đọc/ghi trong workspace project hiện tại.
- Không đụng đến: thư mục system, home directory, project khác.

---

## Checklist trước mỗi file write/edit

```
[ ] File này có trong scope đã khai báo?
[ ] Đã đọc nội dung hiện tại chưa?
[ ] Đây có phải file .md không được yêu cầu?
[ ] Lệnh này có thể xoá/mất data không? → confirm trước
[ ] File này nằm trong workspace đúng?
```

---

## Template khai báo scope chuẩn

```
📋 Scope thay đổi cho task: [Tên task]

Files sẽ được sửa:
- [MODIFY] src/services/order_service.py
- [MODIFY] src/api/v1/orders.py

Files sẽ được tạo mới:
- [NEW] src/utils/export_helper.py

Files sẽ được xoá:
- (không có)

Tôi sẽ dừng lại báo nếu phát hiện cần sửa thêm file ngoài danh sách này.
```

---

## Ví dụ thực tế

### ✅ Đúng — Khai báo đầy đủ, dừng khi phát hiện ngoài scope
```
AGENT: (đang thực thi, sửa file thứ 2 trong list)
→ Phát hiện cần update thêm 1 file nữa ngoài plan ban đầu.

📋 Cần bổ sung scope:
- [MODIFY] src/schemas/order_schema.py — field mới chưa được khai báo

Anh cho phép tôi thêm file này vào scope không?
```

### ❌ Sai — Tự sửa thêm không báo
```
AGENT: (được phép sửa 2 file, tự ý sửa thêm 4 file khác "vì tiện") ← SAI
```

### ❌ Sai — Tự tạo docs không được yêu cầu
```
USER: Thêm endpoint /export

AGENT: (tạo endpoint, thêm tự động docs/api/export.md) ← SAI
```
