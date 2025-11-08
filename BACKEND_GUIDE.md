# 📚 Hướng Dẫn Backend - Xe Võ Cúc Phương

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt & Cấu hình](#cài-đặt--cấu-hình)
3. [Database Schema](#database-schema)
4. [Authentication](#authentication)
5. [API Endpoints](#api-endpoints)
6. [Services](#services)
7. [Admin Dashboard](#admin-dashboard)
8. [Booking Flow](#booking-flow)

---

## 🎯 Giới thiệu

Hệ thống backend cho website đặt vé xe được xây dựng với:
- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **NextAuth.js** (Authentication)
- **Nodemailer** (Email)
- **Twilio** (SMS - optional)
- **QRCode** & **jsPDF** (Vé điện tử)

---

## ⚙️ Cài đặt & Cấu hình

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env` và cấu hình:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xe_vo_cuc_phuong"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate: openssl rand -base64 32

# Email (Gmail)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="vocucphuong0018@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
EMAIL_FROM="Xe Võ Cúc Phương <vocucphuong0018@gmail.com>"

# SMS (Twilio - Optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_COMPANY_NAME="Xe Võ Cúc Phương"
NEXT_PUBLIC_COMPANY_PHONE="02519999975"
NEXT_PUBLIC_COMPANY_EMAIL="vocucphuong0018@gmail.com"
```

### 3. Setup Database

```bash
# Start Prisma Postgres (local)
npx prisma dev

# Hoặc kết nối database có sẵn, sau đó push schema:
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Tạo Admin User Đầu Tiên

```bash
# Sử dụng Prisma Studio
npx prisma studio

# Hoặc seed database (nếu có seed script)
npx prisma db seed
```

Tạo user admin thủ công trong Prisma Studio:
- Email: admin@example.com
- Password: (hash của password, dùng bcrypt)
- Role: ADMIN

---

## 🗄️ Database Schema

### Models Chính:

#### 1. **User** - Người dùng
```prisma
model User {
  id            String    // ID duy nhất
  email         String    // Email (unique)
  password      String?   // Password (hashed)
  name          String    // Tên
  phone         String?   // SĐT
  role          UserRole  // USER | STAFF | ADMIN
  ...
}
```

#### 2. **Route** - Tuyến đường
```prisma
model Route {
  id              String
  from            String   // Điểm đi
  to              String   // Điểm đến
  price           Int      // Giá vé (VND)
  duration        String   // Thời gian
  busType         String   // Loại xe
  operatingStart  String   // Giờ bắt đầu
  operatingEnd    String   // Giờ kết thúc
  ...
}
```

#### 3. **Booking** - Đặt vé
```prisma
model Booking {
  id            String
  bookingCode   String        // Mã vé (unique)
  customerName  String
  customerPhone String
  customerEmail String?
  routeId       String
  date          DateTime
  departureTime String
  seats         Int
  totalPrice    Int
  status        BookingStatus // PENDING | CONFIRMED | PAID | CANCELLED
  qrCode        String?
  ticketUrl     String?
  ...
}
```

#### 4. **Payment** - Thanh toán
```prisma
model Payment {
  id            String
  bookingId     String
  amount        Int
  method        PaymentMethod  // CASH | BANK_TRANSFER | QRCODE | VNPAY | MOMO
  status        PaymentStatus  // PENDING | COMPLETED | FAILED
  ...
}
```

---

## 🔐 Authentication

### Đăng ký (Register)

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "phone": "0123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "Nguyễn Văn A",
      "role": "USER"
    }
  }
}
```

### Đăng nhập (Login)

**Sử dụng NextAuth:**
```typescript
import { signIn } from 'next-auth/react';

const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
  redirect: false,
});
```

### Lấy Session

```typescript
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();

if (session) {
  console.log(session.user.name);
  console.log(session.user.role); // USER | STAFF | ADMIN
}
```

### Protected Routes

**Middleware tự động bảo vệ:**
- `/admin/*` - Chỉ ADMIN và STAFF
- `/staff/*` - Chỉ STAFF và ADMIN
- `/profile/*` - User đã đăng nhập
- `/my-bookings/*` - User đã đăng nhập

---

## 🌐 API Endpoints

### 1. Bookings

#### Tạo Đặt Vé
```http
POST /api/bookings/create
Content-Type: application/json

{
  "routeId": "route-id",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0123456789",
  "customerEmail": "user@example.com",
  "date": "2024-12-01",
  "departureTime": "08:00",
  "seats": 2,
  "userId": "user-id" // Optional nếu đã đăng nhập
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "...",
      "bookingCode": "VCP-20241201-1234",
      "totalPrice": 200000,
      "status": "PENDING"
    },
    "qrCodes": {
      "ticket": "data:image/png;base64,...",
      "payment": "data:image/png;base64,..."
    }
  }
}
```

---

## 🛠️ Services

### 1. Email Service

**File:** `src/services/email.service.ts`

**Sử dụng:**
```typescript
import { sendBookingConfirmationEmail } from '@/services/email.service';

await sendBookingConfirmationEmail({
  to: 'customer@example.com',
  customerName: 'Nguyễn Văn A',
  bookingCode: 'VCP-20241201-1234',
  route: 'Long Khánh → Sài Gòn',
  date: '01/12/2024',
  departureTime: '08:00',
  seats: 2,
  totalPrice: 200000,
});
```

### 2. SMS Service

**File:** `src/services/sms.service.ts`

**Sử dụng:**
```typescript
import { sendBookingConfirmationSMS } from '@/services/sms.service';

await sendBookingConfirmationSMS({
  to: '0123456789',
  customerName: 'Nguyễn Văn A',
  bookingCode: 'VCP-20241201-1234',
  route: 'Long Khánh → Sài Gòn',
  date: '01/12/2024',
  departureTime: '08:00',
});
```

### 3. QR Code Service

**File:** `src/services/qrcode.service.ts`

**Sử dụng:**
```typescript
import { generateTicketQRCode, generatePaymentQRCode } from '@/services/qrcode.service';

// QR vé
const ticketQR = await generateTicketQRCode({
  bookingCode: 'VCP-20241201-1234',
  customerName: 'Nguyễn Văn A',
  route: 'Long Khánh → Sài Gòn',
  date: '01/12/2024',
  departureTime: '08:00',
  seats: 2,
});

// QR thanh toán
const paymentQR = await generatePaymentQRCode({
  bookingCode: 'VCP-20241201-1234',
  amount: 200000,
});
```

### 4. PDF Service

**File:** `src/services/pdf.service.ts`

**Sử dụng:**
```typescript
import { generateTicketPDF } from '@/services/pdf.service';

const pdfBuffer = await generateTicketPDF({
  bookingCode: 'VCP-20241201-1234',
  customerName: 'Nguyễn Văn A',
  customerPhone: '0123456789',
  customerEmail: 'user@example.com',
  route: 'Long Khánh → Sài Gòn',
  routeFrom: 'Long Khánh',
  routeTo: 'Sài Gòn',
  date: '01/12/2024',
  departureTime: '08:00',
  seats: 2,
  totalPrice: 200000,
  qrCodeDataURL: ticketQR, // Base64 QR code
  busType: 'Limousine 16 chỗ',
  duration: '2h 30p',
});

// Save to file or send as attachment
```

---

## 👨‍💼 Admin Dashboard

### Truy cập:
- URL: `http://localhost:3000/admin`
- Yêu cầu: Role **ADMIN** hoặc **STAFF**

### Các chức năng:
1. **Dashboard** - Tổng quan hệ thống
2. **Quản lý vé** - Xem, sửa, hủy vé
3. **Tuyến đường** - Quản lý routes
4. **Người dùng** - Quản lý users
5. **Cài đặt** - Settings (chỉ ADMIN)

---

## 🎫 Booking Flow

### Luồng đặt vé:

1. **User chọn tuyến và thời gian**
   - Frontend gọi `/api/routes` để lấy danh sách tuyến

2. **User điền thông tin**
   - Tên, SĐT, Email, số ghế

3. **Tạo booking**
   - POST `/api/bookings/create`
   - Nhận mã vé + QR codes

4. **Gửi xác nhận**
   - Email confirmation (async)
   - SMS confirmation (async)

5. **Thanh toán**
   - Hiển thị QR thanh toán
   - User scan QR và chuyển khoản
   - Sau khi thanh toán: Gọi `/api/bookings/confirm-payment`

6. **Tạo vé điện tử**
   - Generate PDF ticket
   - Send qua email
   - User lưu hoặc print

7. **Check-in**
   - User show QR ticket
   - Staff scan QR để verify
   - Update booking status

---

## 🔧 Utils & Helpers

### File: `src/lib/utils.ts`

**Các hàm hữu ích:**
```typescript
// Generate booking code
const code = generateBookingCode(); // VCP-20241201-1234

// Format date
const formatted = formatDateVN(new Date()); // 01/12/2024

// Format currency
const price = formatCurrency(200000); // 200,000 đ

// Validate email/phone
const isValid = isValidEmail('user@example.com');
const isValidPhone = isValidPhone('0123456789');

// Hash password
const hashed = await hashPassword('password123');
const isMatch = await comparePassword('password123', hashed);
```

---

## 📝 TODO: Các tính năng cần phát triển tiếp

- [ ] Kết nối frontend booking form với API
- [ ] Tích hợp VNPay/MoMo thanh toán thật
- [ ] Quản lý schedules (lịch xe cụ thể)
- [ ] Chọn ghế ngồi cụ thể
- [ ] Report & Analytics cho admin
- [ ] Export dữ liệu Excel/CSV
- [ ] Push notifications
- [ ] Rate limiting & Security

---

## 🆘 Troubleshooting

### Database không kết nối được:
```bash
# Kiểm tra Prisma Postgres đang chạy
npx prisma dev

# Hoặc test connection
npx dotenv -e .env -- npx prisma db push
```

### NextAuth không hoạt động:
- Kiểm tra `NEXTAUTH_SECRET` đã được set
- Kiểm tra `NEXTAUTH_URL` đúng domain

### Email không gửi được:
- Sử dụng Gmail App Password (không dùng password thường)
- Enable "Less secure app access" hoặc tạo App Password

---

## 📞 Hỗ trợ

Liên hệ developer team nếu có vấn đề!
