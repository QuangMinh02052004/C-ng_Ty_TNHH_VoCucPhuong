# Hướng dẫn chuyển đổi sang SQL Server

## 📋 Tổng quan

Dự án đã được cấu hình để sử dụng **Microsoft SQL Server** thay vì PostgreSQL. Tất cả các file cần thiết đã được tạo sẵn.

## 🔧 Yêu cầu

- **SQL Server** đã cài đặt (Express, Developer, hoặc Enterprise)
- **SQL Server Management Studio (SSMS)** hoặc Azure Data Studio
- **Node.js** và **npm** đã cài đặt
- Thông tin kết nối SQL Server:
  - Server: `localhost,1433`
  - Database: `XeVoCucPhuong`
  - User: `sa`
  - Password: `Minhlion02052004`

## 📦 Các file đã được tạo

### 1. Cấu hình Prisma
- ✅ `prisma/schema.prisma` - Đã cập nhật provider sang `sqlserver`
- ✅ `.env` - Đã có connection string SQL Server

### 2. SQL Scripts
- ✅ `sql-scripts/01_create_database.sql` - Tạo database
- ✅ `sql-scripts/02_create_tables.sql` - Tạo tất cả bảng
- ✅ `sql-scripts/03_seed_data.sql` - Thêm dữ liệu mẫu (routes, buses)

## 🚀 Hướng dẫn Setup

### Cách 1: Sử dụng SQL Scripts (Khuyến nghị)

#### Bước 1: Mở SQL Server Management Studio (SSMS)

1. Kết nối với SQL Server:
   - Server name: `localhost` hoặc `localhost,1433`
   - Authentication: SQL Server Authentication
   - Login: `sa`
   - Password: `Minhlion02052004`

#### Bước 2: Tạo Database và Tables

1. Mở file `sql-scripts/01_create_database.sql`
2. Click "Execute" hoặc nhấn `F5` để chạy
3. Kiểm tra database đã được tạo

4. Mở file `sql-scripts/02_create_tables.sql`
5. Click "Execute" hoặc nhấn `F5` để chạy
6. Kiểm tra tất cả bảng đã được tạo:
   - users
   - accounts
   - sessions
   - routes
   - buses
   - schedules
   - bookings
   - payments

#### Bước 3: Thêm dữ liệu mẫu

1. Mở file `sql-scripts/03_seed_data.sql`
2. Click "Execute" hoặc nhấn `F5` để chạy
3. Kiểm tra dữ liệu routes và buses đã được thêm

#### Bước 4: Seed Users bằng Prisma

Vì password cần được hash bằng bcrypt, ta sẽ sử dụng Prisma để seed users:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Chạy seed script (sẽ tạo admin, staff, user)
npx prisma db seed
```

### Cách 2: Sử dụng Prisma (Nhanh hơn)

Nếu bạn muốn tạo mọi thứ tự động:

```bash
# 1. Tạo database trước bằng SSMS hoặc chạy 01_create_database.sql

# 2. Push schema lên database (tạo tất cả bảng)
npx prisma db push

# 3. Seed dữ liệu
npx prisma db seed
```

## ✅ Kiểm tra kết nối

Sau khi setup xong, kiểm tra kết nối:

```bash
# Test Prisma connection
npx prisma studio
```

Hoặc tạo file test:

```typescript
// test-connection.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('Users:', users)

  const routes = await prisma.route.findMany()
  console.log('Routes:', routes.length)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Chạy test:
```bash
npx tsx test-connection.ts
```

## 📊 Dữ liệu mặc định sau khi seed

### Users (qua Prisma seed)
- **Admin**:
  - Email: `admin@vocucphuong.com`
  - Password: `admin123456`

- **Staff**:
  - Email: `staff@vocucphuong.com`
  - Password: `staff123456`

- **User**:
  - Email: `user@example.com`
  - Password: `user123456`

### Routes (qua SQL script)
- 8 tuyến đường từ Long Khánh, Sài Gòn, Xuân Lộc

### Buses (qua SQL script)
- 8 xe buýt với các loại: Ghế ngồi, Giường nằm, Limousine

## 🔄 Migration và Cập nhật Schema

Khi cần thay đổi schema:

```bash
# Tạo migration
npx prisma migrate dev --name ten_migration

# Hoặc push trực tiếp (dev only)
npx prisma db push
```

## 🛠️ Troubleshooting

### Lỗi: "Cannot connect to SQL Server"

1. Kiểm tra SQL Server đã chạy:
   - Mở SQL Server Configuration Manager
   - Kiểm tra SQL Server Service đang running

2. Kiểm tra TCP/IP enabled:
   - SQL Server Configuration Manager > SQL Server Network Configuration
   - Enable TCP/IP
   - Restart SQL Server Service

3. Kiểm tra firewall:
   - Mở port 1433 cho SQL Server

### Lỗi: "Login failed for user 'sa'"

1. Kiểm tra password trong `.env` file
2. Kiểm tra SQL Server Authentication mode:
   - SSMS > Server Properties > Security
   - Chọn "SQL Server and Windows Authentication mode"
   - Restart SQL Server

### Lỗi: "Database does not exist"

Chạy lại script tạo database:
```bash
# Trong SSMS, chạy file 01_create_database.sql
```

### Lỗi Prisma: "Could not connect"

Kiểm tra format connection string trong `.env`:
```
DATABASE_URL="sqlserver://localhost:1433;database=XeVoCucPhuong;user=sa;password=Minhlion02052004;encrypt=true;trustServerCertificate=true"
```

## 📝 Lưu ý quan trọng

1. **Backup dữ liệu cũ** trước khi chuyển đổi
2. **Không commit file `.env`** vào git (đã có trong `.gitignore`)
3. **Thay đổi password mặc định** trong production
4. **Enable encryption** khi deploy production (bỏ `trustServerCertificate=true`)

## 🎯 Next Steps

Sau khi setup xong database:

1. Chạy ứng dụng:
```bash
npm run dev
```

2. Kiểm tra các tính năng:
   - Đăng nhập với tài khoản admin/staff/user
   - Xem danh sách tuyến đường
   - Tạo booking mới
   - Test payment flow

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
- SQL Server error log
- Application console log
- SSMS Activity Monitor

---

**Chúc bạn setup thành công! 🎉**
