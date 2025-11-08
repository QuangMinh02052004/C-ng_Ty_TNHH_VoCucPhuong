# ✅ Admin Dashboard - Hiển thị dữ liệu thật

## 🎯 Đã thay đổi gì?

### Trước (Mock Data):
```typescript
// Dữ liệu giả, cố định
setStats({
    totalBookings: 125,
    pendingBookings: 15,
    completedBookings: 98,
    totalRevenue: 45650000,
});
```

### Sau (Real Data):
```typescript
// Lấy từ database thật
const response = await fetch('/api/admin/stats');
setStats(result.data); // Data từ Prisma query
```

---

## 📊 Các chỉ số hiển thị

### 1. **Vé đã đặt** (Tổng số)
- **Query:** `prisma.booking.count()`
- **Hiển thị:** Tổng số vé trong database
- **Tăng khi:** Có người đặt vé (đã login hoặc chưa login)

### 2. **Vé chờ thanh toán**
- **Query:** `prisma.booking.count({ where: { status: 'PENDING' } })`
- **Hiển thị:** Vé có status = PENDING
- **Tăng khi:** Vừa đặt vé, chưa thanh toán

### 3. **Vé đã hoàn thành**
- **Query:** `prisma.booking.count({ where: { status: 'COMPLETED' } })`
- **Hiển thị:** Vé có status = COMPLETED
- **Tăng khi:** Admin đánh dấu vé đã hoàn tất chuyến đi

### 4. **Tổng doanh thu**
- **Query:** `prisma.booking.aggregate({ where: { OR: [{ status: 'PAID' }, { status: 'COMPLETED' }] }, _sum: { totalPrice: true } })`
- **Hiển thị:** Tổng tiền của vé đã thanh toán hoặc hoàn thành
- **Tăng khi:** Vé được thanh toán (status = PAID hoặc COMPLETED)

---

## 🔄 Luồng hoạt động

### Khi khách đặt vé:

1. **User đặt vé** (tại `/dat-ve`)
   - POST `/api/bookings/create`
   - Tạo record trong table `bookings`
   - Status mặc định: `PENDING`

2. **Database update:**
   - ✅ **Vé đã đặt:** +1
   - ✅ **Vé chờ thanh toán:** +1
   - ❌ **Vé đã hoàn thành:** 0 (vì chưa complete)
   - ❌ **Tổng doanh thu:** 0 (vì chưa thanh toán)

3. **Admin dashboard refresh:**
   - Auto fetch lại từ `/api/admin/stats`
   - Hiển thị số liệu cập nhật

---

## 🧪 Cách test

### Test 1: Đặt vé mới

```bash
# 1. Mở admin dashboard
http://localhost:3000/admin

# Ban đầu sẽ thấy:
Vé đã đặt: 0
Vé chờ thanh toán: 0
Vé đã hoàn thành: 0
Tổng doanh thu: 0.0M

# 2. Đặt 1 vé
http://localhost:3000/dat-ve
- Chọn tuyến: Long Khánh → Sài Gòn (120,000 đ)
- Điền thông tin
- Đặt vé

# 3. Refresh admin dashboard (F5)
Vé đã đặt: 1          ✅ Tăng lên!
Vé chờ thanh toán: 1  ✅ Tăng lên!
Vé đã hoàn thành: 0
Tổng doanh thu: 0.0M  ❌ Vẫn 0 (vì chưa thanh toán)
```

---

### Test 2: Thanh toán vé (thủ công qua Prisma Studio)

```bash
# 1. Mở Prisma Studio
http://localhost:5556

# 2. Vào table "Booking"

# 3. Tìm vé vừa đặt, click Edit

# 4. Đổi "status" từ "PENDING" → "PAID"

# 5. Save

# 6. Refresh admin dashboard
Vé đã đặt: 1
Vé chờ thanh toán: 0  ✅ Giảm xuống!
Vé đã hoàn thành: 0
Tổng doanh thu: 0.1M  ✅ Tăng lên! (120,000đ = 0.12M)
```

---

### Test 3: Đặt nhiều vé

```bash
# Đặt thêm 2 vé nữa:
- Vé 1: Sài Gòn → Xuân Lộc (130,000đ)
- Vé 2: Long Khánh → Sài Gòn (120,000đ)

# Kết quả:
Vé đã đặt: 3          ✅
Vé chờ thanh toán: 2  ✅
Vé đã hoàn thành: 0
Tổng doanh thu: 0.1M  (chỉ tính vé đầu đã thanh toán)
```

---

## 🔐 API Endpoint

**URL:** `/api/admin/stats`
**Method:** GET
**Auth:** Yêu cầu đăng nhập với role ADMIN hoặc STAFF

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBookings": 3,
    "pendingBookings": 2,
    "paidBookings": 1,
    "completedBookings": 0,
    "totalRevenue": 120000
  }
}
```

---

## 📁 Files đã thay đổi

### 1. `/src/app/api/admin/stats/route.ts` ✨ (MỚI)
API endpoint để lấy thống kê từ database

### 2. `/src/app/admin/page.tsx` 🔄 (CẬP NHẬT)
- Xóa mock data
- Fetch từ API `/api/admin/stats`
- Thêm loading state
- Thêm error handling

---

## 🎨 UI States

### Loading State
Khi đang fetch data:
```
🔄 Hiển thị skeleton loading (4 cards màu xám nhấp nháy)
```

### Success State
Khi có data:
```
📊 Hiển thị số liệu thật từ database
```

### Error State
Khi lỗi:
```
❌ Hiển thị thông báo lỗi màu đỏ
```

---

## 🚀 Features tiếp theo

### 1. Auto-refresh
Tự động refresh stats mỗi 30 giây:
```typescript
useEffect(() => {
    const interval = setInterval(() => {
        fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
}, []);
```

### 2. Manual refresh button
Thêm nút "🔄 Làm mới" để refresh thủ công

### 3. Real-time updates
Dùng WebSocket hoặc Server-Sent Events để update real-time

---

## ✅ Kết luận

Bây giờ admin dashboard hiển thị **data thật 100%** từ database:
- ✅ Không còn mock data
- ✅ Auto update khi có vé mới
- ✅ Tính toán doanh thu chính xác
- ✅ Phân biệt rõ status vé

**Khi có người đặt vé → Số liệu tự động cập nhật!** 🎉
