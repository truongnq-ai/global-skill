# Prompt snippets hay dùng

## Kích hoạt FSM / Clarification
```
Hãy phân tích yêu cầu theo FSM trước khi thực thi.
Nếu thiếu thông tin, dừng lại và hỏi theo dạng A/B/C.
Không thực thi khi chưa nhận được quyết định từ anh.
```

## Khai báo File Scope
```
Trước khi bắt đầu, hãy liệt kê toàn bộ file sẽ thay đổi và xin xác nhận.
Chỉ sửa những file đã được liệt kê và phê duyệt.
```

## Research có nguồn
```
Mọi kết luận phải kèm nguồn trích dẫn. 
Phân biệt rõ: fact có nguồn vs suy luận cá nhân.
```

## Ops an toàn
```
Trước khi thực thi bất cứ hành động nào thay đổi state hệ thống,
hãy đọc log hiện tại và trình bày plan + rủi ro để anh xem xét.
```

## Docker an toàn
```
Xác nhận môi trường (local/staging/prod) trước khi chạy lệnh.
Không chạy `down -v` trên production.
```
