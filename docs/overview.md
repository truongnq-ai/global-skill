# Tổng quan — global-skill

`global-skill` là repo tập trung các kỹ năng (skill) **dùng chung** cho mọi AI IDE/agent trên tất cả thiết bị và dự án.

---

## Triết lý thiết kế

### Global Skill = Phong cách & Nguyên tắc làm việc
Bộ skill này **không** chứa tech stack, project structure, hay business rule cụ thể.

Global skill định nghĩa:
- **Cách làm việc**: FSM, quy trình phân tích → action
- **Cách ra quyết định**: format clarification A/B/C, khi nào dừng hỏi
- **Safety rules**: bảo vệ file, dữ liệu, hệ thống
- **Cross-tool behavior**: browser, git, ssh, docker

### Project Skill = Kỹ thuật và Context Cụ Thể
Mỗi project tạo bộ skill riêng cho:
- Tech stack (framework, ORM, migration tool...)
- Project structure và naming convention
- Service inventory (container names, ports...)
- Business rules và domain logic

> Global skill không thay thế project skill, mà là **nền tảng mà project skill xây dựng lên trên**.

---

## ⚠️ Auto-Accept Mode

Các project của owner **cho phép Auto-Accept mode** — AI agent có thể tự thực thi nhiều bước liên tiếp.

Điều này có nghĩa:
- **Clarification** là cơ chế dừng duy nhất — phải dừng đúng lúc, đúng format
- **File Safety** phải được tuân thủ tuyệt đối — không có "minor exception"
- **Destructive actions** luôn cần confirm rõ ràng trong turn hiện tại

---

## Quy tắc bất biến (áp dụng mọi skill, mọi project)

1. **Phân tích trước, thực thi sau** — không làm tắt
2. **Khai báo scope trước khi ghi file** — không surprise
3. **Khi mơ hồ → dừng hỏi A/B/C** — không tự quyết định thay owner
4. **Không tạo file `.md` tự động** nếu không được yêu cầu rõ ràng
5. **Không hardcode secrets** vào file nào trong repo
6. **Ngôn ngữ mặc định**: tiếng Việt cho giải thích; tiếng Anh cho code, tên file, thuật ngữ kỹ thuật

---

## Danh sách Skill

| Skill | Thư mục | Vai trò |
|---|---|---|
| **Clarification** | `skills/clarification/` | Hard blocker — format hỏi A/B/C, trigger conditions |
| **File Safety** | `skills/file-safety/` | Kiểm soát scope, bảo vệ file ngoài plan |
| **Coding** | `skills/coding/` | FSM coding, quy tắc ngôn ngữ, commit convention |
| **Browser** | `skills/browser/` | Tự động hoá trình duyệt an toàn |
| **Research** | `skills/research/` | Tìm kiếm có nguồn, chọn đúng tool |
| **GitHub** | `skills/github/` | Branch, PR, review — team workflow |
| **Ops** | `skills/ops/` | Vận hành hệ thống, incident response |
| **Docker** | `skills/docker/` | Container management an toàn |
| **SSH** | `skills/ssh/` | Kết nối, tunnel, file transfer |

---

## Cấu trúc repo

```
global-skill/
├── skills/
│   ├── _templates/        # Template tạo skill mới
│   ├── clarification/     # ← Đọc trước tiên
│   ├── file-safety/       # ← Đọc trước tiên
│   ├── coding/
│   ├── browser/
│   ├── research/
│   ├── github/
│   ├── ops/
│   ├── docker/
│   └── ssh/
├── docs/
│   ├── overview.md        # File này
│   ├── fsm.md
│   ├── conventions.md
│   └── quickstart.md
└── examples/
    ├── prompt_snippets.md
    └── use_cases.md
```
