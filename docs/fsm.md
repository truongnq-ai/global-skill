# FSM — Quy Trình Làm Việc Bắt Buộc của AI Agent

> Tài liệu này định nghĩa chuỗi trạng thái (state machine) mà mọi AI agent **bắt buộc** tuân thủ khi nhận và xử lý yêu cầu từ owner.  
> Không có ngoại lệ. Không bỏ qua bước. Không đảo ngược thứ tự.

---

## Sơ đồ tổng thể

```
                    ┌──────────────────────┐
                    │   S0. NHẬN YÊU CẦU   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  S1. PHÂN TÍCH YÊU   │
                    │      CẦU             │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Hiểu rõ yêu cầu?    │
                    └──────────┬───────────┘
                       NO ◄────┘────► YES
                        │               │
                        ▼               ▼
               ┌────────────────┐  ┌────────────────────┐
               │  CLARIFICATION │  │ S2. KHẢO SÁT       │
               │  (Hỏi A/B/C)  │  │     CODEBASE       │
               └────────┬───────┘  └────────┬───────────┘
                        │                   │
                    [Owner trả lời]          ▼
                        │          ┌─────────────────────┐
                        └─────────►│ S3. XÁC ĐỊNH SCOPE  │
                                   │    & LẬP KẾ HOẠCH   │
                                   └────────┬────────────┘
                                            │
                                 ┌──────────▼──────────┐
                                 │ Còn điểm mơ hồ?     │
                                 └──────────┬──────────┘
                                    YES ◄───┘───► NO
                                     │              │
                                     ▼              ▼
                            ┌──────────────┐  ┌──────────────────┐
                            │ CLARIFICATION│  │ S4. TRÌNH BÀY    │
                            │ (Hỏi A/B/C) │  │     KẾ HOẠCH     │
                            └──────┬───────┘  │  (Chờ confirm)   │
                                   │          └────────┬─────────┘
                               [Owner]                 │
                               quyết định          [Owner confirm]
                                   │                   │
                                   └────────────────►  ▼
                                             ┌──────────────────┐
                                             │ S5. THỰC THI     │
                                             │    TỪNG BƯỚC     │
                                             └────────┬─────────┘
                                                      │
                                          ┌───────────▼──────────┐
                                          │ Phát hiện scope mới? │
                                          └───────────┬──────────┘
                                             YES ◄────┘────► NO
                                              │                │
                                              ▼                ▼
                                     ┌──────────────┐  ┌─────────────────┐
                                     │ DỪNG, thêm   │  │ S6. BÁO CÁO     │
                                     │ scope → S4   │  │     KẾT QUẢ     │
                                     └──────────────┘  └─────────────────┘
```

---

## Mô tả chi tiết từng State

---

### S0 — NHẬN YÊU CẦU

**Nhiệm vụ:** Đọc và hiểu toàn bộ ngữ cảnh trước khi làm bất kỳ điều gì.

**Bắt buộc phải đọc:**
- Nội dung yêu cầu của owner
- File/code đang mở (nếu có trong context)
- Các skill liên quan trong `.agent/skills/`

**Output của state này:**
> Tóm tắt lại yêu cầu bằng 1-3 câu để xác nhận hiểu đúng.

**Điều kiện chuyển sang S1:** Đã đọc xong tất cả context.

**Nghiêm cấm:**
- ❌ Bắt đầu gõ code ngay khi đọc xong yêu cầu
- ❌ Giả định context mà không đọc file thực tế

---

### S1 — PHÂN TÍCH YÊU CẦU

**Nhiệm vụ:** Xác định chắc chắn đây là yêu cầu **gì**, **tại sao**, **phạm vi đến đâu**.

**Câu hỏi phải trả lời được:**
1. Yêu cầu này muốn đạt kết quả gì cụ thể?
2. Có từ ngữ vague không? ("cải thiện", "tối ưu", "refactor", "fix lỗi này")
3. Có ràng buộc kỹ thuật nào không (version, compatibility, backward compat)?
4. Có rủi ro nào với yêu cầu này không?

**Điều kiện chuyển sang S2:** Có thể trả lời tất cả 4 câu trên **mà không cần đoán mò**.

**Điều kiện rẽ sang CLARIFICATION:** Không trả lời được bất kỳ câu nào trong 4 câu trên mà không phỏng đoán.

**Nghiêm cấm:**
- ❌ Chuyển sang S2 khi còn câu hỏi chưa có câu trả lời chắc chắn
- ❌ Phỏng đoán ý định của owner và làm theo phỏng đoán đó

---

### S2 — KHẢO SÁT CODEBASE

**Nhiệm vụ:** Đọc code thực tế — không đoán structure, không giả định pattern.

**Tools bắt buộc sử dụng (theo thứ tự ưu tiên):**
```
1. view_file_outline    → thấy toàn cảnh file/module
2. grep_search          → tìm function, class, pattern cụ thể
3. find_by_name         → tìm file theo tên hoặc extension
4. view_file            → đọc nội dung chi tiết
```

**Quy tắc khảo sát:**
- Đọc tối thiểu **3 file liên quan** trước khi kết luận cần sửa gì
- Nếu không tìm thấy file cần thiết sau khi search → đây là trigger CLARIFICATION, không phải lý do để đoán mò
- Ghi chú lại: pattern đang dùng là gì, convention như thế nào

**Output của state này:**
> Báo cáo ngắn: "Codebase hiện tại có [X]. Phần liên quan đến yêu cầu là [Y]. Pattern đang dùng là [Z]."

**Điều kiện chuyển sang S3:** Đã hiểu rõ context kỹ thuật, biết chính xác cần sửa/thêm gì và ở đâu.

**Nghiêm cấm:**
- ❌ Suy luận structure mà không đọc file thực tế
- ❌ Bỏ qua bước này vì "task có vẻ đơn giản"
- ❌ Dùng kiến thức về framework để đoán convention của project này

---

### S3 — XÁC ĐỊNH SCOPE & LẬP KẾ HOẠCH

**Nhiệm vụ:** Quyết định chính xác những gì sẽ thay đổi và thứ tự thực hiện.

**Output bắt buộc (Scope Declaration):**
```
📋 Scope thay đổi:

[MODIFY] path/to/file_a     — lý do
[MODIFY] path/to/file_b     — lý do
[NEW]    path/to/new_file   — tạo mới vì...
[DELETE] path/to/old_file   — xoá vì...

Thứ tự thực hiện: file_a → file_b → new_file
Điểm cần chú ý / rủi ro: ...
```

**Điều kiện chuyển sang S4:** Scope đã rõ, không còn điểm mơ hồ nào về kỹ thuật.

**Điều kiện rẽ sang CLARIFICATION:**
- Scope có ≥2 hướng implement khác nhau có trade-off
- Không chắc nên chọn approach nào
- Thấy conflict với pattern hiện tại của project

**Nghiêm cấm:**
- ❌ Bắt đầu code khi scope vẫn còn "dự kiến"
- ❌ Tự chọn approach khi có ≥2 option hợp lý
- ❌ Liệt kê scope mơ hồ ("sửa các file liên quan")

---

### S4 — TRÌNH BÀY KẾ HOẠCH & CHỜ CONFIRM

**Nhiệm vụ:** Trình bày rõ ràng cho owner **trước khi thực thi**.

**Khi nào bắt buộc trình bày và chờ confirm:**
| Điều kiện | Phải chờ confirm? |
|---|---|
| Thay đổi ≥3 file | ✅ Bắt buộc |
| Tạo file mới | ✅ Bắt buộc |
| Xoá file | ✅ Bắt buộc |
| Thay đổi có thể ảnh hưởng behavior của hệ thống | ✅ Bắt buộc |
| Thay đổi ≤2 file, rõ ràng, low risk | Có thể thực thi ngay (nhưng vẫn thông báo scope) |

**Format trình bày:**
```
Tôi sẽ thực hiện:

📋 Scope:
- [MODIFY] ...
- [NEW] ...

🔍 Lưu ý:
- Thay đổi này ảnh hưởng đến [X]
- Rủi ro: [Y]

→ Anh xác nhận để tôi bắt đầu không?
```

**Điều kiện chuyển sang S5:** Owner đã confirm ("ok", "làm đi", "được").

**Điều kiện không được chuyển sang S5:** Chưa nhận được confirm rõ ràng — **kể cả khi đang ở Auto-Accept mode.**

**Nghiêm cấm:**
- ❌ Tự diễn giải "im lặng" hoặc "context trước" là confirm
- ❌ Skip S4 vì "owner chắc chắn muốn vậy"
- ❌ Confirm thay cho owner ("Tôi đoán anh muốn vậy, nên tôi sẽ tiến hành")

---

### S5 — THỰC THI TỪNG BƯỚC

**Nhiệm vụ:** Thực hiện đúng và đủ những gì đã được confirm trong S4. Không hơn.

**Quy tắc thực thi:**
- Thực thi theo **thứ tự đã khai báo** trong plan
- Sau mỗi file: kiểm tra lại nếu có tool (lint, syntax check)
- Ưu tiên `replace_file_content` / `multi_replace_file_content` thay vì overwrite toàn bộ file

**Phát hiện scope mới trong khi thực thi:**
> Nếu giữa chừng thấy cần sửa thêm file **ngoài danh sách đã confirm** → **DỪNG NGAY**, không tự ý làm, quay về S4 để khai báo bổ sung.

```
AGENT: (đang sửa file thứ 2)
→ Phát hiện cần cập nhật thêm file_c ngoài plan.

📋 Cần bổ sung scope:
- [MODIFY] path/to/file_c — lý do cụ thể

Anh cho phép tôi thêm không?
```

**Điều kiện chuyển sang S6:** Đã thực thi xong **tất cả** file trong scope đã confirm, không còn việc nào.

**Nghiêm cấm:**
- ❌ Sửa file ngoài scope dù thấy "tiện tay"
- ❌ Rename, move file không có trong plan
- ❌ Tạo file documentation tự động
- ❌ Chạy lệnh side-effect (migrate, restart, deploy) không có trong plan

---

### S6 — BÁO CÁO KẾT QUẢ

**Nhiệm vụ:** Tóm tắt những gì đã làm để owner kiểm tra.

**Format báo cáo:**
```
✅ Đã hoàn thành:
- [MODIFY] path/to/file_a — mô tả thay đổi
- [NEW]    path/to/file_b — mô tả nội dung

⚠️ Cần owner kiểm tra thủ công:
- [nếu có điểm cần verify]

📌 Bước tiếp theo gợi ý:
- [nếu cần]
```

**Nghiêm cấm:**
- ❌ Tiếp tục thêm "bonus changes" trong lúc báo cáo
- ❌ Tự động deploy/test/commit sau khi xong mà không có yêu cầu

---

## CLARIFICATION State

> Khi bị kích hoạt, state này **override tất cả** — dù agent đang ở bước nào.

**Có thể được kích hoạt từ:** S1, S2, S3, S5

**Bắt buộc kích hoạt khi:**
- Yêu cầu có ≥2 cách hiểu khác nhau về mặt kỹ thuật hoặc nghiệp vụ
- Không tìm thấy file/function cần thiết sau khi đã search đầy đủ
- Scope lớn hơn dự kiến đáng kể
- Thay đổi có khả năng mất data hoặc không reversible
- Có conflict giữa yêu cầu mới và pattern hiện tại
- Quyết định ảnh hưởng đến architecture hoặc convention chung
- Naming convention chưa có pattern rõ trong project

**Format output (xem `.agent/skills/clarification/SKILL.md` để biết đầy đủ):**
```
❓ [Tên vấn đề]
<Mô tả điểm mơ hồ>

A. <Option A> — ưu / nhược
B. <Option B> — ưu / nhược

💡 Khuyến nghị: Option X — vì...

→ Anh chọn option nào?
```

**Điều kiện thoát khỏi CLARIFICATION:** Owner đã đưa ra quyết định rõ ràng.

**Sau khi nhận quyết định:** Xác nhận ngắn gọn, quay về state phù hợp để tiếp tục.

---

## Bảng vi phạm thường gặp

| Vi phạm | State bị vi phạm | Hậu quả |
|---|---|---|
| Đoán ý owner rồi làm luôn | S1 → skip CLARIFICATION | Sai hướng toàn bộ task |
| Không đọc file, giả định structure | S2 | Sửa sai convention, tạo file sai chỗ |
| Scope mơ hồ ("các file liên quan") | S3 | Không kiểm soát được phạm vi thay đổi |
| Không chờ confirm trước khi thực thi | S4 → S5 | Owner không biết agent đang làm gì |
| Tự ý sửa file ngoài scope khi đang thực thi | S5 | Thay đổi không được phê duyệt |
| Tự chạy migrate/deploy sau khi xong | S6 | Side-effect không mong muốn |

---

## Ví dụ: Luồng đúng vs sai

### ✅ Luồng đúng

```
USER: "Thêm field `note` vào entity Order, cho phép user ghi chú khi đặt hàng."

AGENT [S0]: Đọc yêu cầu. Đọc file đang mở.
AGENT [S1]: Rõ ràng — thêm optional text field `note` vào Order. Không mơ hồ.
AGENT [S2]: 
  → grep_search: tìm "Order" model/entity
  → view_file: đọc file model, schema, API
  → Kết quả: project dùng SQLAlchemy + Marshmallow, file nằm ở src/models/
AGENT [S3]: 
  Scope:
  - [MODIFY] src/models/order.py — thêm column note (Text, nullable)
  - [MODIFY] src/schemas/order_schema.py — thêm field note
  - [MODIFY] src/api/v1/orders.py — accept note trong POST body
AGENT [S4]: 
  Trình bày scope 3 file → "Anh xác nhận không?"
USER: "Ok làm đi."
AGENT [S5]: Thực thi đúng 3 file theo thứ tự.
AGENT [S6]: Báo cáo xong, gợi ý test thủ công endpoint POST /orders.
```

### ❌ Luồng sai (vi phạm nhiều state)

```
USER: "Thêm field `note` vào Order."

AGENT: (không đọc codebase, giả định dùng Django ORM)  ← vi phạm S2
       (tự chọn String 255 chars vì "có vẻ hợp lý")    ← vi phạm S3
       (không trình bày plan, bắt đầu code luôn)        ← vi phạm S4
       (tự ý thêm migration, tự ý commit)               ← vi phạm S5, S6
```

---

## Lưu ý đặc biệt — Auto-Accept Mode

Khi owner bật **Auto-Accept mode**, agent có thể thực thi nhiều bước liên tiếp tự động. Điều này **không miễn trừ** bất kỳ state nào trong FSM trên.

Nguyên tắc với Auto-Accept:
- **S1 → CLARIFICATION**: Vẫn bắt buộc dừng nếu yêu cầu mơ hồ
- **S4**: Vẫn bắt buộc trình bày plan với task phức tạp — đây là **checkpoint không thể skip**
- **Destructive actions**: Luôn cần confirm rõ ràng trong turn hiện tại, không được inherit từ confirm trước
