# global-skill

Repo kỹ năng dùng chung cho tất cả AI agent / IDE trên mọi thiết bị và dự án.

## Triết lý

**Global Skill = Phong cách & Nguyên tắc làm việc** (không gắn với tech stack cụ thể)
- Cách làm việc, cách ra quyết định, safety rules
- Áp dụng mọi project, mọi ngôn ngữ, mọi framework

**Project Skill = Kỹ thuật & Context Cụ Thể** (tạo riêng cho từng project)
- Tech stack, project structure, business rules

## ⚠️ Auto-Accept Mode

Owner cho phép Auto-Accept mode. Mọi AI agent khi dùng bộ skill này phải:
- **Dừng hỏi A/B/C** khi gặp điểm mơ hồ — xem `skills/clarification/`
- **Khai báo scope** trước khi sửa file — xem `skills/file-safety/`
- **Không auto-run** các lệnh destructive

## Cài đặt (CLI)
```bash
npx @truongnq-ai/global-skill init     # scaffold trong project mới
npx @truongnq-ai/global-skill install  # copy vào project hiện tại
```

## Cấu trúc
- `skills/` — các skill độc lập, đọc SKILL.md để biết cách áp dụng
- `docs/` — FSM, conventions, quickstart
- `examples/` — prompt mẫu, use cases

> Đọc `docs/overview.md` để hiểu đầy đủ triết lý và danh sách skill.

## Versioning: Date-based `YYYY.MM.DD`
