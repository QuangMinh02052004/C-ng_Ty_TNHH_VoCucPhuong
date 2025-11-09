# 📱 Hướng dẫn cấu hình SMS với Twilio

## 🎯 Tổng quan

Hệ thống có thể gửi SMS thông báo đến khách hàng khi:
- ✅ Đặt vé thành công
- ✅ Xác nhận thanh toán
- ✅ Nhắc nhở trước giờ khởi hành (nếu triển khai)

**Lưu ý**: Twilio là dịch vụ **trả phí** (paid service). Bạn cần mua credits để gửi SMS.

---

## 💰 Chi phí Twilio

### Giá gửi SMS đến Việt Nam
- **~0.0565 USD/SMS** (khoảng 1,400 VNĐ/tin)
- Credits tối thiểu: **$20 USD** (~500,000 VNĐ)
- **Trial account**: $15.50 USD miễn phí (chỉ gửi đến số đã verify)

### Ví dụ chi phí
| Số lượng vé/tháng | Chi phí SMS (USD) | Chi phí SMS (VNĐ) |
|-------------------|-------------------|-------------------|
| 100 vé | $5.65 | ~141,000 đ |
| 500 vé | $28.25 | ~706,000 đ |
| 1,000 vé | $56.50 | ~1,412,000 đ |

---

## 🚀 Hướng dẫn đăng ký Twilio

### Bước 1: Tạo tài khoản Twilio

1. Truy cập: https://www.twilio.com/try-twilio
2. Nhấn **"Start for free"**
3. Điền thông tin:
   - First Name: `Minh`
   - Last Name: `Le`
   - Email: `lequangminh951@gmail.com`
   - Password: Tạo mật khẩu mạnh
4. Xác nhận email
5. Verify số điện thoại **0908724146**:
   - Chọn quốc gia: **Vietnam (+84)**
   - Nhập: `908724146` (bỏ số 0 đầu)
   - Nhận mã OTP qua SMS
   - Nhập mã OTP để xác thực

### Bước 2: Tạo Project

1. Sau khi đăng nhập, vào **Console**: https://console.twilio.com/
2. Chọn **"Create a project"** hoặc **"Develop" → "Messaging"**
3. Đặt tên project: `Xe Vo Cuc Phuong Booking`
4. Chọn use case: **Notifications, 2FA, Alerts**
5. Nhấn **"Continue"**

### Bước 3: Lấy credentials

1. Vào **Console Dashboard**: https://console.twilio.com/
2. Tìm phần **"Account Info"**:
   - **Account SID**: Dạng `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Nhấn "Show" để hiện token
3. **Copy** cả 2 giá trị này

### Bước 4: Mua số điện thoại Twilio (Phone Number)

1. Vào **Phone Numbers** → **Manage** → **Buy a number**
2. Chọn quốc gia: **United States** (rẻ nhất, ~$1/tháng)
3. Tích chọn **SMS** capability
4. Chọn số điện thoại bất kỳ
5. Nhấn **"Buy"**
6. **Copy số điện thoại** này (dạng `+1234567890`)

**Lưu ý**:
- Số Việt Nam (+84) trên Twilio rất đắt (~$2-5/tháng)
- Dùng số US vẫn gửi được SMS đến Việt Nam
- Khách hàng sẽ nhận được SMS từ số US

---

## ⚙️ Cấu hình trong `.env`

Mở file `.env` và cập nhật:

```bash
# ==================================
# SMS SERVICE (Twilio)
# ==================================
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Thay bằng Account SID của bạn
TWILIO_AUTH_TOKEN="your_auth_token_here"                 # Thay bằng Auth Token của bạn
TWILIO_PHONE_NUMBER="+1234567890"                        # Thay bằng số Twilio vừa mua
```

**Ví dụ:**
```bash
TWILIO_ACCOUNT_SID="ACxxxx...xxxx"  # 34 ký tự bắt đầu bằng AC
TWILIO_AUTH_TOKEN="your-token-here"  # 32 ký tự
TWILIO_PHONE_NUMBER="+12025551234"
```

---

## 🧪 Test gửi SMS

### Cách 1: Test qua website

1. Mở trang đặt vé: http://localhost:3000/dat-ve
2. Điền thông tin:
   - Số điện thoại: `0908724146` (số đã verify trên Twilio)
3. Đặt vé
4. Kiểm tra SMS trên điện thoại **0908724146**

### Cách 2: Test qua Twilio Console

1. Vào **Messaging** → **Try it out** → **Send an SMS**
2. From: Chọn số Twilio vừa mua
3. To: `+84908724146`
4. Message: `Test SMS từ Xe Võ Cúc Phương`
5. Nhấn **"Send test SMS"**

### Cách 3: Test qua API trực tiếp

```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0908724146",
    "message": "Test SMS từ hệ thống đặt vé"
  }'
```

---

## 📋 Template SMS hiện có

### 1. SMS xác nhận đặt vé

```
[Xe Võ Cúc Phương]
✅ Đặt vé thành công!

Mã vé: VCP240109001
Tuyến: Sài Gòn → Xuân Lộc
Ngày: 10/11/2025 - 06:00
Ghế: 2 ghế
Tổng tiền: 260,000đ

Vui lòng có mặt trước 15 phút.
Hotline: 02519 999 975
```

### 2. SMS nhắc nhở (tương lai)

```
[Xe Võ Cúc Phương]
🔔 Nhắc nhở: Chuyến xe của bạn sẽ khởi hành sau 2 giờ.

Mã vé: VCP240109001
Giờ xuất bến: 06:00
Điểm đón: Bến xe Miền Đông

Hotline: 02519 999 975
```

---

## 🔧 Quản lý chi phí

### Cách 1: Giới hạn budget

1. Vào **Billing** → **Notifications**
2. Set **Spending Limit**: $50 (tùy chọn)
3. Twilio sẽ ngưng gửi SMS khi hết budget

### Cách 2: Chỉ gửi SMS quan trọng

Chỉnh sửa file `src/app/api/bookings/create/route.ts`:

```typescript
// Tắt SMS cho môi trường development
if (process.env.NODE_ENV === 'production') {
    await sendBookingConfirmationSMS({ ... });
}
```

### Cách 3: Tắt SMS hoàn toàn

Trong `.env`, comment out hoặc xóa:

```bash
# TWILIO_ACCOUNT_SID="ACxxxx"
# TWILIO_AUTH_TOKEN="xxxx"
# TWILIO_PHONE_NUMBER="+1xxxx"
```

Hệ thống sẽ tự động bỏ qua gửi SMS nếu không có config.

---

## 🌍 Gửi SMS đến số Việt Nam

### Format số điện thoại

| Số gốc | Format đúng | Giải thích |
|--------|-------------|------------|
| 0908724146 | +84908724146 | Thay 0 đầu bằng +84 |
| 84908724146 | +84908724146 | Thêm + vào đầu |
| +84908724146 | +84908724146 | Đúng rồi ✅ |

**Hệ thống đã tự động xử lý:**
- Input: `0908724146` → Auto convert: `+84908724146`
- Input: `84908724146` → Auto convert: `+84908724146`
- Input: `+84908724146` → Giữ nguyên ✅

---

## 🚨 Troubleshooting

### Lỗi: "The number +84... is unverified"

**Nguyên nhân:** Trial account chỉ gửi được đến số đã verify

**Giải pháp:**
1. Nâng cấp lên **Paid account** (nạp $20+)
2. Hoặc verify thêm số điện thoại trên Twilio Console

### Lỗi: "Permission denied to send SMS"

**Nguyên nhân:** Chưa enable SMS capability

**Giải pháp:**
1. Vào **Phone Numbers** → Chọn số
2. Tích **SMS** trong **Capabilities**
3. Nhấn **Save**

### Lỗi: "Insufficient credits"

**Nguyên nhân:** Hết credits

**Giải pháp:**
1. Vào **Billing** → **Add Credit**
2. Nạp thêm credits (tối thiểu $20)

### SMS không đến

**Kiểm tra:**
1. Số điện thoại đúng format (+84...)
2. Xem **Logs** trên Twilio Console
3. Kiểm tra hộp thư spam/junk trên điện thoại
4. Verify số điện thoại nếu dùng Trial account

---

## 📊 Monitor & Logs

### Xem logs trên Twilio

1. Vào **Monitor** → **Logs** → **Messaging**
2. Xem trạng thái:
   - ✅ **Delivered**: Gửi thành công
   - ⏳ **Sent**: Đang gửi
   - ❌ **Failed**: Gửi thất bại
   - ❌ **Undelivered**: Không gửi được

### Xem logs trên server

Server sẽ log:
```
✅ [SMS] Message sent to +84908724146: SMxxxxxxxxxxxxxxxx
```

Hoặc khi lỗi:
```
[SMS] Error sending SMS: Error: accountSid must start with AC
```

---

## 🔐 Bảo mật

### ✅ Đã làm
- Credentials lưu trong `.env` (không commit lên Git)
- Auto format số điện thoại
- Validation input

### 🔜 Nên làm
- Rate limiting (giới hạn số lần gửi/IP)
- Whitelist số điện thoại
- SMS queue (Bull/BullMQ)

---

## 💡 Lựa chọn thay thế (rẻ hơn)

### 1. SMS Gateway Việt Nam (rẻ hơn)

**VietGuys SMS:**
- Giá: ~400-600 VNĐ/SMS
- Website: https://vietguys.biz
- Cần đăng ký doanh nghiệp

**SMSAPI.vn:**
- Giá: ~500-700 VNĐ/SMS
- Website: https://smsapi.vn

**Esms.vn:**
- Giá: ~450-650 VNĐ/SMS
- Website: https://esms.vn

### 2. Tắt SMS, chỉ dùng Email

**Ưu điểm:**
- ✅ Miễn phí hoàn toàn
- ✅ Dễ setup (đã có)
- ✅ Có thể đính kèm vé PDF

**Nhược điểm:**
- ❌ Khách hàng ít check email
- ❌ Email có thể vào spam

**Cách tắt SMS:**
```bash
# Comment out trong .env
# TWILIO_ACCOUNT_SID="..."
# TWILIO_AUTH_TOKEN="..."
# TWILIO_PHONE_NUMBER="..."
```

---

## ✅ Checklist setup

- [ ] Đã tạo tài khoản Twilio
- [ ] Đã verify số điện thoại 0908724146
- [ ] Đã copy Account SID
- [ ] Đã copy Auth Token
- [ ] Đã mua số điện thoại Twilio
- [ ] Đã cập nhật TWILIO_ACCOUNT_SID trong .env
- [ ] Đã cập nhật TWILIO_AUTH_TOKEN trong .env
- [ ] Đã cập nhật TWILIO_PHONE_NUMBER trong .env
- [ ] Đã restart server
- [ ] Đã test gửi SMS thành công
- [ ] Đã nhận được SMS tại 0908724146

---

## 📞 Hỗ trợ

**Twilio Support:**
- Email: help@twilio.com
- Docs: https://www.twilio.com/docs/sms
- Console: https://console.twilio.com

**Hệ thống:**
- Check logs server để debug
- Xem SMS logs trên Twilio Console

---

## 🎁 Khuyến nghị

### Giai đoạn đầu (Testing)
✅ **Sử dụng Trial account** ($15.50 credits miễn phí)
- Verify số 0908724146
- Test với số này
- Không tốn tiền

### Giai đoạn production (< 100 vé/tháng)
✅ **Tắt SMS, chỉ dùng Email**
- Chi phí: $0
- Email đã đủ cho thông báo

### Giai đoạn mở rộng (> 100 vé/tháng)
✅ **Nâng cấp Twilio hoặc dùng SMS Gateway VN**
- Twilio: ~$5-30/tháng
- Gateway VN: Rẻ hơn ~50%

---

Chúc bạn setup thành công! 🚀
