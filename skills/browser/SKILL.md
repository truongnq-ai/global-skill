---
name: browser
description: "Tự động hoá trình duyệt an toàn — chỉ thao tác trong phạm vi đã xác nhận"
depends_on: [clarification]
related: [research]
---

# Browser Skill

## Mục tiêu
- Điều khiển trình duyệt để thực hiện tác vụ web một cách có kiểm soát
- Không truy cập URL ngoài phạm vi được phê duyệt
- Log rõ từng bước để owner theo dõi và có thể dừng bất kỳ lúc nào

---

## Tool sử dụng

| Tool | Khi nào dùng |
|---|---|
| `browser_subagent` | Khi cần tương tác thực sự với browser (click, fill form, navigate) |
| `read_url_content` | Khi chỉ cần đọc nội dung tĩnh từ URL (không cần JS, không cần login) |
| `search_web` | Khi cần tìm kiếm thông tin trên web nhanh |

**Ưu tiên**: dùng `read_url_content` hoặc `search_web` trước khi dùng `browser_subagent` — nhẹ hơn và không cần ghi video.

---

## Quy trình (FSM Browser)

```
[1. Xác nhận URL và mục tiêu]
        ↓
[2. Chọn tool phù hợp]
        ↓
[3. Xác nhận phạm vi thao tác với owner]
     (nếu thao tác có thể thay đổi dữ liệu: submit form, click action...)
        ↓
[4. Thực thi — log từng bước]
        ↓
[5. Báo cáo kết quả + screenshot nếu có]
```

---

## Quy tắc an toàn

### Bắt buộc xác nhận trước khi:
- Submit bất kỳ form nào (đăng nhập, mua hàng, gửi dữ liệu)
- Click vào button có action destructive (Delete, Cancel, Confirm order)
- Download file về máy
- Truy cập các trang yêu cầu authentication

### Không được:
- Lưu password, API key, session cookie vào bất kỳ file nào
- Thực hiện hành động thay đổi dữ liệu mà không có lệnh rõ ràng từ owner
- Truy cập URL ngoài danh sách được chỉ định trong task
- Bỏ qua HTTPS warning hay SSL error

### Recording
- Mọi `browser_subagent` call đều tự động tạo video recording
- Đặt `RecordingName` mô tả rõ hành động: `login_flow_test`, `order_summary_scrape`

---

## Ví dụ thực tế

### ✅ Đúng — Đọc nội dung tĩnh, không cần browser_subagent
```
USER: Đọc docs tại https://docs.example.com/api/orders

AGENT: [dùng read_url_content] ← nhẹ hơn, không cần browser
```

### ✅ Đúng — Xác nhận trước khi submit form
```
USER: Đăng nhập vào admin panel và tạo user mới.

AGENT:
Tôi sẽ thực hiện:
1. Điều hướng đến https://admin.example.com/login
2. Đăng nhập với credentials anh cung cấp (sẽ KHÔNG lưu credentials vào file)
3. Tạo user mới theo thông tin: [username, email, role]

Anh xác nhận để tôi bắt đầu không?
```

### ✅ Đúng — Log rõ từng bước trong browser_subagent task
```python
# Task description cho browser_subagent:
"""
1. Navigate to https://example.com/orders
2. Filter by status = 'pending'
3. Take screenshot of the results table
4. Return: total count of pending orders and screenshot path
5. DO NOT click any action buttons
"""
```

### ❌ Sai — Thực thi ngay không xác nhận
```
USER: Vào admin panel xoá các order cũ hơn 90 ngày.

AGENT: (tự vào, tự xoá không hỏi confirm) ← SAI — hành động destructive
```

### ❌ Sai — Lưu credential vào file
```
AGENT: (lưu username/password vào config.json để dùng lại) ← SAI
```

---

## Template task mô tả cho browser_subagent

```
Thực hiện tác vụ sau trên trình duyệt:

Mục tiêu: <mô tả rõ>
URL bắt đầu: <url>

Các bước:
1. ...
2. ...

Điều kiện dừng: <khi nào thì dừng>
KHÔNG được: <các hành động cấm>
Trả về: <thông tin cần báo cáo lại>
```
