# End-to-End Example: Thêm tính năng Export CSV cho đơn hàng

> Ví dụ đi qua toàn bộ FSM (S0→S6) với CLARIFICATION và Error Recovery,
> minh hoạ cách tất cả skills phối hợp cùng nhau.

---

## S0 — NHẬN YÊU CẦU

```
USER: "Thêm endpoint export CSV danh sách đơn hàng cho merchant."

AGENT [S0]:
- Đọc yêu cầu
- Xác định cần đọc skill nào (xem docs/skill-routing.md):
  → coding (thêm code)
  → clarification (có thể mơ hồ)
  → file-safety (kiểm soát scope)
```

**Tóm tắt yêu cầu**: Tạo endpoint mới cho phép merchant download danh sách đơn hàng dưới dạng file CSV.

---

## S1 — PHÂN TÍCH YÊU CẦU

```
AGENT [S1]:
Trả lời 4 câu hỏi bắt buộc:
1. Kết quả cần đạt? → Endpoint trả về file CSV chứa orders
2. Có từ ngữ vague? → "danh sách đơn hàng" — cần rõ: filter gì? columns nào?
3. Ràng buộc kỹ thuật? → Chưa rõ
4. Rủi ro? → CSV lớn có thể timeout
```

**Phát hiện mơ hồ → Trigger CLARIFICATION**.

---

## CLARIFICATION (lần 1)

```
AGENT:
❓ [Phạm vi dữ liệu export]
Endpoint export sẽ trả về data gì? Cần xác định trước khi implement.

A. Export tất cả đơn hàng (không filter)
- Ưu: Đơn giản
- Nhược: File có thể rất lớn → timeout, memory

B. Export theo khoảng thời gian (from_date, to_date)
- Ưu: Kiểm soát size, phù hợp báo cáo
- Nhược: Phức tạp hơn chút

C. Export đơn hàng theo status (pending, completed...)
- Ưu: Linh hoạt
- Nhược: Cần UI cho filter

💡 Khuyến nghị: Option B — phù hợp nhất cho use case báo cáo merchant.

→ Anh chọn option nào?
```

```
USER: "Option B, filter theo ngày."
AGENT: Hiểu rồi, sẽ implement export CSV filter theo from_date/to_date.
```

---

## S2 — KHẢO SÁT CODEBASE

```
AGENT [S2]:
[view_file_outline] src/api/ → thấy routes tổ chức theo module
[grep_search] "order" → tìm thấy:
  - src/models/order.py        (SQLAlchemy model)
  - src/schemas/order_schema.py (Marshmallow schema)
  - src/api/v1/orders.py       (existing endpoints)
  - src/services/order_service.py (business logic)

[view_file] src/api/v1/orders.py → thấy pattern: router + dependency injection
[view_file] src/services/order_service.py → có method get_orders(merchant_id, filters)

Kết luận khảo sát:
- Project dùng FastAPI + SQLAlchemy + Marshmallow
- Pattern: Route → Service → Model
- Hiện chưa có utility CSV nào
- Response trả file dùng StreamingResponse (thấy ở endpoint khác)
```

---

## S3 — XÁC ĐỊNH SCOPE & LẬP KẾ HOẠCH

```
📋 Scope thay đổi:

[MODIFY] src/services/order_service.py      — thêm method export_orders_csv()
[MODIFY] src/api/v1/orders.py               — thêm endpoint GET /orders/export
[NEW]    src/utils/csv_writer.py             — utility tạo CSV từ list objects

Thứ tự thực hiện: csv_writer.py → order_service.py → orders.py
Điểm cần chú ý: File CSV lớn → dùng StreamingResponse, không load hết vào memory.
```

---

## S4 — TRÌNH BÀY KẾ HOẠCH & CHỜ CONFIRM

```
AGENT:
Tôi sẽ thực hiện:

📋 Scope:
- [NEW]    src/utils/csv_writer.py     — helper tạo CSV streaming
- [MODIFY] src/services/order_service.py — thêm export_orders_csv(merchant_id, from_date, to_date)
- [MODIFY] src/api/v1/orders.py        — thêm GET /orders/export?from_date=...&to_date=...

🔍 Lưu ý:
- Dùng StreamingResponse để xử lý file lớn
- CSV sẽ chứa: order_id, created_at, amount, status, customer_name

→ Anh xác nhận để tôi bắt đầu không?
```

```
USER: "Ok, làm đi."
```

---

## S5 — THỰC THI TỪNG BƯỚC

### Bước 1: Tạo csv_writer.py ✅

```
AGENT: [tạo src/utils/csv_writer.py]
→ File tạo thành công.
```

### Bước 2: Sửa order_service.py ✅

```
AGENT: [view_file src/services/order_service.py]
→ Đọc nội dung hiện tại trước khi edit (file-safety rule 3)
[replace_file_content] thêm method export_orders_csv()
→ Edit thành công.
```

### Bước 3: Sửa orders.py — GẶP LỖI → Error Recovery

```
AGENT: [replace_file_content src/api/v1/orders.py]
→ Edit thành công.
→ Chạy lint check... ❌ FAIL: "Cannot import 'StreamingResponse' from 'fastapi'"

[Error Recovery — RECOVERABLE]
→ Nguyên nhân: import sai, StreamingResponse nằm trong fastapi.responses
[Retry 1] Sửa import: from fastapi.responses import StreamingResponse
→ Lint check... ✅ PASS
→ Tiếp tục.
```

### Phát hiện scope mới → DỪNG khai báo bổ sung

```
AGENT: (đang verify endpoint)
→ Phát hiện: cần thêm from_date/to_date vào schemas/order_schema.py
   để validate query params đúng chuẩn.

📋 Cần bổ sung scope:
- [MODIFY] src/schemas/order_schema.py — thêm ExportQuerySchema

Anh cho phép tôi thêm file này vào scope không?
```

```
USER: "Được, thêm đi."
```

```
AGENT: [view_file + edit src/schemas/order_schema.py]
→ Thêm ExportQuerySchema thành công.
```

---

## S6 — BÁO CÁO KẾT QUẢ

```
✅ Đã hoàn thành:
- [NEW]    src/utils/csv_writer.py        — CSV streaming utility
- [MODIFY] src/services/order_service.py  — thêm export_orders_csv()
- [MODIFY] src/api/v1/orders.py           — thêm GET /orders/export
- [MODIFY] src/schemas/order_schema.py    — thêm ExportQuerySchema (bổ sung scope)

⚠️ Cần owner kiểm tra thủ công:
- Test endpoint: GET /orders/export?from_date=2026-01-01&to_date=2026-02-01
- Verify file CSV download đúng format

📌 Bước tiếp theo gợi ý:
- Thêm authentication check cho endpoint mới
- Giới hạn khoảng thời gian export (max 90 ngày)
- Commit: `feat(order): add CSV export endpoint with date filter`
```

---

## Skills đã phối hợp trong task này

| Bước | Skill(s) sử dụng |
|---|---|
| S0 | skill-routing → xác định cần coding + clarification |
| S1 → CLARIFICATION | clarification → hỏi format A/B/C |
| S2 | coding → khảo sát codebase (≥3 file) |
| S3-S4 | file-safety → khai báo scope, chờ confirm |
| S5 | coding → thực thi theo plan |
| S5 (lỗi) | error-recovery → RECOVERABLE, retry 1 lần → fix |
| S5 (scope mới) | file-safety → dừng, khai báo bổ sung |
| S6 | coding → báo cáo chuẩn format |
