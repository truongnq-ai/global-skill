# Changelog

## 2026.03.01 — CLI Restructure & Quality Upgrade

### Breaking Changes
- **CLI target directory thay đổi**: Skills giờ được install vào `.agent/skills/` thay vì `skills/` ở root
  - Đúng convention AI IDE (Antigravity, Gemini Code Assist, agentskills.io standard)
  - `docs/` và `examples/` giữ ở root (tài liệu cho owner, không phải agent instruction)

### Skills mới
- `skills/error-recovery/` — FSM xử lý lỗi 3 mức (RECOVERABLE, NEEDS INPUT, CRITICAL), retry limits, templates báo lỗi

### Skills nâng cấp
- Tất cả 10 skills: thêm `depends_on` và `related` vào YAML frontmatter
- Template `_templates/SKILL.md.template`: thêm dependency fields + error handling section

### Docs mới
- `docs/skill-routing.md` — Decision tree giúp agent biết cần đọc skill nào cho từng loại task
- `examples/end-to-end-example.md` — Ví dụ S0→S6 đầy đủ với CLARIFICATION + Error Recovery

### CLI
- Rewrite `bin/cli.js`:
  - `init` → tạo `.agent/skills/`, `docs/`, `examples/` (chỉ file chưa tồn tại)
  - `install` → overwrite toàn bộ lên version mới
  - Thêm `update` command (alias cho `install`)
  - Thêm `--target <path>` flag: đổi thư mục đích cho skills
  - Thêm `--dry-run` flag: preview file sẽ thay đổi
  - Output rõ ràng: số file created/overwritten/skipped

### Docs
- Cập nhật toàn bộ path references: `skills/...` → `.agent/skills/...`
  - `docs/overview.md`, `docs/fsm.md`, `docs/conventions.md`, `docs/quickstart.md`
  - `skills/coding/SKILL.md`
  - `README.md`

### Tests
- Thêm test tự động cho CLI bằng vitest

---

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
