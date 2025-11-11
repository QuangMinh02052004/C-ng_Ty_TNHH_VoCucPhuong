# 📱 Hướng dẫn QR Code vé xe - Xe Võ Cúc Phương

## 🎯 Tổng quan

QR Code vé xe đã được **nâng cấp** để hiển thị thông tin đầy đủ khi quét bằng camera điện thoại!

### Trước (❌ Cũ):
- QR code chứa JSON data
- Khi quét chỉ hiện chuỗi text khó đọc
- Người dùng không hiểu thông tin

### Bây giờ (✅ Mới):
- QR code chứa **URL** đến trang xem vé
- Khi quét sẽ **tự động mở trang web** hiển thị:
  - Thông tin khách hàng
  - Thông tin chuyến đi
  - Thông tin xe
  - Trạng thái vé
  - QR code check-in

---

## 🔄 Cách hoạt động

### 1. Khi tạo vé mới:
```
Booking được tạo
    ↓
QR Code Service tạo URL: https://domain.com/ve/ABC123
    ↓
QR Code chứa URL này
    ↓
Lưu vào database
```

### 2. Khi quét QR code:
```
User quét QR bằng camera
    ↓
Camera phát hiện URL
    ↓
Tự động mở browser
    ↓
Hiển thị trang /ve/ABC123
    ↓
Trang gọi API /api/bookings/ABC123
    ↓
Hiển thị thông tin đầy đủ
```

---

## 📂 Files đã được cập nhật

### 1. QR Code Service
**File:** [src/services/qrcode.service.ts](src/services/qrcode.service.ts:86-121)

```typescript
export async function generateTicketQRCode({
    bookingCode,
    // ... other params
}: GenerateTicketQRParams): Promise<string> {
    // Tạo URL đến trang xem vé
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const ticketUrl = `${baseUrl}/ve/${bookingCode}`;

    // Tạo QR code chứa URL
    const qrCodeDataURL = await QRCode.toDataURL(ticketUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
    });

    return qrCodeDataURL;
}
```

### 2. API Public để lấy thông tin vé
**File:** [src/app/api/bookings/[bookingCode]/route.ts](src/app/api/bookings/[bookingCode]/route.ts)

- **Endpoint:** `GET /api/bookings/[bookingCode]`
- **Public:** Không cần authentication
- **Response:** Thông tin đầy đủ của vé (đã ẩn thông tin nhạy cảm)

### 3. Trang xem vé công khai
**File:** [src/app/ve/[bookingCode]/page.tsx](src/app/ve/[bookingCode]/page.tsx)

- **URL:** `/ve/[bookingCode]`
- **Ví dụ:** `/ve/ABC123`
- **Public:** Ai cũng có thể truy cập
- **Responsive:** Hoạt động tốt trên mobile

---

## 🎨 Giao diện trang xem vé

### Thông tin hiển thị:

1. **Header**
   - Icon vé lớn
   - Tiêu đề "Thông tin vé xe"
   - Mã vé nổi bật

2. **Route Card** (Gradient xanh)
   - Điểm đi → Điểm đến
   - Thời gian di chuyển
   - Khoảng cách

3. **Status Badge**
   - Trạng thái vé (màu sắc phân biệt)
   - Check-in status

4. **Thông tin khách hàng**
   - Họ tên
   - Số điện thoại

5. **Thông tin chuyến đi**
   - Ngày đi (format đầy đủ)
   - Giờ xuất bến
   - Số ghế
   - Loại xe

6. **Thông tin xe** (nếu có)
   - Biển số xe
   - Loại xe

7. **Giá vé**
   - Tổng tiền (nổi bật)
   - Phương thức thanh toán
   - Trạng thái thanh toán

8. **QR Code check-in**
   - Hiển thị QR code lớn
   - Hướng dẫn sử dụng

9. **Footer**
   - Thời gian đặt vé
   - Nút "Về trang chủ"
   - Nút "Liên hệ hỗ trợ"

---

## 🌈 Màu sắc & Design

### Status Colors:
```css
PAID (Đã thanh toán):    bg-green-100 text-green-800
CONFIRMED (Đã xác nhận): bg-blue-100 text-blue-800
PENDING (Chờ thanh toán): bg-yellow-100 text-yellow-800
CANCELLED (Đã hủy):      bg-red-100 text-red-800
COMPLETED (Hoàn thành):  bg-gray-100 text-gray-800
```

### Background:
- Gradient: `from-blue-50 via-sky-50 to-blue-50`
- Cards: White với shadow-2xl
- Accents: Blue-600 và Sky-600

---

## 🚀 Cách sử dụng

### 1. Test trên máy tính:

```
1. Tạo vé mới (có QR code)
2. Lấy booking code (VD: ABC123)
3. Mở browser: http://localhost:3000/ve/ABC123
4. Xem thông tin vé đầy đủ
```

### 2. Test trên điện thoại:

#### Cách 1: Direct URL
```
1. Mở Safari/Chrome trên điện thoại
2. Nhập: http://[YOUR_IP]:3000/ve/ABC123
3. Xem thông tin vé
```

#### Cách 2: Quét QR Code (Cần deploy)
```
1. Deploy lên server có domain
2. Cập nhật NEXT_PUBLIC_BASE_URL
3. Tạo vé mới
4. Quét QR code bằng camera điện thoại
5. Tự động mở trang web
```

---

## ⚙️ Cấu hình

### Environment Variables

Thêm vào file `.env.local`:

```bash
# Base URL cho QR Code (production)
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Hoặc dùng localhost cho development (mặc định)
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Lưu ý:**
- Development: Dùng `http://localhost:3000`
- Production: Dùng domain thực tế (VD: `https://xevocucphuong.com`)
- **Quan trọng:** Phải có `https://` trong production để camera có thể mở

---

## 📱 Test QR Code

### Cách test không cần deploy:

1. **Sử dụng ngrok:**
```bash
# Cài ngrok
npm install -g ngrok

# Chạy ngrok
ngrok http 3000

# Copy URL public (VD: https://abc123.ngrok.io)
# Cập nhật .env.local:
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io

# Restart server
npm run dev

# Tạo vé mới -> Quét QR code bằng điện thoại
```

2. **Sử dụng LocalTunnel:**
```bash
# Cài localtunnel
npm install -g localtunnel

# Chạy localtunnel
lt --port 3000

# Copy URL và cập nhật .env.local
```

---

## 🔒 Bảo mật

### API Public `/api/bookings/[bookingCode]`:

**Đã ẩn thông tin:**
- User ID
- Payment transaction ID
- Internal metadata

**Hiển thị công khai:**
- Thông tin khách hàng (tên, SĐT, email)
- Thông tin chuyến đi
- Trạng thái vé
- QR code

**Lý do:** Người có booking code đã được coi là chủ sở hữu hợp lệ của vé.

**Rủi ro:** Nếu ai đó biết booking code, họ có thể xem thông tin vé.

**Giải pháp tương lai:**
- Thêm PIN/OTP verification
- Rate limiting
- Link hết hạn

---

## 📊 Flow hoàn chỉnh

### Khi khách đặt vé:

```mermaid
User đặt vé
    ↓
Tạo booking trong DB
    ↓
Generate QR code với URL: /ve/{bookingCode}
    ↓
Lưu QR code vào booking.qrCode
    ↓
Gửi email với QR code
    ↓
User nhận email
```

### Khi khách check-in:

```mermaid
User đến bến xe
    ↓
Mở camera điện thoại
    ↓
Quét QR code trên vé
    ↓
Camera phát hiện URL
    ↓
Tự động mở trình duyệt
    ↓
Load trang /ve/{bookingCode}
    ↓
Hiển thị thông tin vé đầy đủ
    ↓
Staff kiểm tra thông tin
    ↓
Check-in thành công
```

### Khi admin check-in:

```mermaid
Staff mở trang admin
    ↓
Vào trang Quản lý vé
    ↓
Click "Check-in"
    ↓
Quét QR code hoặc nhập mã
    ↓
Hệ thống verify booking
    ↓
Cập nhật status: checkedIn = true
    ↓
Hiển thị thông báo thành công
```

---

## 🐛 Troubleshooting

### QR code không quét được?

**Kiểm tra:**
1. QR code có rõ ràng không? (Độ phân giải đủ cao)
2. URL trong QR code có đúng không?
3. Domain có accessible từ điện thoại không?

**Fix:**
```bash
# Kiểm tra QR content
# In ra console khi generate QR code
console.log('QR URL:', ticketUrl)
```

### Trang /ve/[bookingCode] lỗi 404?

**Kiểm tra:**
1. File có đúng path không? `src/app/ve/[bookingCode]/page.tsx`
2. Server đã restart chưa?
3. Booking code có tồn tại trong DB không?

### Camera không tự động mở trang web?

**Nguyên nhân:**
- URL phải có `http://` hoặc `https://`
- iOS Safari có thể cần confirm trước khi mở
- Một số camera app không hỗ trợ

**Giải pháp:**
- Dùng camera native của iOS/Android
- Hoặc dùng app QR scanner chuyên dụng

---

## 📝 Notes

### Format booking code:
- Độ dài: 6-10 ký tự
- Format: Chữ hoa + số (VD: ABC123)
- Unique trong hệ thống

### QR Code specs:
- Error correction: High (H)
- Size: 300x300 px
- Format: PNG
- Color: Black & White
- Margin: 2

### Trang /ve/[bookingCode]:
- Responsive: Mobile-first
- Loading state: Spinner
- Error state: User-friendly message
- SEO: Không cần (private page)

---

## 🎯 Roadmap

### Tính năng sắp tới:

- [ ] PWA offline support
- [ ] Cache thông tin vé
- [ ] Save to Apple Wallet / Google Pay
- [ ] Push notification khi gần giờ đi
- [ ] Real-time update status
- [ ] Multi-language support
- [ ] Share vé qua social media

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check console logs
2. Verify API response
3. Test trên nhiều devices
4. Contact dev team

---

**Chúc bạn triển khai thành công! 🚀**
