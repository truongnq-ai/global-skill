---
name: clarification
description: "Hard blocker khi gặp điểm mơ hồ — DỪNG TOÀN BỘ, không tự quyết định thay owner"
---

# Clarification Skill

## ⚠️ Đây là cơ chế DỪNG DUY NHẤT trong Auto-Accept Mode

Khi Auto-Accept mode được bật, AI agent có thể tự thực thi nhiều bước liên tiếp mà không cần confirm. **Clarification là cơ chế duy nhất để dừng chuỗi đó lại.** Nếu không dừng đúng lúc → agent sẽ tự ý làm sai hướng nhiều bước trước khi owner phát hiện.

**Nguyên tắc tối thượng:**
> Thà dừng lại hỏi 1 lần thừa, còn hơn tự chạy sai 10 bước.

---

## Mục tiêu
- Không bao giờ tự suy luận rồi làm thay khi yêu cầu còn chưa rõ
- Hỏi đúng format để owner ra quyết định nhanh, đúng
- Bảo vệ khỏi sai hướng không thể rollback

---

## Khi nào PHẢI dừng — Không có ngoại lệ

Bắt buộc dừng toàn bộ khi gặp BẤT KỲ tình huống nào sau:

| Tình huống | Ví dụ |
|---|---|
| Yêu cầu có nhiều cách hiểu | "Thêm field discount" — % hay số tiền hay boolean? |
| Thiếu thông tin kỹ thuật quan trọng | Chưa rõ type, default value, constraint |
| Thay đổi ảnh hưởng ngoài scope dự kiến | Sửa 1 file nhưng cần sửa thêm 3 file khác ngoài plan |
| Hành động không thể rollback | Xoá data, drop table, overwrite config production |
| Conflict giữa yêu cầu mới và pattern hiện tại | Ngược convention đang có trong project |
| Không tìm được file/function cần thiết | Search hết khả năng vẫn không ra |
| **Scope lớn hơn dự kiến** | Plan ban đầu 3 file nhưng thực tế cần 7 file |
| **Quyết định ảnh hưởng architecture** | Thay đổi cách tổ chức module, pattern lớn |

---

## Format hỏi bắt buộc (A/B/C)

```
**❓ [Tên vấn đề cần làm rõ]**
<Mô tả ngắn: đây là điểm mơ hồ gì, tại sao không tự quyết được>

**Các lựa chọn:**

**A. <Tên option A>**
- Cách làm: <mô tả>
- Ưu: <...>
- Nhược / Rủi ro: <...>

**B. <Tên option B>**
- Cách làm: <mô tả>
- Ưu: <...>
- Nhược / Rủi ro: <...>

**C. <Tên option C>** *(nếu có)*
- Cách làm: <mô tả>
- Ưu: <...>
- Nhược / Rủi ro: <...>

💡 **Khuyến nghị:** Option <X> — vì <lý do cụ thể>

→ Anh chọn option nào?
```

---

## Quy tắc bắt buộc khi hỏi

1. **Tối đa 1 câu hỏi một lần** — nếu có nhiều, hỏi câu quan trọng và unblock nhất trước
2. **Luôn kèm khuyến nghị** — không hỏi "A hay B?" mà không phân tích
3. **Không tự chọn rồi làm luôn** — dù option nào có vẻ "hiển nhiên" hay "minor"
4. **Sau khi nhận quyết định** → xác nhận ngắn trước khi thực thi: "Hiểu rồi, sẽ làm option B. Bắt đầu từ..."
5. **Không hỏi những thứ có thể tự tìm** — dùng `view_file`, `grep_search`, `find_by_name` hết khả năng trước

---

## Những thứ KHÔNG ĐƯỢC coi là "minor" để tự quyết

Dù nghe có vẻ nhỏ, vẫn phải hỏi:
- Naming convention của biến/function/file mới khi chưa có pattern rõ trong project
- Default value cho field mới
- Thứ tự xử lý khi có dependency giữa các bước
- Chọn library/approach khi có ≥2 lựa chọn hợp lý

---

## Ví dụ thực tế

### ✅ Đúng — Dừng đúng lúc trong Auto-Accept mode
```
USER: Thêm tính năng giới hạn số lần đặt hàng của user.

AGENT: [đang research codebase...]
→ Phát hiện 2 approach khả thi, khác nhau về trade-off.

❓ [Cơ chế giới hạn đơn hàng]
Tìm thấy 2 approach và cần anh quyết định trước khi implement:

A. Giới hạn theo ngày (VD: 5 đơn/ngày)
- Cách làm: COUNT đơn trong 24h qua
- Ưu: Đơn giản, dễ explain với user
- Nhược: Cần index trên created_at

B. Giới hạn theo đơn đang active (VD: 3 đơn chưa xong)
- Cách làm: COUNT đơn có status IN ('pending', 'processing')
- Ưu: Kiểm soát tải tốt hơn
- Nhược: Phức tạp hơn nếu đơn bị delay lâu

💡 Khuyến nghị: Option B — phù hợp hơn cho ordering system.

→ Anh chọn option nào?
```

### ❌ Sai — Auto-chọn vì "có vẻ hiển nhiên"
```
AGENT: (tự chọn theo ngày vì thấy đơn giản hơn, implement luôn 5 file) ← SAI
→ Owner nhận ra sai hướng sau khi agent đã đi 6 bước
```

### ❌ Sai — Hỏi không đủ format
```
AGENT: Anh muốn limit theo ngày hay theo active orders? ← SAI
→ Không phân tích, không có trade-off, không khuyến nghị
```
