---
name: ssh
description: "Kết nối và thao tác qua SSH / SSH tunnel an toàn — không expose port không cần thiết"
depends_on: [clarification]
related: [ops, docker]
---

# SSH Skill

## Mục tiêu
- Quản lý kết nối SSH đến VPS và các server một cách an toàn
- Thiết lập SSH tunnel đúng cách để access internal services
- Không để lộ credential, không hardcode IP/password vào script

---

## Kết nối SSH thông thường

```bash
# Kết nối cơ bản bằng key
ssh -i ~/.ssh/id_rsa user@<server-ip>

# Kết nối với port custom
ssh -i ~/.ssh/id_rsa -p 2222 user@<server-ip>

# Kết nối với jump host (bastion)
ssh -J user@bastion user@internal-server

# Giữ kết nối sống (keepalive)
ssh -o ServerAliveInterval=60 user@<server-ip>
```

---

## SSH Config File (~/.ssh/config)

Cách đúng để quản lý nhiều server — không cần nhớ IP hay flag:

```
# VPS chính
Host vps-main
    HostName <server-ip>
    User ubuntu
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
    ServerAliveCountMax 3

# VPS với port custom
Host vps-staging
    HostName <staging-ip>
    User ubuntu
    Port 2222
    IdentityFile ~/.ssh/id_staging

# Jump host
Host internal-server
    HostName 10.0.0.5
    User ubuntu
    IdentityFile ~/.ssh/id_rsa
    ProxyJump vps-main
```

Sau khi có config:
```bash
ssh vps-main          # thay cho: ssh -i key user@ip
ssh vps-staging       # tự động dùng port 2222
```

---

## SSH Tunnel

### Local Port Forwarding (access remote service từ local)
```bash
# Truy cập PostgreSQL trên VPS từ localhost:5433
ssh -L 5433:localhost:5432 vps-main -N -f

# Truy cập service nội bộ qua VPS
ssh -L 8080:internal-service:80 vps-main -N -f
# Sau đó: curl http://localhost:8080

# -N: không chạy command (chỉ tunnel)
# -f: chạy background
```

### Remote Port Forwarding (expose local service lên remote)
```bash
# Expose localhost:3000 thành accessible tại vps:9000
ssh -R 9000:localhost:3000 vps-main -N -f
# CHÚ Ý: cần GatewayPorts yes trong /etc/ssh/sshd_config trên VPS
```

---

## Quy tắc an toàn

1. **Không bao giờ dùng password trong lệnh CLI** — dùng SSH key thay thế
2. **Không lưu private key vào repo** — chỉ lưu public key
3. **Không hardcode IP production** vào script — dùng `~/.ssh/config` alias
4. **Tunnel chỉ mở khi cần** — đóng ngay sau khi dùng xong (`kill` background process)
5. **Không forward port production DB ra ngoài** mà không có lý do rõ ràng và thời hạn ngắn

---

## Kiểm tra tunnel đang chạy

```bash
# Xem tất cả SSH process đang background
ps aux | grep ssh

# Xem port đang lắng nghe
netstat -tlnp | grep <port>
# hoặc trên Windows/WSL:
netstat -ano | findstr <port>

# Tắt tunnel bằng PID
kill <PID>

# Tắt tất cả SSH tunnel background
pkill -f "ssh -L"
```

---

## Copy file qua SSH (SCP / rsync)

```bash
# Upload file lên VPS
scp local-file.txt vps-main:/home/ubuntu/

# Download file từ VPS
scp vps-main:/home/ubuntu/log.txt ./

# Sync thư mục (rsync — efficient hơn scp)
rsync -avz ./local-dir/ vps-main:/home/ubuntu/remote-dir/

# Dry run trước khi sync thật
rsync -avzn ./local-dir/ vps-main:/home/ubuntu/remote-dir/
```

---

## Ví dụ thực tế

### ✅ Đúng — Mở tunnel có kiểm soát
```
USER: Cho anh xem DB trên VPS từ local.

AGENT:
Tôi sẽ mở SSH tunnel local:5433 → VPS:5432.
Sau khi dùng xong cần tắt tunnel (tôi sẽ nhắc).

[chạy: ssh -L 5433:localhost:5432 vps-main -N -f]
→ Tunnel đang chạy. Anh kết nối tới localhost:5433 bằng DB client.

Khi xong, tôi tắt tunnel:
[pkill -f "ssh -L 5433"]
```

### ✅ Đúng — Xác nhận trước khi upload file production
```
USER: Deploy config mới lên VPS.

AGENT:
Tôi sẽ copy file `config.prod.env` lên VPS tại `/opt/bot/.env`.
⚠️ Đây là production — xác nhận nội dung file trước khi upload.

[view_file config.prod.env] → hiện nội dung để owner kiểm tra
→ Anh xác nhận upload không?
```

### ❌ Sai — Để tunnel chạy mãi
```
AGENT: (mở tunnel, xong việc, không tắt) ← SAI — tốn resource, security risk
```

### ❌ Sai — Hardcode credential trong script
```bash
# SAI
ssh ubuntu@192.168.1.100 -i /home/user/secret.pem "restart service"

# ĐÚNG — dùng alias từ ~/.ssh/config
ssh vps-main "sudo systemctl restart bot"
```
