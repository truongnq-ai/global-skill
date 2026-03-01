---
name: github
description: "Quy trình làm việc với GitHub trong team: branch, PR, review — không push thẳng lên nhánh bảo vệ"
depends_on: [clarification, file-safety]
related: [coding]
---

# GitHub Skill

> **Áp dụng cho team workflow.**  
> Branch naming convention, CI/CD config cụ thể được định nghĩa trong skill riêng của từng project.

## Mục tiêu
- Bảo vệ nhánh production khỏi code chưa qua review
- Đảm bảo mọi thay đổi có traceability: issue → branch → PR → merge
- Không có hành động git nào destructive mà không có confirm

---

## Branch Convention (mặc định)

```
main            ← production, KHÔNG push trực tiếp
develop         ← integration branch
│
├─ feature/<slug>   VD: feature/add-export-report
├─ fix/<slug>       VD: fix/order-null-discount
├─ hotfix/<slug>    VD: hotfix/payment-timeout
├─ chore/<slug>     VD: chore/upgrade-dependencies
└─ release/<ver>    VD: release/2026.03
```

> Nếu project có convention riêng → tuân theo convention project, không tự sáng tạo.

---

## Quy trình làm việc

### Bắt đầu một task mới
```bash
# 1. Pull latest trước khi tạo branch
git checkout develop && git pull origin develop

# 2. Tạo branch từ đúng base
git checkout -b feature/ten-feature develop

# 3. Làm việc, commit theo convention
git commit -m "feat(scope): mô tả ngắn"
```

### Tạo Issue
```
Trước khi tạo → search xem đã tồn tại chưa.

Bug issue cần có:
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, version, config)

Feature issue cần có:
- Business context / motivation
- Acceptance criteria
- Out of scope (nếu có)
```

### Tạo PR
```
1. Base branch đúng: feature → develop, hotfix → main
2. Title: "<type>(<scope>): <mô tả>" — VD: "feat(order): add export CSV endpoint"
3. Body bắt buộc:
   - "Closes #<issue-number>" hoặc "Relates to #<number>"
   - Tóm tắt thay đổi
   - Testing steps (manual hoặc automated)
4. Không tự merge PR của mình — đợi reviewer khác approve
5. Xử lý hết review comment trước khi merge
```

### Merge Strategy (mặc định)
```
feature → develop:  Squash merge
develop → main:     Merge commit
hotfix → main:      Merge commit + cherry-pick sang develop
```

---

## Quy tắc bắt buộc

1. **Không push trực tiếp** lên `main`, `develop`
2. **Không force push** lên nhánh đang có người khác làm việc
3. **Không tự merge PR** khi làm việc trong team
4. **Không commit secrets** — nếu lỡ commit: revoke key ngay, xoá khỏi history ngay
5. **Không thay đổi `.github/workflows/`** mà không có plan rõ ràng
6. **Không chạy `git reset --hard`** trên nhánh shared mà không confirm

---

## ⚠️ Auto-Accept mode — Git operations cần đặc biệt cẩn thận

Khi Auto-Accept ON, agent có thể tự chạy nhiều git command liên tiếp. **Các lệnh sau đây KHÔNG được auto-run mà không có confirm rõ ràng trong turn hiện tại:**

| Lệnh | Lý do |
|---|---|
| `git push origin main` | Push thẳng lên production |
| `git reset --hard HEAD~N` | Mất commit không thể recover dễ |
| `git push --force` / `--force-with-lease` | Rewrite public history |
| `gh pr merge` | Merge là hành động không reversible |
| `git branch -D` | Xoá branch |

---

## Checklist trước khi tạo PR

```
[ ] Pull latest từ base branch trước khi bắt đầu?
[ ] Branch đặt tên đúng convention?
[ ] Không có credentials/secrets trong commit?
[ ] Không có debug log / commented-out code?
[ ] PR title đúng format Conventional Commits?
[ ] PR body có link issue và testing steps?
[ ] Base branch đúng (không nhầm develop ↔ main)?
[ ] CI pass (nếu có)?
```

---

## Lệnh hay dùng

```bash
# Tạo branch từ develop
git checkout -b feature/ten-feature develop

# Xem diff trước khi commit
git diff --staged
git status

# Commit đúng format
git commit -m "feat(order): add export CSV endpoint"

# Push branch lần đầu
git push -u origin feature/ten-feature

# Tạo PR bằng GitHub CLI
gh pr create --base develop \
  --title "feat(order): add export CSV endpoint" \
  --body "Closes #42"

# Xem CI status
gh pr checks

# Xem diff của PR
gh pr diff
```
