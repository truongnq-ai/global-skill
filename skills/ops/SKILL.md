---
name: ops
description: "Vận hành hệ thống: kiểm tra trạng thái, xử lý sự cố — luôn đọc log trước, phân tích rủi ro trước khi thay đổi bất cứ thứ gì"
---

# Ops Skill

> **Áp dụng cho mọi hệ thống.**  
> Danh sách service cụ thể (container names, ports, config paths) được định nghĩa trong skill riêng của từng project.

## Mục tiêu
- Thu thập thông tin trước, thay đổi sau — không bao giờ đảo ngược thứ tự này
- Trình bày plan + đánh giá rủi ro cho owner trước mọi hành động thay đổi state
- Bảo toàn khả năng rollback — luôn biết cách quay về trạng thái trước

---

## Quy trình xử lý sự cố (Incident Response FSM)

```
[1. Thu thập thông tin — KHÔNG thay đổi gì]
     │ (đọc log, status, metrics, config)
     ↓
[2. Phân tích root cause]
     ↓
[3. Đánh giá impact & rủi ro của plan fix]
     ↓
[4. Trình bày plan → DỪNG chờ confirm nếu có rủi ro]
     ↓
[5. Thực thi từng bước nhỏ]
     ↓
[6. Verify sau mỗi bước]
     ↓
[7. Báo cáo tóm tắt]
```

> **Bước 4 là hard stop** — không được auto-skip dù đang ở Auto-Accept mode.

---

## Phân loại hành động

### ✅ An toàn — Có thể thực thi để thu thập thông tin
Các lệnh **chỉ đọc**, không thay đổi state:
```bash
# Xem trạng thái process/container
ps aux
systemctl status <service>
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Xem logs
journalctl -u <service> -n 100
docker logs <container> --tail 100 --timestamps

# Xem resource
top, htop, free -h, df -h
docker stats --no-stream

# Xem network/port
ss -tlnp
netstat -tlnp
lsof -i :<port>

# Xem config (chỉ đọc)
cat /path/to/config
docker inspect <container>
```

### ⚠️ Cần confirm trước — Thay đổi state nhẹ
| Hành động | Cần confirm? |
|---|---|
| Restart một service cụ thể | ✅ Luôn hỏi (downtime ngắn) |
| Reload cấu hình không restart | ✅ Hỏi nếu production |
| Clear cache | ✅ Confirm nếu production |
| Thay đổi giá trị .env | ✅ Luôn hỏi + đọc file trước |

### 🔴 Bắt buộc có plan + confirm — Rủi ro cao
| Hành động | Lý do |
|---|---|
| Stop/down toàn bộ service stack | Downtime toàn hệ thống |
| Delete record / truncate table | Mất data không rollback |
| Chạy migration database | Thay đổi schema — khó reverse |
| Thay đổi firewall / iptables | Có thể block toàn bộ access |
| `kill -9` process | Không graceful, corrupt state |
| Deploy lên production | Ảnh hưởng user thực |

---

## Trước khi thay đổi bất kỳ config nào

```bash
# 1. Đọc giá trị hiện tại → log lại
cat .env.production

# 2. Tạo backup
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# 3. Thực hiện thay đổi

# 4. Verify sau thay đổi
```

---

## Checklist đánh giá rủi ro khi đề xuất plan

```
[ ] Hành động này có gây downtime không?
[ ] Có thể rollback được không? Bằng cách nào?
[ ] Dữ liệu nào có thể bị mất?
[ ] Có user đang active không (giờ cao điểm)?
[ ] Đã kiểm tra log để biết root cause chưa?
[ ] Có cần backup trước không?
```

---

## Ví dụ thực tế

### ✅ Đúng — Thu thập thông tin trước, plan sau
```
USER: Service X bị down, fix giúp anh.

AGENT:
Bước 1 — Thu thập thông tin (chưa thay đổi gì):
[docker ps / systemctl status] → xác nhận service đã exit
[docker logs / journalctl] → đọc error log cuối

→ Root cause: Connection refused đến DB — có thể do port sai hoặc DB chưa start

Bước 2 — Plan fix (mức độ từ thấp đến cao):
1. Kiểm tra DB có đang chạy không [safe, không thay đổi]
2. Nếu DB chưa chạy → start DB, rồi restart service
3. Nếu DB đang chạy → kiểm tra connection string trong config

Rủi ro tổng thể: Thấp — không xoá data, chỉ restart.
Thời gian downtime dự kiến: < 2 phút.

→ Anh cho phép tôi xem config và bắt đầu không?
```

### ❌ Sai — Restart ngay không cần biết lý do
```
AGENT: (systemctl restart service-x / docker restart container) ← SAI
→ Che giấu nguyên nhân, có thể restart vô tận nếu root cause chưa được fix
```

### ❌ Sai — Xoá file log để "fix" lỗi
```
AGENT: (rm /var/log/app/*.log) ← SAI — mất evidence để debug sau
```
