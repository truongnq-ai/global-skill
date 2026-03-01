---
name: error-recovery
description: "Xử lý khi gặp lỗi giữa chừng — rollback, retry, hay báo owner"
depends_on: [clarification, file-safety]
related: [coding, ops]
---

# Error Recovery Skill

> **Áp dụng cho:** Mọi task khi agent gặp lỗi không mong đợi giữa quá trình thực thi.
> **Skill liên quan:** `.agent/skills/coding/`, `.agent/skills/ops/`

## Mục tiêu
- Không để lỗi lan truyền — dừng ngay khi phát hiện sai
- Không tự ý retry vô hạn — có giới hạn retry rõ ràng
- Luôn báo owner khi gặp lỗi ảnh hưởng đến scope hoặc kết quả

---

## FSM Error Recovery

```
[Đang thực thi (S5)]
        ↓
[Phát hiện lỗi]
        ↓
[1. DỪNG NGAY — Không tiếp tục bước tiếp theo]
        ↓
[2. Phân loại lỗi — Mức nào?]
        ↓
┌───────────────────────┬─────────────────────┬─────────────────────┐
│ RECOVERABLE           │ NEEDS INPUT         │ CRITICAL            │
│ (tự xử lý được)       │ (cần owner quyết)   │ (phải dừng hẳn)     │
├───────────────────────┼─────────────────────┼─────────────────────┤
│ → Retry (≤2 lần)      │ → Báo owner:        │ → DỪNG TOÀN BỘ     │
│ → Fix nhẹ rồi retry   │   - Mô tả lỗi       │ → Báo owner:        │
│ → Rollback bước vừa   │   - Option A/B/C     │   - Mô tả lỗi      │
│   làm nếu cần         │   - Khuyến nghị      │   - Thiệt hại       │
│                       │                     │   - Cách rollback    │
└───────────┬───────────┴──────────┬──────────┴──────────┬──────────┘
            ↓                      ↓                      ↓
     [Retry thành công?]    [Owner quyết định]      [Chờ owner]
     YES → Tiếp tục S5      → Thực hiện             → Không làm gì
     NO  → Chuyển sang                                 thêm
           NEEDS INPUT
```

---

## Phân loại lỗi

### ✅ RECOVERABLE — Agent tự xử lý (không cần hỏi owner)

| Lỗi | Cách xử lý | Giới hạn retry |
|---|---|---|
| Lint/syntax error sau khi edit | Sửa lỗi cụ thể, retry | 2 lần |
| Build fail do thiếu import | Thêm import, retry build | 2 lần |
| Command timeout (< 30s) | Retry cùng command | 1 lần |
| File không tìm thấy (typo path) | Sửa path, retry | 1 lần |
| Test fail do code vừa thay đổi | Sửa logic, retry test | 2 lần |

**Sau khi hết số retry → chuyển sang NEEDS INPUT.**

### ⚠️ NEEDS INPUT — Cần owner quyết định

| Lỗi | Tại sao cần hỏi |
|---|---|
| Build fail không rõ nguyên nhân | Có thể do dependency, environment |
| Test fail nhưng logic có vẻ đúng | Có thể test cũ sai hoặc spec thay đổi |
| Conflict giữa code mới và code cũ | Cần owner chọn approach |
| Dependency version incompatible | Cần owner đánh giá upgrade risk |
| Permission denied / access error | Có thể cần config owner chưa share |

**Format hỏi: dùng format A/B/C của `.agent/skills/clarification/SKILL.md`.**

### 🔴 CRITICAL — Dừng hẳn, báo ngay

| Lỗi | Tại sao critical |
|---|---|
| File bị xoá/corrupt ngoài ý muốn | Mất data, cần rollback |
| Database error (schema mismatch, data loss) | Không thể tự fix an toàn |
| Deploy fail trên production | Ảnh hưởng user thực |
| Secret/credential bị expose | Security incident |
| Agent đã thay đổi file sai (ngoài scope) | Vi phạm file-safety |

---

## Quy tắc bắt buộc

1. **Retry tối đa 2 lần** cho cùng một lỗi — sau đó phải escalate
2. **Không bắt lỗi rồi im lặng** — mọi lỗi phải được log hoặc report
3. **Không thay đổi approach** giữa chừng mà không báo owner — nếu retry fail cần approach khác → hỏi trước
4. **Kiểm tra rollback trước khi retry** — nếu retry có thể gây duplicate (tạo 2 lần, insert 2 lần) → rollback trước
5. **Không tiếp tục bước tiếp theo** khi bước hiện tại fail — dù các bước sau "không liên quan"

**Nghiêm cấm:**
- ❌ Retry vô hạn (loop fix → fail → fix → fail)
- ❌ Bỏ qua lỗi vì "không quan trọng" mà không báo owner
- ❌ Tự đổi approach (VD: build fail → tự chuyển sang cách khác) mà không hỏi
- ❌ Tiếp tục edit file tiếp theo khi file trước đó chưa verify xong

---

## Template báo lỗi cho owner

### Khi NEEDS INPUT:
```
⚠️ [Gặp lỗi khi thực thi]

Bước đang thực hiện: [mô tả bước]
File liên quan: [path/to/file]

Lỗi: [mô tả lỗi cụ thể]
Error message: [copy lỗi gốc nếu có]

Tôi đã thử: [mô tả retry đã làm]

Các option:
A. [Option A] — ưu / nhược
B. [Option B] — ưu / nhược

💡 Khuyến nghị: Option X — vì [lý do]

→ Anh chọn option nào?
```

### Khi CRITICAL:
```
🔴 [LỖI NGHIÊM TRỌNG — Đã dừng toàn bộ]

Bước đang thực hiện: [mô tả bước]
Lỗi: [mô tả chi tiết]

Trạng thái hiện tại:
- Đã hoàn thành: [file A, file B] ← changes đã apply
- Chưa hoàn thành: [file C, file D] ← chưa bắt đầu
- Bị ảnh hưởng: [nếu có]

Cách rollback (nếu cần):
- [bước rollback cụ thể]

→ Anh muốn tôi rollback hay thử approach khác?
```

---

## Ví dụ thực tế

### ✅ Đúng — Retry có giới hạn, escalate đúng lúc
```
AGENT: (đang sửa file thứ 2 trong plan)
→ Build fail: "Module 'utils' has no exported member 'formatDate'"

[Retry 1] Kiểm tra: formatDate không tồn tại trong utils — function tên thực là 'formatDateTime'
→ Sửa import, retry build → BUILD SUCCESS ✅
→ Tiếp tục bước tiếp theo.
```

### ✅ Đúng — Escalate sau 2 lần retry fail
```
AGENT: (đang chạy test sau khi sửa code)
→ Test fail: "Expected 200 got 401"
[Retry 1] Kiểm tra auth middleware → có vẻ đúng. Retry test → vẫn fail.
[Retry 2] Thêm mock auth → vẫn fail 401.

⚠️ [Test auth fail sau 2 lần retry]
Bước: chạy test cho endpoint POST /orders
Lỗi: Expected 200 nhưng nhận 401 — auth middleware reject request

Tôi đã thử:
1. Kiểm tra code middleware — logic có vẻ đúng
2. Thêm mock auth header — vẫn bị reject

Các option:
A. Kiểm tra auth config (có thể thiếu env variable)
B. Skip test này, hoàn thành các file còn lại trước

💡 Khuyến nghị: Option A — vì 401 thường do config

→ Anh chọn option nào?
```

### ❌ Sai — Retry vô hạn
```
AGENT: (build fail → sửa → fail → sửa → fail → sửa... ← SAI — đã quá 2 lần retry)
```

### ❌ Sai — Bỏ qua lỗi
```
AGENT: (test fail, nhưng agent nói "test này không liên quan" rồi tiếp tục) ← SAI
```
