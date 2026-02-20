---
name: coding
description: "Quy trình coding có kỷ luật theo FSM — phân tích trước, thực thi sau, không vượt scope"
---

# Coding Skill

> **Áp dụng cho mọi project, mọi tech stack.**  
> Quy tắc kỹ thuật cụ thể (framework, structure, pattern) được định nghĩa trong skill riêng của từng project.

## Mục tiêu
- Luôn **phân tích trước, thực thi sau** — không làm tắt
- Không modify code khi còn điểm mơ hồ
- Không vượt scope file đã được phê duyệt
- Ngôn ngữ giải thích mặc định: **tiếng Việt**

---

## FSM Bắt Buộc (Finite State Machine khi coding)

```
[1. Đọc & hiểu yêu cầu]
        ↓
[2. Khảo sát codebase — KHÔNG đoán mò]
        ↓
[3. Xác định scope thay đổi]
        ↓
[4. Gặp điểm mơ hồ?] ──YES──→ [DỪNG — Clarification] ──→ [Chờ owner]
        │ NO                                                       ↓
        ↓                                               [Nhận quyết định]
[5. Khai báo plan + danh sách file → Owner confirm]
        ↓
[6. Thực thi từng file theo plan]
        ↓
[7. Báo cáo kết quả]
```

> Bước 4 và 5 là **checkpoint bắt buộc** — không được skip dù đang ở Auto-Accept mode.

---

### Giải thích từng bước

**Bước 1 — Đọc & hiểu yêu cầu**
- Tóm tắt lại yêu cầu theo cách hiểu của mình trước khi làm bất cứ điều gì.
- Nếu yêu cầu chứa từ ngữ vague ("cải thiện", "refactor", "tối ưu") → dừng hỏi ngay.

**Bước 2 — Khảo sát codebase**
- Dùng `view_file`, `view_file_outline`, `grep_search`, `find_by_name` để hiểu context thực tế.
- Không đoán structure hay pattern nếu chưa thấy tận mắt.
- Quy tắc: **đọc ít nhất 3 file liên quan** trước khi kết luận cần phải sửa gì.

**Bước 3 — Xác định scope thay đổi**
- Liệt kê đầy đủ: file nào sẽ bị sửa, file nào sẽ được tạo mới.
- Nếu scope lớn hơn 5 file hoặc không chắc → ưu tiên hỏi clarification trước.

**Bước 4 — Checkpoint mơ hồ**
- Xem `skills/clarification/SKILL.md` để biết khi nào phải dừng.
- **Auto-Accept mode không miễn trừ bước này.**

**Bước 5 — Khai báo plan**
- Với task đơn giản (≤2 file, ≤20 dòng thay đổi, không có side-effect): thực thi ngay.
- Với task phức tạp: liệt kê plan rõ ràng, chờ confirm từ owner.
- Format khai báo (xem `skills/file-safety/SKILL.md`).

**Bước 6 — Thực thi**
- Chỉ sửa file đã khai báo trong plan.
- Ưu tiên dùng `replace_file_content` thay vì overwrite toàn bộ file.
- Nếu giữa chừng phát hiện cần sửa thêm → **dừng lại, khai báo bổ sung, không tự ý làm**.

**Bước 7 — Báo cáo**
- Liệt kê tóm tắt những gì đã thay đổi.
- Chỉ ra nếu có điểm cần owner verify thủ công.

---

## Quy tắc Ngôn ngữ

| Thành phần | Ngôn ngữ |
|---|---|
| Giải thích, phân tích, câu hỏi | Tiếng Việt |
| Tên biến, hàm, class, file | Tiếng Anh (giữ nguyên theo project) |
| Thuật ngữ kỹ thuật (API, schema, token, pipeline...) | Tiếng Anh (không dịch) |
| Comment trong code | Tiếng Anh |
| Commit message | Tiếng Anh, theo convention của project |

---

## Quy tắc Commit (mặc định nếu project không có convention riêng)

Dùng Conventional Commits:
```
<type>(<scope>): <mô tả ngắn>

feat(auth): add refresh token support
fix(order): handle null discount edge case
refactor(db): extract repository from service layer
chore(deps): upgrade core dependencies
docs(api): update endpoint documentation
```

---

## Những điều KHÔNG được làm (bất kể context)

- ❌ Sửa file chưa được khai báo trong plan ngay cả khi "thấy cần"
- ❌ Tự chọn pattern/approach khi có ≥2 hướng hợp lý
- ❌ Tạo file `.md` documentation không được yêu cầu
- ❌ Rename, delete, move file không có trong plan
- ❌ Chạy lệnh có side-effect (migrate DB, deploy, restart service) không qua confirm

---

## Ví dụ thực tế

### ✅ Đúng — Khảo sát thực tế trước khi kết luận
```
USER: Thêm tính năng export báo cáo đơn hàng.

AGENT:
Trước khi làm, tôi cần khảo sát codebase:
1. [find_by_name] tìm các file liên quan đến "order", "report", "export"
2. [view_file_outline] xem cấu trúc module hiện tại
3. [grep_search] tìm pattern xử lý response file hiện tại

→ Kết quả khảo sát: [mô tả những gì tìm thấy]
→ Scope dự kiến: [liệt kê file]
→ Phát hiện điểm mơ hồ: format export (CSV/Excel/PDF?) → DỪNG HỎI
```

### ✅ Đúng — Khai báo plan rõ ràng
```
AGENT:
Plan thực thi:
- [MODIFY] src/services/order_service.py — thêm method export_csv()
- [MODIFY] src/api/orders.py — thêm endpoint GET /orders/export
- [NEW]    src/utils/csv_writer.py — utility helper

Tôi sẽ bắt đầu theo thứ tự trên. Nếu phát hiện cần sửa thêm file
tôi sẽ dừng báo anh trước khi tiếp tục.
```

### ❌ Sai — Không khảo sát, làm theo phỏng đoán
```
AGENT: (tự giả định project structure, tạo file ở vị trí sai convention) ← SAI
```

### ❌ Sai — Bỏ qua checkpoint, tự chạy vì "task đơn giản"
```
AGENT: (thêm endpoint mới mà không khai báo plan, không confirm,
vì thấy "chỉ thêm 1 route") ← SAI — route mới có thể break auth middleware
```
