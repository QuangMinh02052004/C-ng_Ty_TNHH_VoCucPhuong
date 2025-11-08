# 🗄️ Hướng Dẫn Setup Database - Xe Võ Cúc Phương

## 📋 Các bước setup database (chỉ cần làm 1 lần)

### Bước 1: Chuẩn bị file .env

Tạo file `.env` trong thư mục gốc của project với nội dung:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/xe_vo_cuc_phuong"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

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

**⚠️ Lưu ý:**
- Thay `your-secret-key-here` bằng key thật (generate bằng: `openssl rand -base64 32`)
- Thay `your-gmail-app-password` bằng App Password của Gmail
- SMS config có thể bỏ qua nếu không dùng

---

### Bước 2: Start Prisma Database (Chọn 1 trong 2 cách)

#### **Cách 1: Dùng Prisma Local Database (Đơn giản nhất - Khuyên dùng)**

```bash
npx prisma dev
```

Lệnh này sẽ:
- Tự động tạo database local cho bạn
- Cập nhật `DATABASE_URL` trong `.env`
- Không cần cài PostgreSQL thủ công

#### **Cách 2: Dùng PostgreSQL có sẵn trên máy**

Nếu bạn đã có PostgreSQL:

1. Tạo database:
```bash
createdb xe_vo_cuc_phuong
```

2. Cập nhật `DATABASE_URL` trong `.env` với thông tin kết nối của bạn

---

### Bước 3: Push Schema lên Database

```bash
npx dotenv -e .env -- npx prisma db push
```

Lệnh này sẽ tạo tất cả bảng trong database theo schema.

---

### Bước 4: Generate Prisma Client

```bash
npx dotenv -e .env -- npx prisma generate
```

Lệnh này tạo code TypeScript để làm việc với database.

---

### Bước 5: Seed Database (Tạo dữ liệu mẫu)

```bash
npx dotenv -e .env -- npx prisma db seed
```

Lệnh này sẽ tạo:
- ✅ Admin user: `admin@vocucphuong.com` / `admin123456`
- ✅ Staff user: `staff@vocucphuong.com` / `staff123456`
- ✅ Test user: `user@example.com` / `user123456`
- ✅ Tất cả tuyến đường (Long Khánh ↔ Sài Gòn, Vũng Tàu, Đà Lạt, ...)

---

## 🚀 Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem website.

---

## 🔐 Đăng nhập thử nghiệm

Sau khi seed database, bạn có thể đăng nhập với các tài khoản:

### Admin (Quản trị viên)
- Email: `admin@vocucphuong.com`
- Password: `admin123456`
- Truy cập: `/admin` để vào trang quản trị

### Staff (Nhân viên)
- Email: `staff@vocucphuong.com`
- Password: `staff123456`
- Truy cập: `/admin` để vào trang quản trị

### User (Khách hàng)
- Email: `user@example.com`
- Password: `user123456`
- Chỉ có thể đặt vé và xem profile

---

## 🛠️ Các lệnh hữu ích

### Xem database bằng Prisma Studio (Giao diện đẹp)
```bash
npx prisma studio
```

### Reset database (Xóa hết và tạo lại)
```bash
npx dotenv -e .env -- npx prisma db push --force-reset
npx dotenv -e .env -- npx prisma db seed
```

### Update schema sau khi sửa prisma/schema.prisma
```bash
npx dotenv -e .env -- npx prisma db push
npx dotenv -e .env -- npx prisma generate
```

---

## ❗ Troubleshooting

### Lỗi: "Can't reach database server"
**Nguyên nhân:** Database chưa chạy

**Giải pháp:**
```bash
npx prisma dev
```

---

### Lỗi: "Missing required environment variable: DATABASE_URL"
**Nguyên nhân:** File `.env` chưa được load

**Giải pháp:** Dùng `npx dotenv -e .env --` trước mọi lệnh prisma:
```bash
npx dotenv -e .env -- npx prisma db push
```

---

### Lỗi: "Error: P1001 Can't reach database server"
**Nguyên nhân:** DATABASE_URL sai hoặc database chưa start

**Giải pháp:**
1. Kiểm tra `.env` file có `DATABASE_URL` chưa
2. Chạy `npx prisma dev` để start database

---

### Lỗi seed: "Cannot find module '@prisma/client'"
**Nguyên nhân:** Chưa generate Prisma Client

**Giải pháp:**
```bash
npx dotenv -e .env -- npx prisma generate
npx dotenv -e .env -- npx prisma db seed
```

---

## 📝 TÓM TẮT - Chạy lần đầu (Copy & Paste)

```bash
# 1. Tạo file .env (copy nội dung ở trên)

# 2. Start database
npx prisma dev

# 3. Push schema
npx dotenv -e .env -- npx prisma db push

# 4. Generate client
npx dotenv -e .env -- npx prisma generate

# 5. Seed data
npx dotenv -e .env -- npx prisma db seed

# 6. Chạy server
npm run dev
```

Xong! Truy cập [http://localhost:3000](http://localhost:3000) và đăng nhập bằng:
- **Admin:** `admin@vocucphuong.com` / `admin123456`

---

## 🎯 Tiếp theo

Sau khi database đã chạy, bạn có thể:
1. ✅ Đăng nhập/đăng ký tài khoản
2. ✅ Xem profile tại `/profile`
3. ✅ Truy cập admin panel tại `/admin` (nếu là ADMIN/STAFF)
4. 🚧 Đặt vé online (đang phát triển)
5. 🚧 Quản lý vé đã đặt (đang phát triển)
