# Skill Routing — Agent đọc skill nào cho task nào?

> Tài liệu này giúp AI agent **nhanh chóng xác định** cần đọc skill nào khi nhận yêu cầu.
> Áp dụng ở bước S0 (Nhận yêu cầu) của FSM.

---

## Quy tắc routing

### Luôn đọc (mọi task, mọi context)

```
.agent/skills/clarification/SKILL.md   ← Khi nào phải dừng hỏi
.agent/skills/file-safety/SKILL.md     ← Scope + file safety
```

> Hai skill này là **nền tảng an toàn** — không bao giờ bỏ qua.

---

### Routing theo loại task

```
Nhận yêu cầu từ owner
│
├─ Task liên quan đến code (thêm/sửa/xoá code)?
│   └─→ .agent/skills/coding/SKILL.md
│       └─ Có thao tác git (commit, branch, PR)?
│           └─→ .agent/skills/github/SKILL.md
│
├─ Task cần tìm kiếm / research thông tin?
│   └─→ .agent/skills/research/SKILL.md
│       └─ Cần truy cập URL / trang web cụ thể?
│           └─→ .agent/skills/browser/SKILL.md
│
├─ Task liên quan đến server / VPS / hệ thống?
│   └─→ .agent/skills/ops/SKILL.md
│       ├─ Có thao tác Docker container?
│       │   └─→ .agent/skills/docker/SKILL.md
│       └─ Cần kết nối SSH / tunnel / copy file?
│           └─→ .agent/skills/ssh/SKILL.md
│
├─ Task cần thao tác trình duyệt (fill form, click, scrape)?
│   └─→ .agent/skills/browser/SKILL.md
│
└─ Task bị lỗi giữa chừng?
    └─→ .agent/skills/error-recovery/SKILL.md
```

---

## Bảng nhanh — Keyword → Skill

| Keyword trong yêu cầu | Skill cần đọc |
|---|---|
| thêm field, sửa code, fix bug, refactor, tối ưu | `coding` |
| tìm kiếm, so sánh, giải pháp, docs, research | `research` |
| commit, push, branch, PR, merge, review | `github` |
| deploy, restart, log, status, incident, down | `ops` |
| container, docker, compose, image, volume | `docker` |
| SSH, VPS, tunnel, SCP, rsync, server | `ssh` |
| browser, URL, trang web, đăng nhập, click | `browser` |
| lỗi, fail, timeout, crash, rollback, retry | `error-recovery` |

---

## Ví dụ routing

### Task: "Thêm endpoint export CSV cho đơn hàng"
```
→ coding (thêm code)
→ file-safety (scope control)
→ clarification (format CSV hay Excel?)
```

### Task: "Service bot bị down, check giúp anh"
```
→ ops (incident response)
→ docker (nếu chạy container)
→ ssh (nếu cần kết nối VPS)
```

### Task: "Tìm hiểu xem FastAPI có hỗ trợ WebSocket không"
```
→ research (tìm thông tin)
→ browser (nếu cần đọc docs online)
```

### Task: "Tạo PR cho feature vừa làm xong"
```
→ github (branch, PR workflow)
→ coding (commit convention)
```
