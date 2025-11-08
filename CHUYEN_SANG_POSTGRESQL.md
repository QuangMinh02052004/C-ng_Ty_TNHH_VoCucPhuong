# 🔄 Hướng dẫn chuyển từ Prisma Dev sang PostgreSQL

## Tại sao nên chuyển?

- ✅ Production-ready
- ✅ Kết nối được với pgAdmin, DBeaver, TablePlus
- ✅ Backup và restore dễ dàng
- ✅ Performance tốt hơn cho production

---

## 📋 Các bước thực hiện

### Bước 1: Cài đặt PostgreSQL

**macOS (khuyên dùng Postgres.app):**
1. Tải từ: https://postgresapp.com/
2. Kéo vào Applications
3. Mở và click "Initialize" để start server

Hoặc dùng Homebrew:
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Kiểm tra đã cài thành công:**
```bash
psql --version
# Nên hiện: psql (PostgreSQL) 15.x
```

---

### Bước 2: Tạo Database

```bash
# Tạo database
createdb xe_vo_cuc_phuong

# Kiểm tra
psql -l | grep xe_vo_cuc_phuong
```

Nếu lỗi "command not found", thêm vào PATH:
```bash
# Thêm vào ~/.zshrc hoặc ~/.bash_profile
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
```

---

### Bước 3: Stop Prisma Dev

```bash
# Tìm process đang chạy
ps aux | grep "prisma dev"

# Kill process (thay PID bằng số thực tế)
kill <PID>
```

---

### Bước 4: Cập nhật .env

**Backup .env cũ:**
```bash
cp .env .env.backup
```

**Sửa DATABASE_URL trong .env:**
```env
# Comment dòng Prisma Dev cũ
# DATABASE_URL="prisma+postgres://localhost:51213/..."

# Thêm connection string PostgreSQL mới
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/xe_vo_cuc_phuong?schema=public"
```

**Nếu bạn đặt password khác khi cài PostgreSQL:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/xe_vo_cuc_phuong?schema=public"
```

---

### Bước 5: Push Schema

```bash
# Push schema lên PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

**Nếu thành công, sẽ thấy:**
```
✔ Your database is now in sync with your Prisma schema.
```

---

### Bước 6: Seed Data

```bash
npx prisma db seed
```

Sẽ tạo:
- ✅ 3 users (admin, staff, user)
- ✅ 8 routes

---

### Bước 7: Kiểm tra

**Mở Prisma Studio:**
```bash
npx prisma studio
```

Hoặc kết nối bằng pgAdmin:
- **Host:** localhost
- **Port:** 5432
- **Database:** xe_vo_cuc_phuong
- **Username:** postgres
- **Password:** postgres

---

### Bước 8: Test ứng dụng

```bash
npm run dev
```

Truy cập http://localhost:3000 và test đặt vé!

---

## 🔧 Troubleshooting

### Lỗi: "password authentication failed"

**Giải pháp 1 - Reset password:**
```bash
psql postgres
ALTER USER postgres PASSWORD 'postgres';
\q
```

**Giải pháp 2 - Tạo user mới:**
```bash
psql postgres
CREATE USER myuser WITH PASSWORD 'mypassword';
ALTER USER myuser CREATEDB;
\q
```

Rồi update .env:
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/xe_vo_cuc_phuong"
```

---

### Lỗi: "database does not exist"

```bash
# Tạo lại database
createdb xe_vo_cuc_phuong
```

---

### Lỗi: "connection refused"

PostgreSQL chưa chạy, start lại:
```bash
# Nếu dùng Homebrew
brew services start postgresql@15

# Nếu dùng Postgres.app
# Mở app và click "Start"
```

Kiểm tra PostgreSQL đang chạy:
```bash
pg_isready
# Nên hiện: /tmp:5432 - accepting connections
```

---

## 🎯 So sánh Prisma Dev vs PostgreSQL

| | Prisma Dev | PostgreSQL |
|---|---|---|
| Setup | 1 lệnh | Cài app |
| Start | Auto | Manual |
| Connection | HTTP API | TCP/IP |
| pgAdmin | ❌ | ✅ |
| Production | ❌ | ✅ |
| Backup | ❌ | ✅ |

---

## 📦 Backup & Restore

### Backup:
```bash
pg_dump xe_vo_cuc_phuong > backup.sql
```

### Restore:
```bash
psql xe_vo_cuc_phuong < backup.sql
```

---

## 🚀 Deploy lên Production

Khi deploy lên Vercel/Railway/Render:

1. Tạo PostgreSQL database trên:
   - [Supabase](https://supabase.com) (Free)
   - [Railway](https://railway.app) (Free tier)
   - [Neon](https://neon.tech) (Free)

2. Copy connection string

3. Add vào Environment Variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

4. Deploy!

---

## ✅ Kết luận

PostgreSQL là lựa chọn tốt nhất cho production. Nếu bạn:
- 🎯 Đang dev: Dùng Prisma Dev OK
- 🚀 Chuẩn bị deploy: Chuyển sang PostgreSQL
- 💼 Dự án thực tế: Dùng PostgreSQL ngay từ đầu
