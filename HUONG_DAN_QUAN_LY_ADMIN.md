# 📖 Hướng dẫn sử dụng Admin Panel - Xe Võ Cúc Phương

## 🎨 Tổng quan thiết kế mới

Admin Panel đã được **thiết kế lại hoàn toàn** với:
- ✨ Giao diện hiện đại với màu xanh dương và trắng
- 🗺️ **Hình ảnh mô phỏng lộ trình** cho tuyến đường
- 📊 Dashboard với thống kê trực quan
- 🎯 UX/UI được cải thiện với card layouts và gradients đẹp mắt

---

## 🚀 Các trang đã được thiết kế lại

### 1. 👥 Quản lý Người dùng (`/admin/users`)

**Tính năng:**
- ✅ Hiển thị dạng **card grid** với avatar emoji theo vai trò
- ✅ Màu gradient theo vai trò:
  - 👑 **ADMIN**: Đỏ (`from-red-400 to-red-500`)
  - 💼 **STAFF**: Xanh dương (`from-blue-400 to-sky-500`)
  - 👤 **USER**: Xanh lục (`from-green-400 to-green-500`)
- ✅ Thống kê 4 cards: Tổng users, Admins, Staff, Khách hàng
- ✅ Tìm kiếm theo tên, email, SĐT
- ✅ Lọc theo vai trò
- ✅ Chỉnh sửa vai trò với UI radio buttons đẹp mắt
- ✅ Xóa user (chỉ ADMIN)
- ✅ Hiển thị số vé đã đặt và ngày tạo
- ✅ Badge xác thực email

**Phân quyền:**
- Chỉ **ADMIN** mới được truy cập
- Không thể tự thay đổi/xóa chính mình
- Không thể xóa user có bookings

---

### 2. 🗺️ Quản lý Tuyến đường (`/admin/routes`)

**Tính năng nổi bật:**

#### A. **Visualization Lộ trình với Hình ảnh**
- 🖼️ Hiển thị hình ảnh bản đồ lộ trình thực tế (nếu có)
- 🎨 Fallback sang animation đồ họa động nếu không có ảnh
- 🔍 Click để xem fullscreen
- 📍 Overlay thông tin điểm đi/đến với animation

#### B. **Thống kê Cards**
- 📊 Tổng tuyến (xanh dương)
- ✅ Đang hoạt động (xanh lục)
- ⛔ Tạm ngừng (đỏ)
- 🎫 Tổng vé đã bán (sky)

#### C. **Grid Layout Cards**
- 🎴 Hiển thị dạng cards 2 cột (responsive)
- 🌈 Gradient backgrounds đẹp mắt
- 💳 Info cards với màu sắc phân biệt:
  - Giờ hoạt động (xanh dương)
  - Khoảng cách chuyến (sky)
  - Số vé đã đặt (xanh lục)
  - Lịch trình (tím)

#### D. **Modal Thêm/Sửa**
- 📝 Form đầy đủ với validation
- 🖼️ **Upload URL hình ảnh lộ trình**
- 👁️ Preview trực tiếp trong modal
- 🎨 Header gradient xinh xắn
- ⏰ Time picker cho giờ hoạt động

**Phân quyền:**
- **ADMIN** và **STAFF** đều được truy cập
- Chỉ **ADMIN** mới được xóa routes
- Không thể xóa route có bookings (chỉ tạm ngừng)

---

## 🎯 Cách sử dụng

### Bước 1: Đăng nhập
```
1. Truy cập: http://localhost:3000/dang-nhap
2. Đăng nhập với tài khoản ADMIN hoặc STAFF
3. Tự động chuyển đến Admin Panel
```

### Bước 2: Quản lý Users (Chỉ ADMIN)

#### Xem danh sách:
- Click **"Người dùng"** trong sidebar
- Thống kê hiển thị ngay ở đầu trang

#### Tìm kiếm & Lọc:
- 🔍 Tìm theo tên, email, SĐT
- 🎯 Lọc theo vai trò: ALL / ADMIN / STAFF / USER

#### Chỉnh sửa vai trò:
```
1. Click nút "Sửa" trên card user
2. Chọn vai trò mới:
   - 👤 Khách hàng: Quyền cơ bản
   - 💼 Nhân viên: Quản lý vé, thanh toán
   - 👑 Quản trị viên: Toàn quyền
3. Click "💾 Lưu thay đổi"
```

#### Xóa user:
```
1. Click nút "Xóa" trên card user
2. Xác nhận trong popup
⚠️ Lưu ý: Không thể xóa user có bookings
```

---

### Bước 3: Quản lý Tuyến đường

#### Thêm tuyến mới:
```
1. Click "Thêm tuyến đường"
2. Điền thông tin cơ bản:
   - Điểm đi / Điểm đến
   - Giá vé (VNĐ)
   - Thời gian di chuyển (VD: "2h 30p")
   - Loại xe
   - Khoảng cách (optional)

3. 🖼️ Thêm hình ảnh lộ trình:
   - Nhập URL hình ảnh bản đồ
   - Nhập URL thumbnail (optional)
   - Xem preview trực tiếp

4. Cấu hình giờ hoạt động:
   - Giờ bắt đầu
   - Giờ kết thúc
   - Khoảng cách giữa các chuyến (phút)

5. Thêm mô tả (optional)
6. ✅ Check "Tuyến đường đang hoạt động"
7. Click "➕ Tạo mới"
```

#### Lấy hình ảnh lộ trình:

**Cách 1: Từ Google Maps**
```
1. Mở Google Maps
2. Nhập điểm đi và điểm đến
3. Screenshot lộ trình
4. Upload lên hosting (Imgur, Cloudinary, v.v.)
5. Copy URL và paste vào form
```

**Cách 2: Tự vẽ bản đồ**
```
1. Sử dụng tool vẽ (Figma, Canva, v.v.)
2. Vẽ bản đồ lộ trình đẹp mắt
3. Export PNG/JPG
4. Upload và lấy URL
```

**Cách 3: Dùng hình minh họa**
```
1. Tìm hình ảnh minh họa đường đi
2. Upload và lấy URL
```

#### Chỉnh sửa tuyến:
```
1. Click nút "Sửa" trên card tuyến
2. Cập nhật thông tin
3. Preview thay đổi
4. Click "💾 Cập nhật"
```

#### Tạm ngừng/Kích hoạt:
```
- Click "Tạm ngừng" để dừng tuyến (không xóa data)
- Click "Kích hoạt" để bật lại tuyến
```

#### Xóa tuyến (Chỉ ADMIN):
```
1. Click nút "Xóa"
2. Xác nhận trong popup
⚠️ Lưu ý: Không thể xóa tuyến có bookings
```

---

## 🗺️ Component RouteMapVisualization

Component này tự động xử lý 2 trường hợp:

### Trường hợp 1: Có hình ảnh
- Hiển thị hình ảnh lộ trình thực tế
- Overlay gradient từ đen trong suốt
- Info layer với điểm đi/đến
- Click để xem fullscreen
- Animation pulse cho điểm đầu/cuối

### Trường hợp 2: Không có hình ảnh
- Fallback sang animation đồ họa
- Background gradient xanh dương
- Grid pattern mờ
- Icon điểm đi/đến với animation
- Đường nối với bus icon animation
- Arrows animation chạy qua lại
- Info badges với icon

---

## 🎨 Bảng màu Design System

### Màu chính:
```css
/* Xanh dương chủ đạo */
--blue-600: #2563eb
--sky-600: #0ea5e9

/* Gradients */
from-blue-600 to-sky-600    /* Nút, header */
from-blue-50 to-blue-100    /* Stats cards */
from-blue-50 to-sky-50      /* Route visualization */

/* Màu phụ */
--green: success/active
--red: error/admin/inactive
--yellow: warning
--gray: neutral/background
```

### Shadows:
```css
shadow-sm     /* Cards */
shadow-md     /* Hover cards */
shadow-lg     /* Buttons */
shadow-xl     /* Hover buttons */
shadow-2xl    /* Modals */
```

### Rounded:
```css
rounded-xl    /* Cards, inputs, buttons */
rounded-2xl   /* Modals */
rounded-lg    /* Smaller elements */
rounded-full  /* Badges, pills */
```

---

## 📊 Database Schema Mới

```prisma
model Route {
  // ... các field cũ

  // ✨ Các field mới
  routeMapImage    String?  // URL hình ảnh bản đồ lộ trình
  thumbnailImage   String?  // URL hình ảnh thumbnail
  images           Json?    // Mảng các URL hình ảnh khác

  // Thông tin địa lý (future use)
  fromLat          Float?   // Vĩ độ điểm đi
  fromLng          Float?   // Kinh độ điểm đi
  toLat            Float?   // Vĩ độ điểm đến
  toLng            Float?   // Kinh độ điểm đến
}
```

---

## 🔥 Các tính năng nổi bật

### 1. **Animation & Transitions**
- ✨ Smooth transitions trên tất cả elements
- 🎭 Hover effects đẹp mắt
- 🌊 Pulse/ping animations cho indicators
- 🚀 Loading states với spinners

### 2. **Responsive Design**
- 📱 Mobile-friendly grid layouts
- 💻 Tablet và desktop optimized
- 🎯 Breakpoints: sm, md, lg, xl

### 3. **User Experience**
- ⚡ Fast loading với lazy loading
- 🔄 Real-time updates
- 💬 Contextual alerts và confirmations
- 🎨 Color-coded information

### 4. **Accessibility**
- ♿ Semantic HTML
- ⌨️ Keyboard navigation support
- 🎯 Focus states rõ ràng
- 📱 Touch-friendly buttons

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **Auth**: NextAuth.js
- **Database**: PostgreSQL + Prisma
- **Images**: Next/Image optimized

---

## 📝 Tips & Best Practices

### Khi thêm hình ảnh lộ trình:
1. ✅ Sử dụng hình có kích thước hợp lý (< 2MB)
2. ✅ Tỷ lệ khung hình: 16:9 hoặc 4:3
3. ✅ Resolution: ít nhất 1280x720px
4. ✅ Format: JPG hoặc PNG
5. ✅ Hosting: Sử dụng CDN để tải nhanh

### Khi quản lý users:
1. ⚠️ Cẩn thận khi thay đổi role ADMIN
2. ✅ Kiểm tra email verification
3. ✅ Review số vé đã đặt trước khi xóa

### Khi quản lý routes:
1. ✅ Tạm ngừng thay vì xóa nếu có bookings
2. ✅ Cập nhật hình ảnh khi thay đổi lộ trình
3. ✅ Kiểm tra giờ hoạt động hợp lý

---

## 🐛 Troubleshooting

### Hình ảnh không hiển thị?
```
1. Kiểm tra URL có đúng không
2. Kiểm tra CORS policy của hosting
3. Thử URL khác hoặc reupload
4. Xem console để debug
```

### Modal không đóng?
```
1. Click vào nút X hoặc "Hủy bỏ"
2. Click ra ngoài modal (backdrop)
3. Refresh trang nếu bị stuck
```

### Lỗi permission?
```
1. Kiểm tra role của tài khoản
2. Logout và login lại
3. Liên hệ ADMIN để được cấp quyền
```

---

## 🎯 Roadmap

### Tính năng sắp tới:
- [ ] Upload hình ảnh trực tiếp (không cần URL)
- [ ] Google Maps integration
- [ ] Bulk actions cho users
- [ ] Export reports
- [ ] Real-time notifications
- [ ] Dark mode

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Check console logs
2. Review lại hướng dẫn
3. Liên hệ dev team

---

**Chúc bạn quản lý hiệu quả! 🚀**
