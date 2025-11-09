# 💳 Hướng dẫn sử dụng hệ thống thanh toán

## 🎯 Tổng quan

Hệ thống thanh toán của Xe Võ Cúc Phương hỗ trợ:
- ✅ **VietQR**: Quét mã QR để chuyển khoản ngân hàng (MBBank, VCB, ACB, ...)
- ✅ **Xác nhận thủ công**: Admin/Staff xác nhận thanh toán qua giao diện quản lý
- ✅ **Theo dõi real-time**: Dashboard hiển thị số liệu thống kê theo thời gian thực

---

## 🚀 Luồng hoạt động

### 1. Khách hàng đặt vé

```
Trang đặt vé (/dat-ve)
  ↓
Điền thông tin (Tên, SĐT, Email, Tuyến, Ngày, Giờ, Số ghế)
  ↓
Nhấn "Đặt vé ngay"
  ↓
API tạo booking (status = PENDING)
  ↓
Trang thành công (/dat-ve/thanh-cong)
  ├─ Hiển thị thông tin vé
  ├─ QR Code vé xe (để check-in)
  └─ QR Code thanh toán (VietQR)
```

### 2. Khách hàng thanh toán

#### Cách 1: Quét QR Code (Tự động)

```
Mở app ngân hàng (Momo, ZaloPay, Banking app)
  ↓
Quét mã QR thanh toán trên trang thành công
  ↓
Kiểm tra thông tin:
  - Số tài khoản: [Số TK công ty]
  - Tên: CÔNG TY TNHH VÕ CÚC PHƯƠNG
  - Số tiền: [Tự động điền]
  - Nội dung: XEVCP [Mã vé]
  ↓
Xác nhận chuyển khoản
  ↓
💰 Tiền được chuyển vào tài khoản công ty
```

#### Cách 2: Chuyển khoản thủ công

```
Thông tin chuyển khoản:
├─ Ngân hàng: MBBank (hoặc ngân hàng khác)
├─ Số tài khoản: 0908724146 (hoặc STK thực tế)
├─ Tên: CONG TY TNHH VO CUC PHUONG
├─ Số tiền: [Tổng tiền vé]
└─ Nội dung: XEVCP [Mã vé] (VD: XEVCP VCP240109001)
```

### 3. Admin/Staff xác nhận thanh toán

```
Đăng nhập admin (/auth/login)
  ↓
Vào trang "Thanh toán" (/admin/payments)
  ↓
Xem danh sách vé chờ thanh toán
  ↓
Kiểm tra lịch sử chuyển khoản ngân hàng
  ↓
Tìm giao dịch khớp với mã vé
  ↓
Nhấn "Xác nhận" để đánh dấu đã thanh toán
  ↓
✅ Booking status: PENDING → PAID
✅ Dashboard cộng doanh thu
```

---

## 📊 Dashboard & Thống kê

### Admin Dashboard (`/admin`)

#### Hiển thị:
- 🎫 **Tổng vé đã đặt**: Tất cả bookings (bao gồm PENDING, PAID, COMPLETED)
- ⏳ **Vé chờ thanh toán**: Bookings có status = PENDING
- ✅ **Vé đã hoàn thành**: Bookings có status = COMPLETED
- 💰 **Tổng doanh thu**: Tổng tiền của vé PAID + COMPLETED

#### Link nhanh:
- 💳 **Thanh toán**: `/admin/payments` - Xác nhận thanh toán (có badge số vé chờ)
- 🎫 **Quản lý vé**: `/admin/bookings` - Xem tất cả vé
- 🚌 **Tuyến đường**: `/admin/routes` - Quản lý tuyến
- 👥 **Người dùng**: `/admin/users` - Quản lý users

### Trang quản lý thanh toán (`/admin/payments`)

#### Thống kê tóm tắt:
- ⏳ **Vé chờ thanh toán**: Số lượng bookings PENDING
- 💰 **Tổng tiền chờ thu**: Tổng số tiền cần thu
- 💺 **Tổng số ghế đặt**: Tổng ghế của các vé chờ

#### Bảng danh sách:
| Cột | Mô tả |
|-----|-------|
| Mã vé | Booking code (VD: VCP240109001) |
| Khách hàng | Tên + SĐT |
| Tuyến | Điểm đi → Điểm đến |
| Ngày đi | Ngày + Giờ xuất bến |
| Ghế | Số ghế đặt |
| Tổng tiền | Số tiền cần thanh toán |
| Đặt lúc | Thời gian đặt vé |
| Thao tác | Nút "Chi tiết" và "Xác nhận" |

#### Modal chi tiết vé:
- ℹ️ Thông tin đặt vé (Mã, Status, Tuyến, Ngày, Ghế, Tổng tiền)
- 👤 Thông tin khách hàng (Tên, SĐT, Email)
- 🎫 QR Code vé xe
- ✅ Nút "Xác nhận đã thanh toán"

---

## 🔧 Cấu hình

### Environment Variables (`.env`)

```bash
# Thông tin tài khoản ngân hàng nhận tiền
BANK_ACCOUNT_NO=0908724146
BANK_ACCOUNT_NAME=CONG TY TNHH VO CUC PHUONG
BANK_CODE=970422  # MBBank bin code

# Hoặc các ngân hàng khác:
# VCB (Vietcombank): 970436
# ACB: 970416
# Techcombank: 970407
# VietinBank: 970415
```

### API VietQR

Hệ thống sử dụng **VietQR API** miễn phí để tạo QR code:
```
https://img.vietqr.io/image/{bankBin}-{accountNo}-compact2.png?amount={amount}&addInfo={description}&accountName={name}
```

**Ưu điểm:**
- ✅ Miễn phí, không cần đăng ký API key
- ✅ Tương thích với mọi app banking Việt Nam
- ✅ Tự động điền số tiền và nội dung chuyển khoản
- ✅ Hỗ trợ 40+ ngân hàng

**Fallback:**
- Nếu VietQR API không khả dụng, hệ thống tự động tạo QR code chứa JSON data

---

## 📋 API Endpoints

### 1. Tạo booking mới
```http
POST /api/bookings/create
Content-Type: application/json

{
  "routeId": "1",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "customerEmail": "email@example.com",  // optional
  "date": "2025-11-10",
  "departureTime": "06:00",
  "seats": 2
}

Response 201:
{
  "success": true,
  "data": {
    "booking": {
      "id": "...",
      "bookingCode": "VCP240109001",
      "totalPrice": 260000,
      "status": "PENDING",
      ...
    },
    "qrCodes": {
      "ticket": "data:image/png;base64,...",
      "payment": "data:image/png;base64,..."
    }
  }
}
```

### 2. Lấy danh sách vé chờ thanh toán (Admin only)
```http
GET /api/admin/payments/pending
Authorization: Session cookie

Response 200:
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### 3. Xác nhận thanh toán (Admin/Staff only)
```http
POST /api/admin/payments/confirm
Content-Type: application/json
Authorization: Session cookie

{
  "bookingId": "cm3f7...",
  "method": "BANK_TRANSFER",  // optional: CASH, BANK_TRANSFER, QRCODE, MOMO, VNPAY
  "transactionId": "FT24010912345",  // optional
  "notes": "Đã nhận tiền qua MB Bank"  // optional
}

Response 200:
{
  "success": true,
  "message": "Payment confirmed successfully"
}
```

### 4. Lấy thống kê dashboard (Admin only)
```http
GET /api/admin/stats
Authorization: Session cookie

Response 200:
{
  "success": true,
  "data": {
    "totalBookings": 125,
    "pendingBookings": 15,
    "paidBookings": 98,
    "completedBookings": 12,
    "totalRevenue": 45650000  // VNĐ
  }
}
```

---

## 🎨 UI/UX

### Trang đặt vé thành công

**Phần hiển thị màn hình:**
- ✅ Header xác nhận thành công (icon ✅, mã vé)
- 📋 Thông tin đặt vé (Tuyến, Ngày, Ghế, Tổng tiền)
- 👤 Thông tin khách hàng
- 🎫 QR Code vé xe (để check-in)
- 💳 QR Code thanh toán (quét để chuyển khoản)
- ⚠️ Lưu ý quan trọng
- 🔗 Các nút: "Về trang chủ", "Đặt vé khác", "🖨️ In vé"

**Phần in ra giấy:**
- 📄 Header công ty (Tên, Hotline, Email, Địa chỉ)
- 🎫 Tiêu đề "VÉ XE KHÁCH"
- 📊 Thông tin chi tiết vé
- 🎫 QR Code vé xe (để scan khi lên xe)
- ⚠️ Lưu ý quan trọng
- ⏰ Timestamp in vé
- 🚫 Ẩn các nút action và QR thanh toán

---

## 🧪 Test Flow

### Scenario 1: Đặt vé và thanh toán thành công

```bash
# 1. Mở trang đặt vé
http://localhost:3000/dat-ve

# 2. Điền thông tin
Tuyến: Sài Gòn → Xuân Lộc
Ngày: 10/11/2025
Giờ: 06:00
Số ghế: 2
Tên: Nguyễn Văn A
SĐT: 0901234567
Email: test@example.com

# 3. Nhấn "Đặt vé ngay"
→ Chuyển đến /dat-ve/thanh-cong
→ Hiển thị mã vé: VCP240109001
→ QR Code thanh toán xuất hiện

# 4. Kiểm tra dashboard
http://localhost:3000/admin
→ Vé đã đặt: +1
→ Vé chờ thanh toán: +1
→ Tổng doanh thu: 0 (chưa thanh toán)

# 5. Xác nhận thanh toán
http://localhost:3000/admin/payments
→ Thấy vé VCP240109001 trong bảng
→ Nhấn "Xác nhận"
→ Booking status: PENDING → PAID

# 6. Kiểm tra dashboard lại
→ Vé chờ thanh toán: -1
→ Tổng doanh thu: +260,000 đ ✅
```

### Scenario 2: In vé

```bash
# 1. Vào trang thành công
http://localhost:3000/dat-ve/thanh-cong

# 2. Nhấn "🖨️ In vé"
→ Mở print dialog
→ Chỉ in phần ticket (ẩn các nút và QR thanh toán)
→ Định dạng A4, fit 1 trang
```

### Scenario 3: Quét QR thanh toán

```bash
# 1. Mở app banking (Momo, ZaloPay, etc.)

# 2. Chọn "Quét QR"

# 3. Quét mã QR thanh toán trên trang thành công
→ App tự động điền:
  - Số tài khoản: 0908724146
  - Tên: CONG TY TNHH VO CUC PHUONG
  - Số tiền: 260,000
  - Nội dung: XEVCP VCP240109001

# 4. Xác nhận chuyển khoản
→ Tiền được chuyển vào tài khoản công ty

# 5. Admin kiểm tra SMS/Email thông báo từ ngân hàng

# 6. Admin xác nhận trên hệ thống (/admin/payments)
```

---

## 🔐 Bảo mật

### Phân quyền
- ✅ Chỉ ADMIN và STAFF được xác nhận thanh toán
- ✅ API `/api/admin/*` yêu cầu đăng nhập
- ✅ Middleware kiểm tra role

### Validation
- ✅ Zod schema validation cho tất cả input
- ✅ Kiểm tra booking tồn tại trước khi xác nhận
- ✅ Ngăn xác nhận trùng (booking đã PAID)

### Logging
- ✅ Log mọi thao tác xác nhận thanh toán
- ✅ Ghi nhận user thực hiện (email)
- ✅ Timestamp và metadata

---

## ✅ Checklist triển khai

### Development
- [x] Tạo API xác nhận thanh toán
- [x] Tạo API lấy danh sách vé chờ
- [x] Tạo trang quản lý thanh toán
- [x] Tích hợp VietQR
- [x] Cập nhật dashboard stats
- [x] Test flow hoàn chỉnh

### Production
- [ ] Cập nhật BANK_ACCOUNT_NO thật
- [ ] Cập nhật BANK_ACCOUNT_NAME thật
- [ ] Cập nhật BANK_CODE đúng ngân hàng
- [ ] Test QR code với app banking thật
- [ ] Thiết lập webhook (nếu có) để tự động xác nhận thanh toán
- [ ] Train admin/staff cách sử dụng

---

## 🚀 Tính năng nâng cao (Tương lai)

### 1. Webhook tự động xác nhận
```
Ngân hàng → Webhook → API xác nhận tự động
  ↓
Không cần admin xác nhận thủ công
```

### 2. Tích hợp cổng thanh toán trực tuyến
- VNPay
- MoMo
- ZaloPay

### 3. Thông báo real-time
- WebSocket hoặc Server-Sent Events
- Admin nhận thông báo ngay khi có vé mới

### 4. Export báo cáo
- Xuất Excel danh sách vé theo ngày/tháng
- Biểu đồ doanh thu

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, liên hệ:
- 📞 Hotline: 02519 999 975
- 📧 Email: vocucphuong0018@gmail.com
