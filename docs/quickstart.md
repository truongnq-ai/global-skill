# Quickstart — Cài đặt và Sử dụng global-skill

## Yêu cầu

- **Node.js** >= 18 (kiểm tra: `node -v`)
- **npm** hoặc **npx** (đi kèm với Node.js)
- Package được publish tại: `@truongnq-ai/global-skill`

---

## Cách 1: Dùng trực tiếp qua `npx` (không cần cài toàn cục)

### Khởi tạo trong project mới (chưa có skill nào)

```bash
cd /path/to/your-project
npx @truongnq-ai/global-skill init
```

Lệnh này sẽ **tạo mới** (chỉ tạo nếu chưa tồn tại, không overwrite):
```
your-project/
├── .agent/skills/    ← skills cho AI agent (auto-detected bởi IDE)
├── docs/             ← documentation cho owner
└── examples/         ← prompt mẫu cho owner
```

### Cập nhật vào project đã có (overwrite lên version mới nhất)

```bash
cd /path/to/your-project
npx @truongnq-ai/global-skill install
```

Lệnh này sẽ **copy và overwrite** toàn bộ `.agent/skills/`, `docs/`, `examples/` từ bản mới nhất trên npm.

> ⚠️ **Lưu ý:** `install` sẽ overwrite các file đã có. Nếu anh đã customize skill nào đó trong project → backup trước hoặc dùng `git diff` sau khi chạy.

### Options

```bash
--target <path>   # Đổi thư mục đích cho skills (mặc định: .agent/skills)
                  # VD: --target .agents/skills
--dry-run         # Preview file sẽ thay đổi, không thực thi
```

---

## Cách 2: Cài toàn cục (dùng ở nhiều project)

```bash
npm install -g @truongnq-ai/global-skill
```

Sau đó dùng trực tiếp không cần `npx`:

```bash
cd /path/to/your-project
global-skill init      # khởi tạo project mới
global-skill install   # cập nhật bộ skill
global-skill help      # xem trợ giúp
```

---

## Cách 3: Dùng từ source (đang phát triển / tự host)

```bash
# Clone repo
git clone https://github.com/truongnq-ai/global-skill.git
cd global-skill

# Link CLI vào PATH local
npm link

# cd sang project cần dùng
cd /path/to/your-project
global-skill init
```

Để gỡ link:
```bash
cd /path/to/global-skill
npm unlink
```

---

## Sau khi cài đặt — Thứ tự đọc

Khi bộ skill đã có trong project, AI agent sẽ tự động nhận biết và áp dụng. Thứ tự đọc khuyến nghị:

```
1. .agent/skills/clarification/SKILL.md   ← Quy tắc dừng và hỏi A/B/C
2. .agent/skills/file-safety/SKILL.md     ← Quy tắc scope và file write
3. .agent/skills/coding/SKILL.md          ← FSM coding
4. docs/fsm.md                            ← State machine đầy đủ
5. (Các skill khác theo context)
```

---

## Tạo skill mới từ template

```bash
# Copy template
cp .agent/skills/_templates/SKILL.md.template .agent/skills/<ten-skill>/SKILL.md

# Chỉnh sửa file mới tạo
# Điền: name, description, mục tiêu, quy trình, ví dụ thực tế
```

Xem `.agent/skills/_templates/SKILL.md.template` để biết format chuẩn.

---

## Kiểm tra phiên bản đang dùng

```bash
cat VERSION
# hoặc
npx @truongnq-ai/global-skill --version
```

---

## Cập nhật lên phiên bản mới nhất

```bash
# Nếu dùng npx (luôn lấy latest)
npx @truongnq-ai/global-skill install

# Nếu cài toàn cục
npm update -g @truongnq-ai/global-skill
global-skill install
```
