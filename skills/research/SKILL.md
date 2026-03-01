---
name: research
description: "Tìm kiếm và tổng hợp thông tin có nguồn — chọn đúng tool, output chuẩn"
depends_on: []
related: [browser]
---

# Research Skill

## Mục tiêu
- Trả lời câu hỏi kỹ thuật hoặc nghiệp vụ dựa trên nguồn thực tế
- Không phỏng đoán — mọi kết luận phải có nguồn trích dẫn
- Phân biệt rõ đâu là fact, đâu là suy luận

---

## Chọn Tool Đúng

```
Câu hỏi: Cần loại thông tin gì?
│
├─ Thông tin từ URL cụ thể, trang tĩnh, docs?
│   └─→ read_url_content  (nhanh, không JS)
│
├─ Tìm kiếm tổng quát trên internet?
│   └─→ search_web
│
├─ Trang cần đăng nhập / có JS / visual?
│   └─→ browser_subagent  (nặng nhất, dùng cuối)
│
├─ Tìm trong codebase?
│   └─→ grep_search, find_by_name, view_file_outline
│
└─ Tìm trong conversation/knowledge trước?
    └─→ KI system (knowledge items)
```

---

## Quy trình Research

**Bước 1 — Xác định câu hỏi cần trả lời**
- Reformulate câu hỏi thành dạng chính xác, có thể kiểm chứng được.
- Ví dụ: "FastAPI có hỗ trợ background task không?" → "FastAPI BackgroundTasks API: cách dùng, giới hạn, và so sánh với Celery"

**Bước 2 — Chọn nguồn và tool**
- Ưu tiên: official docs > GitHub issues/PR > Stack Overflow > blog
- Không dùng blog cá nhân làm nguồn duy nhất cho thông tin kỹ thuật quan trọng

**Bước 3 — Thu thập thông tin**
- Nếu dùng `search_web`: đọc ít nhất 2-3 kết quả trước khi kết luận
- Nếu dùng `read_url_content`: trích dẫn đoạn văn gốc, không paraphrase sai ý

**Bước 4 — Tổng hợp và báo cáo**
- Dùng format output chuẩn (xem bên dưới)
- Phân biệt rõ: "Theo doc chính thức..." vs "Có thể là..." vs "Tôi suy luận..."

---

## Format Output Chuẩn

```markdown
## Câu hỏi
<câu hỏi đã được reformulate>

## Kết quả

### Fact (có nguồn)
- <nội dung> — [Nguồn: <tên nguồn>](<url>)

### Nhận xét / Suy luận
- <nội dung> *(không có nguồn trực tiếp, dựa trên suy luận)*

## Kết luận
<tóm tắt ngắn gọn, actionable>

## Khuyến nghị tiếp theo *(nếu cần)*
- ...
```

---

## Quy tắc

1. **Không hallucinate** — nếu không tìm được nguồn → nói rõ "Không tìm được nguồn xác nhận"
2. **Trích dẫn URL cụ thể**, không chỉ nói "theo documentation"
3. **Ghi ngày truy cập** khi thông tin có thể expire (API version, pricing, availability)
4. **Không dùng thông tin cũ hơn 2 năm** cho các vấn đề về framework, cloud service trừ khi hỏi về legacy
5. **Phân tầng độ tin cậy**: official docs > GitHub main branch > blog có ngày rõ ràng

---

## Ví dụ thực tế

### ✅ Đúng — Research có nguồn
```
USER: FastAPI có rate limiting built-in không?

AGENT:
## Câu hỏi
FastAPI có cơ chế rate limiting built-in không, và nếu không thì giải pháp nào phù hợp?

## Kết quả

### Fact
- FastAPI không có rate limiting built-in. — [Source: FastAPI docs](https://fastapi.tiangolo.com/advanced/)
- Giải pháp phổ biến: `slowapi` (wrapper của `limits`). — [GitHub: laurentS/slowapi](https://github.com/laurentS/slowapi)

### Suy luận
- Nếu đang dùng nginx thì rate limit ở layer nginx sẽ hiệu quả hơn app-level.

## Kết luận
Cần cài thêm library. Recommend `slowapi` nếu cần simple rate limit trong app.
```

### ❌ Sai — Trả lời không có nguồn
```
AGENT: FastAPI có built-in rate limiting, anh dùng decorator @rate_limit() là được. ← SAI (hallucinate)
```
