# Quy ước chung — global-skill

## Nguyên tắc cốt lõi

1. **Phân tích trước, thực thi sau** — không bao giờ làm tắt
2. **Khai báo scope trước khi ghi file** — xem `.agent/skills/file-safety/SKILL.md`
3. **Dừng hỏi A/B/C khi mơ hồ** — xem `.agent/skills/clarification/SKILL.md`
4. **Không tạo `.md` tự động** trừ khi được yêu cầu rõ ràng
5. **Không commit secrets** vào repo bất kỳ

## Phạm vi của Global Skill

**Global Skill** chứa:
- Quy trình làm việc, FSM, cách ra quyết định
- Safety rules (file, ops, git)
- Cross-tool behavior (browser, docker, ssh)

**Global Skill KHÔNG chứa:**
- Tech stack cụ thể (framework, ORM, migration tool)
- Project structure, naming convention cụ thể
- Service inventory (container names, ports)
- Business rules, domain logic

> Tất cả những thứ trên thuộc về **Project Skill** riêng của từng project.

## Auto-Accept Mode

Owner cho phép **Auto-Accept mode**. Điều này có nghĩa:
- Agent có thể tự thực thi nhiều bước liên tiếp
- **Clarification** là cơ chế dừng duy nhất — phải dừng đúng lúc
- **S4 (Trình bày kế hoạch)** vẫn là checkpoint bắt buộc với task phức tạp
- Các lệnh destructive luôn cần confirm rõ ràng trong turn hiện tại

## Quy tắc mỗi Skill

- Mỗi skill là **nhỏ, chuyên biệt** — một skill một mục tiêu
- Mỗi skill có file `SKILL.md` với YAML frontmatter
- Mỗi skill phải có: Mục tiêu, Quy trình, Ví dụ đúng, Ví dụ sai
- Ngôn ngữ: tiếng Việt cho giải thích, tiếng Anh cho code và thuật ngữ kỹ thuật

## Tham chiếu

- Quy trình tổng thể: `docs/fsm.md`
- Tạo skill mới: `docs/quickstart.md`
- Danh sách skill: `docs/overview.md`
