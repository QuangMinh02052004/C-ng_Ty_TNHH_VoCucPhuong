# 📧 Hướng dẫn cấu hình Email cho form liên hệ

## 🎯 Tổng quan

Hệ thống đã được cấu hình để gửi email từ form liên hệ về địa chỉ **lequangminh951@gmail.com**. Tất cả tin nhắn từ khách hàng sẽ được gửi tự động đến email này.

---

## ⚙️ Cấu hình Gmail App Password

Để hệ thống có thể gửi email, bạn cần tạo **App Password** từ tài khoản Gmail **vocucphuong0018@gmail.com**.

### Bước 1: Bật xác thực 2 bước (2FA)

1. Đăng nhập vào tài khoản Gmail: **vocucphuong0018@gmail.com**
2. Truy cập: https://myaccount.google.com/security
3. Tìm mục **"Xác minh 2 bước"** (2-Step Verification)
4. Nhấn **"Bật"** và làm theo hướng dẫn

### Bước 2: Tạo App Password

1. Sau khi đã bật 2FA, quay lại: https://myaccount.google.com/security
2. Tìm mục **"Mật khẩu ứng dụng"** (App passwords)
3. Nhấn vào **"Mật khẩu ứng dụng"**
4. Chọn **"Ứng dụng khác"** (Other)
5. Nhập tên: `Xe Vo Cuc Phuong Website`
6. Nhấn **"Tạo"** (Generate)
7. Google sẽ hiển thị mật khẩu 16 ký tự (VD: `abcd efgh ijkl mnop`)
8. **SAO CHÉP** mật khẩu này (không có khoảng trắng: `abcdefghijklmnop`)

### Bước 3: Cập nhật file `.env`

Mở file `.env` và cập nhật:

```bash
# ==================================
# EMAIL SERVICE (Nodemailer với Gmail)
# ==================================
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="vocucphuong0018@gmail.com"
EMAIL_PASSWORD="abcdefghijklmnop"  # <-- Thay bằng App Password vừa tạo
EMAIL_FROM="Xe Võ Cúc Phương <vocucphuong0018@gmail.com>"
```

**LÀM THEO:**
- Thay `abcdefghijklmnop` bằng mật khẩu 16 ký tự vừa tạo
- Bỏ hết khoảng trắng trong mật khẩu
- Không dùng mật khẩu Gmail thông thường

### Bước 4: Khởi động lại server

```bash
# Dừng server hiện tại (Ctrl + C)
# Chạy lại
npm run dev
```

---

## 🧪 Test chức năng

### Cách 1: Test qua website

1. Mở trình duyệt: http://localhost:3000/lien-he
2. Điền form liên hệ:
   - Họ tên: `Nguyễn Văn A`
   - Email: `test@example.com`
   - Số điện thoại: `0901234567`
   - Tiêu đề: `Test email`
   - Nội dung: `Đây là tin nhắn thử nghiệm`
3. Nhấn **"Gửi tin nhắn"**
4. Kiểm tra email **lequangminh951@gmail.com** sau 10-30 giây

### Cách 2: Test qua API trực tiếp

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "test@example.com",
    "phone": "0901234567",
    "subject": "Test API",
    "message": "Đây là tin nhắn test từ API"
  }'
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Tin nhắn của bạn đã được gửi thành công..."
}
```

---

## 📧 Email template

Khi khách hàng gửi tin nhắn, bạn sẽ nhận được email với nội dung:

### Tiêu đề email
```
[Liên hệ] Tiêu đề từ khách hàng
hoặc
[Liên hệ] Tin nhắn từ Nguyễn Văn A
```

### Nội dung email
- 📧 Tin nhắn liên hệ mới
- 👤 Thông tin khách hàng (Tên, Email, SĐT)
- 📋 Tiêu đề (nếu có)
- 💬 Nội dung tin nhắn
- 📅 Timestamp

Email được format đẹp với HTML, dễ đọc trên mọi thiết bị.

---

## 🔧 Troubleshooting

### Lỗi: "Error sending email: Invalid login"

**Nguyên nhân:** App Password chưa đúng hoặc chưa được tạo

**Giải pháp:**
1. Kiểm tra lại EMAIL_PASSWORD trong .env
2. Đảm bảo đã bật 2FA
3. Tạo lại App Password mới

### Lỗi: "Error: self signed certificate in certificate chain"

**Nguyên nhân:** Vấn đề SSL

**Giải pháp:** Đã được xử lý tự động (secure: false)

### Lỗi: "Connection timeout"

**Nguyên nhân:** Firewall hoặc mạng chặn port 587

**Giải pháp:**
1. Kiểm tra firewall
2. Thử đổi sang port 465 (và set secure: true)

### Email không đến hộp thư đến

**Kiểm tra:**
1. Hộp thư spam/junk
2. Thư mục "Promotions" hoặc "Social" (Gmail)
3. Logs server để xem có lỗi không

---

## 📊 Logs và monitoring

### Xem logs khi gửi email

Server sẽ log:
```
✅ [CONTACT] Email sent from Nguyễn Văn A (test@example.com)
Email sent successfully: <message-id>
```

Hoặc khi có lỗi:
```
[API] Error sending contact email: <error-details>
```

### Kiểm tra console

Mở Developer Tools (F12) → Console để xem lỗi frontend nếu có.

---

## 🚀 Production deployment

Khi deploy lên production:

### 1. Cập nhật environment variables

**Vercel/Netlify/Railway:**
- Vào Settings → Environment Variables
- Thêm:
  - `EMAIL_HOST=smtp.gmail.com`
  - `EMAIL_PORT=587`
  - `EMAIL_USER=vocucphuong0018@gmail.com`
  - `EMAIL_PASSWORD=<app-password>`
  - `EMAIL_FROM=Xe Võ Cúc Phương <vocucphuong0018@gmail.com>`

### 2. Test trên production

```bash
curl -X POST https://your-domain.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Production",
    "email": "test@example.com",
    "message": "Test email production"
  }'
```

---

## 🔐 Bảo mật

### ✅ Đã làm
- Email gửi qua SMTP SSL/TLS
- App Password thay vì mật khẩu Gmail thực
- Validation input với Zod
- Rate limiting sẽ được thêm sau

### 🔜 Nên thêm (tương lai)
- Rate limiting (giới hạn số lần gửi/IP)
- CAPTCHA để chống spam
- Email queue (Bull/BullMQ)
- Thông báo real-time cho admin

---

## 📞 Thông tin hỗ trợ

**Email nhận tin nhắn:** lequangminh951@gmail.com
**Email gửi đi:** vocucphuong0018@gmail.com

Nếu gặp vấn đề, kiểm tra:
1. App Password đã đúng chưa
2. Server logs có lỗi gì không
3. Network có chặn SMTP không

---

## ✅ Checklist

- [ ] Đã bật 2FA cho vocucphuong0018@gmail.com
- [ ] Đã tạo App Password
- [ ] Đã cập nhật EMAIL_PASSWORD trong .env
- [ ] Đã restart server
- [ ] Đã test gửi email thành công
- [ ] Đã nhận được email tại lequangminh951@gmail.com
- [ ] Đã kiểm tra email format đẹp
- [ ] Đã deploy lên production và test

---

Chúc bạn cấu hình thành công! 🎉
