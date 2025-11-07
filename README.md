# Website Nhà Xe Võ Cúc Phương

Website vận chuyển hành khách liên tỉnh được xây dựng với Next.js, TypeScript và Tailwind CSS.

## ✨ Tính năng chính

- 🏠 **Trang chủ**: Hero section, ưu điểm nổi bật, tuyến đường phổ biến
- 🚌 **Tuyến đường**: Danh sách đầy đủ các tuyến xe với giá vé, lịch trình
- 🎫 **Đặt vé online**: Form đặt vé trực tuyến với đầy đủ thông tin
- ℹ️ **Giới thiệu**: Thông tin về công ty, tầm nhìn, sứ mệnh
- 📞 **Liên hệ**: Form liên hệ và thông tin chi tiết
- 📱 **Responsive**: Tối ưu cho mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Font**: Inter (hỗ trợ tiếng Việt)

## 🚀 Hướng dẫn sử dụng

### 1. Cài đặt dependencies (đã cài sẵn)

```bash
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Website sẽ chạy tại http://localhost:3000

### 3. Build cho production

```bash
npm run build
npm start
```

## 📂 Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout chính với Header/Footer
│   ├── page.tsx           # Trang chủ
│   ├── tuyen-duong/       # Trang tuyến đường
│   ├── dat-ve/            # Trang đặt vé
│   ├── gioi-thieu/        # Trang giới thiệu
│   └── lien-he/           # Trang liên hệ
├── components/            # React components
│   ├── Header.tsx         # Navigation bar
│   └── Footer.tsx         # Footer
├── data/                  # Dữ liệu
│   └── routes.ts          # Danh sách tuyến đường
└── types/                 # TypeScript types
    └── index.ts           # Type definitions
```

## 🎨 Tùy chỉnh

### Cập nhật thông tin công ty

Chỉnh sửa file `src/data/routes.ts`

### Thêm/sửa tuyến đường

Chỉnh sửa mảng `routes` trong `src/data/routes.ts`

## 🔮 Phát triển tiếp theo

- Backend & Database
- Chọn ghế ngồi trực quan
- Payment gateway
- Admin dashboard
- PWA support

Copyright © 2024 Nhà Xe Võ Cúc Phương
