# Changelog

## 2026.02.20 — Major Rewrite

### Triết lý & Kiến trúc
- Xác lập rõ: Global Skill = phong cách/nguyên tắc làm việc, không gắn tech stack cụ thể
- Bổ sung Auto-Accept mode awareness toàn bộ bộ skill
- Phân tách rõ Global Skill vs Project Skill

### Docs
- `docs/fsm.md` — Viết lại hoàn toàn: 7 states đầy đủ (S0–S6), CLARIFICATION state, bảng vi phạm, ví dụ luồng đúng/sai, Auto-Accept notes
- `docs/overview.md` — Bổ sung triết lý, bảng skill, quy tắc bất biến
- `docs/conventions.md` — Cập nhật phản ánh Auto-Accept và Global vs Project
- `docs/quickstart.md` — Viết lại thành hướng dẫn cài đặt CLI đầy đủ (3 cách: npx, global, source)

### Skills mới
- `skills/clarification/` — Hard blocker FSM, format A/B/C bắt buộc, 1 câu/lần
- `skills/file-safety/` — 5 quy tắc cứng, template scope khai báo, Auto-Accept guard
- `skills/docker/` — Phân loại safe/nguy hiểm, backup guide, debug container
- `skills/ssh/` — SSH config, tunnel guide, SCP/rsync, safety rules

### Skills nâng cấp (viết lại toàn bộ)
- `skills/coding/` — Generic FSM, bỏ tech-specific, Auto-Accept checkpoints
- `skills/browser/` — Tool routing table, safety rules, template task
- `skills/research/` — Decision tree chọn tool, format output chuẩn, cite rules
- `skills/github/` — Team workflow, Auto-Accept git command guard, checklist PR
- `skills/ops/` — Generic (bỏ service list cứng), incident response FSM, 3 tầng rủi ro

### Skills đã xoá
- `skills/gmail/` — Không phù hợp với global skill

### CLI (`bin/cli.js`)
- Fix bug: `init` và `install` trước đây làm y chang nhau
- `init` — chỉ tạo file chưa tồn tại (safe cho project mới)
- `install` — overwrite toàn bộ lên phiên bản mới nhất
- Thêm `--version` flag
- Cải thiện help message

### Template
- `skills/_templates/SKILL.md.template` — Cập nhật format match skill mới

---

## 2026.02.18 — Initial Release
- Init repo structure
- Add FSM docs
- Add skill templates
- Add CLI (npx @truongnq-ai/global-skill)
