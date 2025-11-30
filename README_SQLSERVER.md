# Hướng dẫn Setup SQL Server cho Dự án Xe Võ Cúc Phương

## 📋 Tổng quan

Dự án sử dụng **Microsoft SQL Server** với **mssql** package (native driver). **Không sử dụng Prisma ORM**.

## 🔧 Yêu cầu

- **SQL Server** (Express, Developer, hoặc Enterprise)
- **SQL Server Management Studio (SSMS)** hoặc Azure Data Studio
- **Node.js** 18+ và **npm**
- Thông tin kết nối:
  - Server: `localhost,1433`
  - Database: `XeVoCucPhuong`
  - User: `sa`
  - Password: `Minhlion02052004`

## 📦 Cấu trúc Code

### Database Layer
```
src/lib/
├── db.ts                    # Connection pool & query helpers
├── db-types.ts              # TypeScript types cho database
└── repositories/
    ├── user-repository.ts   # User, Account, Session queries
    ├── route-repository.ts  # Route queries
    └── booking-repository.ts # Booking & Payment queries
```

### SQL Scripts
```
sql-scripts/
├── 01_create_database.sql   # Tạo database
├── 02_create_tables.sql     # Tạo tất cả bảng
└── 03_seed_data.sql         # Insert routes & buses mẫu
```

### Seed Script
```
scripts/
└── seed-database.ts         # Seed users với password hash
```

## 🚀 Hướng dẫn Setup

### Bước 1: Cài đặt SQL Server

1. Tải SQL Server:
   - [SQL Server Express](https://www.microsoft.com/sql-server/sql-server-downloads) (Miễn phí)
   - [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)

2. Cài đặt với cấu hình:
   - Authentication: **Mixed Mode** (SQL Server + Windows)
   - SA Password: `Minhlion02052004`

### Bước 2: Tạo Database

#### Cách 1: Dùng SSMS (Khuyến nghị)

1. Mở SSMS và kết nối:
   - Server: `localhost` hoặc `localhost,1433`
   - Authentication: **SQL Server Authentication**
   - Login: `sa`
   - Password: `Minhlion02052004`

2. Chạy các SQL scripts theo thứ tự:

**File 1: Create Database**
```sql
-- Mở và chạy: sql-scripts/01_create_database.sql
```

**File 2: Create Tables**
```sql
-- Mở và chạy: sql-scripts/02_create_tables.sql
```

**File 3: Seed Routes & Buses**
```sql
-- Mở và chạy: sql-scripts/03_seed_data.sql
```

3. Verify:
```sql
-- Kiểm tra database
USE XeVoCucPhuong;
GO

SELECT * FROM routes;
SELECT * FROM buses;
```

### Bước 3: Cài đặt Dependencies

```bash
# Install all packages
npm install

# Packages chính:
# - mssql: SQL Server driver
# - @types/mssql: TypeScript types
# - bcryptjs: Hash passwords
```

### Bước 4: Cấu hình Environment

File `.env` đã được tạo sẵn với connection string SQL Server:

```env
DATABASE_URL="sqlserver://localhost:1433;database=XeVoCucPhuong;user=sa;password=Minhlion02052004;encrypt=true;trustServerCertificate=true"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
# ... các biến khác
```

> ⚠️ **Lưu ý**: Thay đổi `NEXTAUTH_SECRET` trong production!

### Bước 5: Seed Users

Seed dữ liệu users với password đã hash:

```bash
npm run seed
```

Script sẽ tạo:
- **Admin**: `admin@vocucphuong.com` / `admin123456`
- **Staff**: `staff@vocucphuong.com` / `staff123456`
- **User**: `user@example.com` / `user123456`

### Bước 6: Chạy Ứng Dụng

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

Truy cập: http://localhost:3000

## 📖 Sử dụng Database Layer

### Query Basic

```typescript
import { query, queryOne } from '@/lib/db';

// Select multiple
const users = await query('SELECT * FROM users');

// Select one
const user = await queryOne('SELECT * FROM users WHERE id = @id', { id: '123' });

// Insert
await query(
  'INSERT INTO users (id, email, name) VALUES (@id, @email, @name)',
  { id: crypto.randomUUID(), email: 'test@test.com', name: 'Test' }
);
```

### Sử dụng Repositories

```typescript
import { UserRepository } from '@/lib/repositories/user-repository';
import { RouteRepository } from '@/lib/repositories/route-repository';
import { BookingRepository } from '@/lib/repositories/booking-repository';

// User queries
const user = await UserRepository.findByEmail('admin@vocucphuong.com');
const newUser = await UserRepository.create({
  email: 'new@example.com',
  name: 'New User',
  password: await hashPassword('password123'),
});

// Route queries
const routes = await RouteRepository.findActive();
const route = await RouteRepository.findById('route-id');

// Booking queries
const booking = await BookingRepository.findByCode('BOOK123');
const userBookings = await BookingRepository.findByUserId('user-id');

// Create booking with payment (transaction)
const { booking, payment } = await BookingRepository.createWithPayment({
  booking: { ...bookingData },
  payment: { ...paymentData },
});
```

### Transaction

```typescript
import { transaction, sql } from '@/lib/db';

await transaction(async (tx) => {
  const request = new sql.Request(tx);

  // Multiple queries in transaction
  await request.query('INSERT INTO ...');
  await request.query('UPDATE ...');

  // Auto commit nếu thành công, rollback nếu lỗi
});
```

## 🗂️ Database Schema

### Tables

1. **users** - Người dùng
2. **accounts** - OAuth accounts
3. **sessions** - Sessions (NextAuth)
4. **routes** - Tuyến đường
5. **buses** - Xe buýt
6. **schedules** - Lịch trình
7. **bookings** - Đặt vé
8. **payments** - Thanh toán

### Relationships

```
users (1) ─── (*) bookings
routes (1) ─── (*) bookings
routes (1) ─── (*) schedules
buses (1) ─── (*) schedules
schedules (1) ─── (*) bookings
bookings (1) ─── (1) payments
```

## ✅ Test Connection

Tạo file `test-connection.ts`:

```typescript
import { query } from './src/lib/db';
import { UserRepository } from './src/lib/repositories/user-repository';

async function test() {
  console.log('Testing SQL Server connection...');

  // Test raw query
  const result = await query('SELECT @@VERSION as version');
  console.log('SQL Server version:', result[0].version);

  // Test repository
  const users = await UserRepository.findAll({ limit: 5 });
  console.log('Users:', users.length);

  const routes = await query('SELECT COUNT(*) as total FROM routes');
  console.log('Routes:', routes[0].total);

  console.log('✅ Connection successful!');
}

test().catch(console.error);
```

Chạy:
```bash
npx tsx test-connection.ts
```

## 🛠️ Troubleshooting

### Lỗi: Cannot connect to SQL Server

**Giải pháp:**

1. Kiểm tra SQL Server Service đang chạy:
   - Windows: Services → SQL Server (MSSQLSERVER)

2. Enable TCP/IP:
   - SQL Server Configuration Manager
   - SQL Server Network Configuration → Protocols
   - Enable TCP/IP
   - Restart SQL Server Service

3. Kiểm tra firewall port 1433

### Lỗi: Login failed for user 'sa'

**Giải pháp:**

1. Kiểm tra password trong `.env`
2. Enable SQL Server Authentication:
   - SSMS → Right-click Server → Properties → Security
   - Chọn "SQL Server and Windows Authentication mode"
   - Restart SQL Server

### Lỗi: Database does not exist

**Giải pháp:**
```sql
-- Tạo lại database
CREATE DATABASE XeVoCucPhuong;
```

### Lỗi: Connection timeout

**Giải pháp:**

Kiểm tra connection string trong `.env`:
```env
# Format đúng:
DATABASE_URL="sqlserver://localhost:1433;database=XeVoCucPhuong;user=sa;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=true"
```

## 📝 Migration & Updates

Khi cần thay đổi schema:

1. Viết SQL ALTER script:
```sql
-- migrations/001_add_column.sql
USE XeVoCucPhuong;
GO

ALTER TABLE users
ADD phoneVerified BIT DEFAULT 0;
GO
```

2. Chạy trong SSMS
3. Update TypeScript types trong `db-types.ts`
4. Update repositories nếu cần

## 🔒 Security Best Practices

1. **Production**: Đổi SA password
2. **Production**: Bật encryption (remove `trustServerCertificate=true`)
3. **Production**: Tạo database user riêng (không dùng sa)
4. **Production**: Sử dụng connection pooling
5. **Luôn luôn**: Dùng parameterized queries (tránh SQL injection)

## 📞 Support & Resources

- [mssql package docs](https://www.npmjs.com/package/mssql)
- [SQL Server docs](https://learn.microsoft.com/sql/sql-server/)
- [TypeScript SQL Server guide](https://learn.microsoft.com/sql/connect/node-js/node-js-driver-for-sql-server)

---

**Chúc bạn setup thành công! 🎉**
