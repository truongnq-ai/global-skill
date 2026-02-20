---
name: docker
description: "Quản lý Docker container và Compose an toàn — không xoá volume, không down prod không confirm"
---

# Docker Skill

## Mục tiêu
- Quản lý container, image, volume có kiểm soát
- Không bao giờ xoá volume production mà không có backup
- Phân biệt rõ môi trường local, staging, production

---

## Cấu trúc thường gặp trong project

```
project/
├── docker-compose.yml          ← Development
├── docker-compose.prod.yml     ← Production override
├── docker-compose.override.yml ← Local override (git ignored)
├── .env                        ← Cấu hình (KHÔNG commit)
└── Dockerfile                  ← Build image
```

---

## Môi trường và Compose file tương ứng

| Môi trường | Lệnh |
|---|---|
| Development | `docker-compose up -d` |
| Production | `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |
| Một service cụ thể | `docker-compose up -d <service-name>` |

---

## Lệnh an toàn (đọc/kiểm tra — không thay đổi state)

```bash
# Xem containers đang chạy
docker ps
docker-compose ps

# Xem logs
docker logs <container> --tail 100 -f
docker-compose logs -f <service>

# Xem resource
docker stats --no-stream

# Xem network
docker network ls
docker network inspect <network-name>

# Xem volumes
docker volume ls
docker volume inspect <volume-name>

# Xem image
docker images
docker inspect <image>
```

---

## Lệnh thay đổi state — CẦN XÁC NHẬN

```bash
# Restart service (CONFIRM trước nếu production)
docker-compose restart <service>

# Stop và remove container (giữ volume)
docker-compose stop <service>
docker-compose rm -f <service>

# Down toàn bộ (CONFIRM bắt buộc trên prod)
docker-compose down

# Down và xoá volumes (CẢNH BÁO — mất data)
docker-compose down -v   ← KHÔNG bao giờ chạy trên prod mà không backup trước

# Rebuild image (safe trên dev)
docker-compose build <service>
docker-compose up -d --build <service>

# Dọn dẹp (CHỈ trên dev)
docker system prune -f
docker volume prune -f   ← NGUY HIỂM — xoá volume không dùng
```

---

## Quy tắc an toàn

1. **Xác định môi trường trước** — hỏi "đang làm trên local hay prod?" nếu không rõ
2. **Không chạy `docker-compose down -v` trên production** — mất data database
3. **Trước khi `docker system prune`** → kiểm tra có volume nào quan trọng không
4. **Không pull image mới trên production mà không test trên staging trước**
5. **Backup volume DB trước khi down lâu dài**:
```bash
# Backup PostgreSQL
docker exec <pg-container> pg_dump -U <user> <db> > backup_$(date +%Y%m%d).sql
```

---

## Debug container gặp lỗi

```bash
# Vào shell của container đang chạy
docker exec -it <container> bash
docker exec -it <container> sh   # nếu không có bash

# Kiểm tra environment variables
docker exec <container> env | grep -i <keyword>

# Xem config
docker inspect <container> | grep -A 20 "Env"

# Chạy container tạm để debug (không thay đổi prod)
docker run --rm -it <image> bash
```

---

## Ví dụ thực tế

### ✅ Đúng — Kiểm tra trước khi restart
```
USER: Container bot bị lỗi, restart giúp anh.

AGENT:
1. [docker logs bot-core-service --tail 50] → thấy rõ error
2. [docker inspect bot-core-service] → xác nhận volume mount
3. Đây là production hay development? (hỏi confirm)

USER: Development.

AGENT: OK, restart development container:
[docker-compose restart bot-core-service]
→ Container đã restart. Kiểm tra lại:
[docker logs bot-core-service --tail 20]
→ Service up OK.
```

### ❌ Sai — Down cả stack không hỏi
```
AGENT: (docker-compose down -v) ← SAI — mất data, không confirm
```

### ❌ Sai — Không biết đang ở môi trường nào
```
AGENT: (rebuild và deploy lên container đang chạy mà không hỏi đây là prod hay dev) ← SAI
```
