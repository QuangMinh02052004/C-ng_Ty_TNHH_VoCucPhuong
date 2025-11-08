# 📊 HƯỚNG DẪN TẠO GOOGLE SHEETS - 5 PHÚT

## BƯỚC 1: Tạo Google Sheets

### 1. Truy cập:
```
https://sheets.google.com
```

### 2. Click "Blank" (Tạo mới)

### 3. Đặt tên file:
```
Blog Posts - Xe Võ Cúc Phương
```

---

## BƯỚC 2: Tạo bảng với tiêu đề cột

### Hàng 1 (Header) - Copy paste vào từng ô:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | Tiêu đề | Slug | Mô tả ngắn | Nội dung | Tác giả | Ngày đăng | Danh mục | Hình ảnh | Tags |

**CHỈ CẦN COPY 10 Ô NÀY VÀO HÀNG ĐẦU TIÊN!**

---

## BƯỚC 3: Điền bài mẫu (để người viết tham khảo)

### Hàng 2 - Copy paste vào từng ô:

**Ô A2:** `1`

**Ô B2:** `Xe Đồng Nai Sài Gòn`

**Ô C2:** `xe-dong-nai-sai-gon`

**Ô D2:** `Tuyến đường từ Đồng Nai đến TP. Hồ Chí Minh dài khoảng 100km`

**Ô E2:** 
```
Tuyến đường từ Đồng Nai đến TP. Hồ Chí Minh dài khoảng 100km.

GIÁ VÉ:
- Ghế ngồi: 110.000 - 120.000 VNĐ
- Giường nằm: 150.000 - 180.000 VNĐ

THỜI GIAN: 1.5 - 2 giờ

ĐIỂM ĐÓN TRẢ:
- Đồng Nai: Bến xe Long Khánh, Xuân Lộc
- Sài Gòn: Bến xe Miền Đông

LIÊN HỆ: 0251 999 9975
```

**Ô F2:** `Võ Cúc Phương`

**Ô G2:** `2025-11-07`

**Ô H2:** `Tin tức`

**Ô I2:** `route.jpg`

**Ô J2:** `Đồng Nai, Sài Gòn, Giá vé`

---

## BƯỚC 4: Format bảng cho đẹp (KHÔNG BẮT BUỘC)

### 4.1. Bôi đen hàng 1 (tiêu đề):
- Click số 1 bên trái
- Click "Fill color" (icon xô sơn) → Chọn màu xanh nhạt
- Click "Bold" (chữ B) để in đậm

### 4.2. Điều chỉnh độ rộng cột:
- Kéo rộng cột E (Nội dung) để dễ đọc
- Cột D (Mô tả ngắn) cũng kéo rộng

---

## BƯỚC 5: Chia sẻ với người viết bài

### 5.1. Click nút "Share" (góc trên bên phải)

### 5.2. Chọn "Anyone with the link"

### 5.3. Chọn quyền "Editor" (có thể chỉnh sửa)

### 5.4. Click "Copy link"

### 5.5. Gửi link cho người viết qua:
- Zalo
- Email
- Messenger

**Ví dụ tin nhắn:**
```
Link Google Sheets để viết bài blog:
https://docs.google.com/spreadsheets/d/xxxxx

Hướng dẫn:
1. Mở link này
2. Thêm hàng mới (hàng 3, 4, 5...)
3. Điền đủ 10 cột
4. Gửi ảnh riêng cho anh
5. Báo anh khi xong!

Xem hàng 2 để tham khảo cách điền nhé!
```

---

## BƯỚC 6: Khi người viết điền xong

### 6.1. Bạn mở Sheets, xem hàng mới

### 6.2. Copy thông tin từ Sheets

**VÍ DỤ:** Họ điền hàng 3:

| ID | Tiêu đề | Slug | Mô tả | Nội dung | Tác giả | Ngày | Danh mục | Ảnh | Tags |
|----|---------|------|-------|----------|---------|------|----------|-----|------|
| 2 | Khuyến mãi tháng 11 | khuyen-mai-11 | Giảm 30%... | Nội dung đầy đủ... | Admin | 2025-11-07 | Khuyến mãi | promo.jpg | khuyến mãi, giảm giá |

### 6.3. Mở VSCode → File `src/data/posts.ts`

### 6.4. Scroll xuống cuối mảng, thêm:

```typescript
    {
        id: '2',  // ← Copy từ cột A
        title: 'Khuyến mãi tháng 11',  // ← Copy từ cột B
        slug: 'khuyen-mai-11',  // ← Copy từ cột C
        excerpt: 'Giảm 30%...',  // ← Copy từ cột D
        content: `
            <h2>Khuyến mãi tháng 11</h2>
            <p>Nội dung...</p>
        `,  // ← Copy từ cột E, format lại HTML
        author: 'Admin',  // ← Copy từ cột F
        date: '2025-11-07',  // ← Copy từ cột G
        category: 'Khuyến mãi',  // ← Copy từ cột H
        image: '/promo.jpg',  // ← Copy từ cột I (thêm dấu / đầu)
        tags: ['khuyến mãi', 'giảm giá']  // ← Copy từ cột J, tách thành mảng
    },
```

### 6.5. Lưu file (Cmd + S)

### 6.6. Upload ảnh:
```bash
cp ~/Downloads/promo.jpg /Users/lequangminh/xe-vo-cuc-phuong-website/public/
```

### 6.7. Test:
```bash
npm run dev
# Mở http://localhost:3000/tin-tuc
```

### 6.8. Push code:
```bash
git add .
git commit -m "Thêm bài: Khuyến mãi tháng 11"
git push origin main
```

---

## 🎯 TEMPLATE SẴN - COPY VÀO CODE

### Khi thêm bài mới, copy template này:

```typescript
    {
        id: 'ID_TỪ_SHEETS',
        title: 'TIÊU_ĐỀ_TỪ_SHEETS',
        slug: 'SLUG_TỪ_SHEETS',
        excerpt: 'MÔ_TẢ_TỪ_SHEETS',
        content: `
            <h2>Tiêu đề chính</h2>
            <p>NỘI_DUNG_TỪ_SHEETS</p>
            
            <h3>Tiêu đề phụ</h3>
            <ul>
                <li>Điểm 1</li>
                <li>Điểm 2</li>
            </ul>
        `,
        author: 'TÁC_GIẢ_TỪ_SHEETS',
        date: 'NGÀY_TỪ_SHEETS',
        category: 'DANH_MỤC_TỪ_SHEETS',
        image: '/TÊN_ẢNH_TỪ_SHEETS',
        tags: ['TAG_1', 'TAG_2', 'TAG_3']
    },
```

**Chỉ cần thay thế chữ IN HOA bằng nội dung từ Sheets!**

---

## 📋 CHECKLIST

### Trước khi gửi Sheets cho người viết:
- [ ] Đã tạo 10 cột tiêu đề
- [ ] Đã có ít nhất 1 bài mẫu
- [ ] Đã set quyền "Editor"
- [ ] Đã copy link

### Khi nhận bài mới:
- [ ] Kiểm tra đủ 10 cột
- [ ] Slug viết không dấu, chữ thường
- [ ] Ngày đúng format YYYY-MM-DD
- [ ] Danh mục đúng (Tin tức/Hướng dẫn/Khuyến mãi/Chính sách)
- [ ] Đã nhận file ảnh

### Sau khi thêm vào code:
- [ ] Không có lỗi syntax
- [ ] Test trên localhost
- [ ] Ảnh hiển thị đúng
- [ ] Git push thành công

---

## ⚡ MẸO NHANH

### 1. Tạo macro trong Sheets (nâng cao):
- Tự động format khi người viết điền
- Tự động kiểm tra lỗi

### 2. Sử dụng Data Validation:
- Cột "Danh mục": Chỉ cho phép chọn 4 giá trị
- Cột "Ngày đăng": Chỉ cho phép nhập ngày

### 3. Tạo sheet riêng "Hướng dẫn":
- Sheet 1: Bảng điền bài
- Sheet 2: Hướng dẫn chi tiết

---

## 🎬 VIDEO HƯỚNG DẪN (nếu cần)

Bạn có thể quay video màn hình:
1. Mở Sheets
2. Điền thông tin
3. Copy sang code
4. Git push

Gửi video cho người viết để họ hiểu rõ hơn!

---

## 🆘 NẾU GẶP KHÓ KHĂN

**Inbox cho tôi với thông tin:**
1. Screenshot Sheets của bạn
2. Screenshot lỗi (nếu có)
3. Bạn đang bị kẹt ở bước nào

Tôi sẽ hỗ trợ ngay! 🚀

---

**BẮT ĐẦU NGAY BÂY GIỜ:**
👉 Mở https://sheets.google.com
👉 Tạo file mới
👉 Copy 10 tiêu đề cột vào hàng 1
👉 Xong! ✅
