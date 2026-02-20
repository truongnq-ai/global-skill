# Use Cases thực tế

## Coding & Planning
- Thêm field mới vào model DB với migration Alembic
- Refactor service layer, tách repository pattern
- Fix bug logic tính giá sau khi áp dụng discount
- Review và tối ưu N+1 query trong CRUD

## GitHub
- Triage issue mới reported từ Telegram bot
- Tạo PR cho feature branch, kiểm tra CI pass
- Review diff trước merge và comment nếu có vấn đề
- Tạo release tag và update CHANGELOG

## Ops & Vận hành
- Kiểm tra container nào đang chiếm CPU/RAM cao
- Xem log lỗi của service bot sau khi deploy
- Kiểm tra Kafka consumer lag
- Verify endpoint health check sau deploy mới

## Docker
- Rebuild image sau khi thay đổi requirements.txt
- Kiểm tra network giữa các container trong Compose
- Backup volume PostgreSQL trước khi down stack
- Debug container exit với code khác 0

## SSH & Tunnel
- Mở tunnel để xem DB production từ local DB client
- Upload file config mới lên VPS
- Check log service đang chạy trên VPS
- Kiểm tra trạng thái process trên server

## Research
- Tìm giải pháp rate limiting phù hợp cho FastAPI
- So sánh Celery vs FastAPI BackgroundTasks cho use case hiện tại
- Kiểm tra breaking changes trong version mới của dependency
- Tìm ví dụ implementation pattern cho Kafka consumer group
