# 🧪 Hướng dẫn Test tính năng quét QR và Check-in

## 📋 Tổng quan

Hệ thống cho phép:
- ✅ Khách hàng đặt vé và nhận mã QR
- ✅ Admin/Staff quét mã QR để check-in
- ✅ Vô hiệu hóa mã QR sau khi đã check-in (không thể sử dụng lại)

---

## 🚀 Cách test đầy đủ

### Bước 1: Chuẩn bị tài khoản test

**Cần 2 tài khoản:**
1. **Admin** - Để check-in vé (đã có sẵn)
2. **User** - Để đặt vé và xem vé (tạo mới)

#### Tạo tài khoản User test:

**Cách 1: Qua Prisma Studio** (Dễ nhất)

1. Mở Prisma Studio (đang chạy tại http://localhost:5555)
2. Chọn model **User**
3. Nhấn **Add record**
4. Điền thông tin:
   ```
   email: customer@test.com
   password: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY0ZlFkNbdLv3hy  (password: "123456")
   name: Khách hàng test
   phone: 0901234567
   role: USER
   emailVerified: null
   avatar: null
   ```
5. Nhấn **Save 1 change**

**Cách 2: Chạy script SQL**

```sql
-- Vào Prisma Studio > SQL Query hoặc dùng database client
INSERT INTO users (id, email, password, name, phone, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'customer@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY0ZlFkNbdLv3hy',
  'Khách hàng test',
  '0901234567',
  'USER',
  NOW(),
  NOW()
);
```

---

### Bước 2: Đăng nhập với User và đặt vé

1. **Logout tài khoản Admin** (nếu đang đăng nhập)
   - Vào: http://localhost:3000
   - Nhấn **Đăng xuất**

2. **Đăng nhập với User**
   - Vào: http://localhost:3000/auth/login
   - Email: `customer@test.com`
   - Password: `123456`
   - Nhấn **Đăng nhập**

3. **Đặt vé**
   - Vào: http://localhost:3000/dat-ve
   - Chọn tuyến đường bất kỳ
   - Điền thông tin:
     - Họ tên: `Nguyễn Văn A`
     - Số điện thoại: `0901234567`
     - Email: `customer@test.com`
     - Chọn ngày đi (hôm nay hoặc ngày mai)
     - Chọn giờ xuất bến
     - Số ghế: `1`
   - Nhấn **Đặt vé ngay**

4. **Lưu mã vé**
   - Sau khi đặt vé thành công, bạn sẽ được chuyển đến trang xác nhận
   - **Copy mã vé** (dạng: `VCP240109001`)
   - Hoặc vào `/my-bookings` để xem

---

### Bước 3: Xem vé của khách hàng (TRƯỚC khi check-in)

1. **Vào trang vé của tôi**
   - URL: http://localhost:3000/my-bookings

2. **Xem mã QR**
   - Bạn sẽ thấy vé vừa đặt
   - Mã QR hiển thị **rõ ràng, không bị mờ**
   - Trạng thái: "Chờ thanh toán" hoặc "Đã thanh toán"
   - **Chưa có badge "Đã check-in"**

3. **Xem chi tiết vé**
   - Nhấn **"Xem chi tiết"**
   - Mã QR hiển thị to, rõ nét
   - **Không có chữ "ĐÃ SỬ DỤNG"**
   - Có text: "Xuất trình mã QR này khi lên xe"

4. **Copy mã vé** (quan trọng!)
   - Mã vé sẽ có dạng: `VCP240109001`
   - Copy mã này để dùng ở bước tiếp theo

---

### Bước 4: Xác nhận thanh toán (Admin)

**Lưu ý:** Vé phải có trạng thái PAID hoặc CONFIRMED mới check-in được!

1. **Logout và đăng nhập Admin**
   - Logout tài khoản User
   - Đăng nhập với Admin
   - Email: `admin@vocucphuong.com` (hoặc email admin của bạn)
   - Password: `123456`

2. **Xác nhận thanh toán**
   - Vào: http://localhost:3000/admin/payments
   - Tìm vé có mã `VCP240109001`
   - Nhấn **"Xác nhận thanh toán"**

   **Hoặc qua Prisma Studio:**
   - Mở model **Booking**
   - Tìm booking có mã `VCP240109001`
   - Sửa `status` từ `PENDING` → `PAID`
   - Nhấn **Save**

---

### Bước 5: Check-in vé (Admin/Staff)

1. **Vào trang quản lý vé**
   - URL: http://localhost:3000/admin/bookings

2. **Xem danh sách vé**
   - Bạn sẽ thấy tất cả vé đã đặt
   - Tìm vé có mã `VCP240109001`
   - Trạng thái check-in: **"Chưa check-in"** (badge màu xám)

3. **Quét mã QR / Check-in**
   - Nhấn nút **"📱 Quét mã QR / Check-in vé"** (góc trên bên trái)
   - Modal hiện ra

4. **Nhập mã vé**
   - Dán mã vé: `VCP240109001`
   - Nhấn **"Check-in"**

5. **Kết quả thành công**
   - Hiển thị: "✓ Check-in thành công!"
   - Thông tin vé:
     - Mã vé
     - Khách hàng
     - Tuyến đường
     - Ngày giờ
     - Số ghế
     - Tổng tiền
   - Nhấn **"Đóng"**

6. **Xem lại danh sách vé**
   - Vé `VCP240109001` bây giờ có:
     - Badge **"✓ Đã check-in"** (màu xanh)
     - Thời gian check-in (ví dụ: `10/11/2025 10:30`)
   - Thống kê cập nhật:
     - "Đã check-in" tăng thêm 1
     - "Chưa check-in" giảm 1

---

### Bước 6: Thử check-in lại (Kiểm tra vô hiệu hóa)

1. **Nhấn lại nút "Quét mã QR / Check-in vé"**
2. **Nhập lại mã vé** `VCP240109001`
3. **Nhấn "Check-in"**

4. **Kết quả: Lỗi!**
   - Hiển thị lỗi màu đỏ:
   - ❌ **"Vé này đã được check-in"**
   - Thông tin vé với:
     - `checkedIn: true`
     - `checkedInAt: 10/11/2025 10:30`
   - **Không thể check-in lại!** ✅

---

### Bước 7: Xem vé của khách hàng (SAU khi check-in)

1. **Logout Admin và đăng nhập lại User**
   - Email: `customer@test.com`
   - Password: `123456`

2. **Vào trang vé của tôi**
   - URL: http://localhost:3000/my-bookings

3. **Xem vé đã check-in**
   - Vé hiển thị:
     - Badge **"✓ Đã check-in"** (màu xanh) ngay trên card
     - Thời gian check-in: `10/11/2025, 10:30`

4. **Xem chi tiết vé**
   - Nhấn **"Xem chi tiết"**
   - Mã QR bây giờ:
     - ✅ **BỊ LÀM MỜ** (opacity: 30%)
     - ✅ **CÓ BADGE "ĐÃ SỬ DỤNG"** (màu đỏ, xoay -12 độ)
     - ✅ Text cảnh báo: "⚠️ Vé này đã được check-in và không thể sử dụng lại"

5. **Xem thông tin check-in**
   - Có box màu xanh với:
     - ✓ **"Vé đã được check-in"**
     - Thời gian: `10/11/2025, 10:30`
     - Text: "Mã QR đã được vô hiệu hóa và không thể sử dụng lại."

---

## ✅ Checklist kiểm tra

### Trước khi check-in:
- [ ] Vé hiển thị trên `/my-bookings`
- [ ] Mã QR hiển thị rõ ràng (không mờ)
- [ ] Không có badge "Đã check-in"
- [ ] Không có chữ "ĐÃ SỬ DỤNG"
- [ ] Text: "Xuất trình mã QR này khi lên xe"

### Admin check-in:
- [ ] Admin có thể vào `/admin/bookings`
- [ ] Thấy danh sách tất cả vé
- [ ] Nhấn "Quét mã QR / Check-in vé"
- [ ] Nhập mã vé thành công
- [ ] Hiển thị "Check-in thành công!"
- [ ] Thống kê cập nhật (Đã check-in +1)
- [ ] Vé hiển thị badge "✓ Đã check-in"
- [ ] Thời gian check-in hiển thị đúng

### Kiểm tra vô hiệu hóa:
- [ ] Không thể check-in vé đã check-in
- [ ] Hiển thị lỗi: "Vé này đã được check-in"
- [ ] Thông tin check-in hiển thị trong lỗi

### Sau khi check-in:
- [ ] User vào `/my-bookings` thấy vé
- [ ] Badge "✓ Đã check-in" hiển thị
- [ ] Thời gian check-in hiển thị
- [ ] Xem chi tiết: Mã QR bị làm mờ (opacity 30%)
- [ ] Badge "ĐÃ SỬ DỤNG" màu đỏ xuất hiện
- [ ] Cảnh báo: "không thể sử dụng lại"
- [ ] Box màu xanh với thông tin check-in

---

## 🎥 Demo Flow nhanh

```bash
# 1. Tạo User test
customer@test.com / 123456

# 2. User: Đặt vé
http://localhost:3000/dat-ve
→ Nhận mã vé: VCP240109001

# 3. User: Xem vé (TRƯỚC check-in)
http://localhost:3000/my-bookings
→ QR rõ ràng, không mờ

# 4. Admin: Xác nhận thanh toán
http://localhost:3000/admin/payments
→ Status: PENDING → PAID

# 5. Admin: Check-in vé
http://localhost:3000/admin/bookings
→ Nhấn "Quét mã QR"
→ Nhập: VCP240109001
→ Check-in thành công!

# 6. Admin: Thử check-in lại
→ Nhập lại: VCP240109001
→ Lỗi: "Vé này đã được check-in" ✅

# 7. User: Xem vé (SAU check-in)
http://localhost:3000/my-bookings
→ QR bị mờ + badge "ĐÃ SỬ DỤNG" ✅
```

---

## 🐛 Troubleshooting

### Lỗi: "Không thể check-in vé có trạng thái PENDING"

**Nguyên nhân:** Vé chưa thanh toán

**Giải pháp:**
1. Vào `/admin/payments`
2. Xác nhận thanh toán cho vé đó
3. Hoặc sửa `status` trong Prisma Studio: `PENDING` → `PAID`

### Lỗi: "Unauthorized - Vui lòng đăng nhập"

**Nguyên nhân:** Chưa đăng nhập hoặc session hết hạn

**Giải pháp:**
1. Đăng nhập lại
2. Check cookie session
3. Restart dev server nếu cần

### Lỗi: "Forbidden - Chỉ admin/staff có quyền check-in vé"

**Nguyên nhân:** Đang đăng nhập với User (không phải Admin)

**Giải pháp:**
1. Logout
2. Đăng nhập với tài khoản Admin
3. Check role trong Prisma Studio

### User không thấy vé tại `/my-bookings`

**Nguyên nhân:** Vé không có `userId` (khách vãng lai)

**Giải pháp:**
1. Khi đặt vé, đăng nhập trước
2. Hoặc sửa `userId` trong Prisma Studio

---

## 📊 Test Cases

| # | Test Case | Expected Result | ✅ |
|---|-----------|-----------------|---|
| 1 | User đặt vé thành công | Nhận mã vé và QR | |
| 2 | User xem vé trước check-in | QR rõ, không mờ | |
| 3 | Admin xác nhận thanh toán | Status → PAID | |
| 4 | Admin check-in vé lần đầu | Thành công | |
| 5 | Admin check-in vé lần 2 | Lỗi "đã check-in" | |
| 6 | User xem vé sau check-in | QR mờ + "ĐÃ SỬ DỤNG" | |
| 7 | Thống kê admin cập nhật | Đã check-in +1 | |
| 8 | Thời gian check-in lưu đúng | Hiển thị đúng giờ | |
| 9 | User khác không thấy vé này | Chỉ thấy vé của mình | |
| 10 | Check-in vé PENDING | Lỗi "phải PAID" | |

---

## 🎯 Kết luận

Sau khi hoàn thành test:
- ✅ Vé được check-in thành công
- ✅ Mã QR bị vô hiệu hóa sau check-in
- ✅ Không thể check-in lại (tránh gian lận)
- ✅ Khách hàng thấy rõ vé đã sử dụng
- ✅ Admin có thể quản lý và theo dõi

Hệ thống hoạt động đúng như mong đợi! 🚀
