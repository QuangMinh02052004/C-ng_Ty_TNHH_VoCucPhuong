# 📝 VÍ DỤ CỤ THỂ - CHUYỂN TỪ GOOGLE SHEETS SANG CODE

## 🎬 KỊCH BẢN:

**Người viết bài**: Chị Mai (nhân viên marketing, không biết code)  
**Admin**: Bạn (biết code)

---

## BƯỚC 1: Chị Mai điền vào Google Sheets

### Chị Mai mở Google Sheets và thấy bảng này:

| ID | Tiêu đề | Slug | Mô tả ngắn | Nội dung | Tác giả | Ngày đăng | Danh mục | Hình ảnh | Tags |
|----|---------|------|------------|----------|---------|-----------|----------|----------|------|
| 1 | Xe Đồng Nai... | ... | ... | ... | ... | ... | ... | ... | ... |
| 2 | Hướng dẫn... | ... | ... | ... | ... | ... | ... | ... | ... |
| 3 | Chính sách... | ... | ... | ... | ... | ... | ... | ... | ... |

### Chị Mai điền bài mới vào hàng 4:

**Cột A - ID:** `4`

**Cột B - Tiêu đề:** `Khuyến mãi tháng 11 - Giảm 30% tất cả tuyến xe`

**Cột C - Slug:** `khuyen-mai-thang-11`

**Cột D - Mô tả ngắn:** 
```
Chương trình khuyến mãi lớn nhất tháng với ưu đãi giảm 30% cho tất cả tuyến xe. Áp dụng khi đặt vé online qua website.
```

**Cột E - Nội dung:**
```
🎉 CHƯƠNG TRÌNH KHUYẾN MÃI THÁNG 11

Nhà xe Võ Cúc Phương tri ân khách hàng với chương trình giảm giá đặc biệt 30% cho tất cả tuyến xe.

THỜI GIAN ÁP DỤNG:
- Từ ngày: 01/11/2025
- Đến ngày: 30/11/2025

ƯU ĐÃI:
- Giảm 30% tất cả tuyến đường
- Tặng voucher 50.000đ cho lần đặt tiếp theo
- Miễn phí đổi lịch 1 lần

ĐIỀU KIỆN:
- Đặt vé online qua website
- Thanh toán trước 100%
- Nhập mã: NOV2025
- Không áp dụng ngày lễ

CÁCH ĐĂNG KÝ:
1. Truy cập website xevocucphuong.com
2. Chọn tuyến đường bất kỳ
3. Nhập mã khuyến mãi: NOV2025
4. Hoàn tất thanh toán

LIÊN HỆ:
Hotline: 0251 999 9975
Website: xevocucphuong.com

Nhanh tay đặt vé để nhận ưu đãi hấp dẫn!
```

**Cột F - Tác giả:** `Admin`

**Cột G - Ngày đăng:** `2025-11-07`

**Cột H - Danh mục:** `Khuyến mãi`

**Cột I - Hình ảnh:** `promo-thang-11.jpg`

**Cột J - Tags:** `khuyến mãi, giảm giá, tháng 11, ưu đãi`

### Chị Mai gửi tin nhắn Zalo cho bạn:
```
"Anh ơi, em đã điền bài mới vào Sheets rồi!
Tiêu đề: Khuyến mãi tháng 11 - Giảm 30%
Em gửi kèm file ảnh promo-thang-11.jpg nhé!"
```

---

## BƯỚC 2: Bạn (Admin) nhận và xử lý

### 2.1. Bạn mở Google Sheets, xem hàng 4:
✅ Kiểm tra: OK, đầy đủ thông tin!

### 2.2. Bạn download ảnh từ Zalo, copy vào project:
```bash
# Giả sử ảnh trong thư mục Downloads
cp ~/Downloads/promo-thang-11.jpg /Users/lequangminh/xe-vo-cuc-phuong-website/public/
```

### 2.3. Bạn mở VSCode → File `posts.ts`

### 2.4. Bạn thấy code hiện tại:
```typescript
export const posts: Post[] = [
    {
        id: '1',
        title: 'Xe Đồng Nai Sài Gòn...',
        // ... bài 1
    },
    {
        id: '2',
        title: 'Hướng dẫn đặt vé...',
        // ... bài 2
    },
    {
        id: '3',
        title: 'Chính sách hoàn hủy vé...',
        // ... bài 3
    }
];
```

### 2.5. Bạn thêm bài mới vào cuối (trước `];`):

```typescript
export const posts: Post[] = [
    {
        id: '1',
        title: 'Xe Đồng Nai Sài Gòn...',
        // ... bài 1
    },
    {
        id: '2',
        title: 'Hướng dẫn đặt vé...',
        // ... bài 2
    },
    {
        id: '3',
        title: 'Chính sách hoàn hủy vé...',
        // ... bài 3
    },
    // ↓↓↓ BÀI MỚI TỪ SHEETS ↓↓↓
    {
        id: '4',
        title: 'Khuyến mãi tháng 11 - Giảm 30% tất cả tuyến xe',
        slug: 'khuyen-mai-thang-11',
        excerpt: 'Chương trình khuyến mãi lớn nhất tháng với ưu đãi giảm 30% cho tất cả tuyến xe. Áp dụng khi đặt vé online qua website.',
        content: `
            <h2>🎉 Chương trình khuyến mãi tháng 11</h2>
            <p>Nhà xe Võ Cúc Phương tri ân khách hàng với chương trình giảm giá đặc biệt <strong>30%</strong> cho tất cả tuyến xe.</p>
            
            <h3>Thời gian áp dụng:</h3>
            <ul>
                <li>Từ ngày: 01/11/2025</li>
                <li>Đến ngày: 30/11/2025</li>
            </ul>

            <h3>Ưu đãi:</h3>
            <ul>
                <li>Giảm 30% tất cả tuyến đường</li>
                <li>Tặng voucher 50.000đ cho lần đặt tiếp theo</li>
                <li>Miễn phí đổi lịch 1 lần</li>
            </ul>

            <h3>Điều kiện:</h3>
            <ul>
                <li>Đặt vé online qua website</li>
                <li>Thanh toán trước 100%</li>
                <li>Nhập mã: <strong>NOV2025</strong></li>
                <li>Không áp dụng ngày lễ</li>
            </ul>

            <h3>Cách đăng ký:</h3>
            <ol>
                <li>Truy cập website <a href="/">xevocucphuong.com</a></li>
                <li>Chọn tuyến đường bất kỳ</li>
                <li>Nhập mã khuyến mãi: <strong>NOV2025</strong></li>
                <li>Hoàn tất thanh toán</li>
            </ol>

            <h3>Liên hệ:</h3>
            <p>Hotline: <strong>0251 999 9975</strong></p>
            <p>Website: <a href="/">xevocucphuong.com</a></p>
            <p>Nhanh tay đặt vé để nhận ưu đãi hấp dẫn! 🚀</p>
        `,
        author: 'Admin',
        date: '2025-11-07',
        category: 'Khuyến mãi',
        image: '/promo-thang-11.jpg',
        tags: ['khuyến mãi', 'giảm giá', 'tháng 11', 'ưu đãi']
    }
];
```

### 2.6. Bạn lưu file (Cmd + S)

---

## BƯỚC 3: Test trên localhost

### 3.1. Bạn chạy:
```bash
npm run dev
```

### 3.2. Bạn mở trình duyệt:
```
http://localhost:3000/tin-tuc
```

### 3.3. Bạn thấy:
✅ Bài "Khuyến mãi tháng 11" xuất hiện trong danh sách!

### 3.4. Bạn click vào bài đó:
```
http://localhost:3000/tin-tuc/khuyen-mai-thang-11
```

✅ Nội dung hiển thị đầy đủ, ảnh hiển thị đúng!

---

## BƯỚC 4: Push lên GitHub

### 4.1. Bạn chạy:
```bash
git add .
git commit -m "Thêm bài viết: Khuyến mãi tháng 11"
git push origin main
```

### 4.2. Website tự động deploy (Vercel/Netlify)

### 4.3. Sau 2-3 phút, bài viết lên website thật:
```
https://xevocucphuong.vercel.app/tin-tuc/khuyen-mai-thang-11
```

---

## BƯỚC 5: Thông báo lại cho Chị Mai

### Bạn gửi tin nhắn Zalo:
```
"Chị Mai ơi, bài viết đã được đăng rồi nhé!
Xem tại: https://xevocucphuong.com/tin-tuc/khuyen-mai-thang-11
Cảm ơn chị! 🎉"
```

---

## 📊 SO SÁNH TRƯỚC VÀ SAU:

### ❌ Trước (Chị Mai phải gửi Word/Email):
```
Chị Mai viết Word → Gửi email → Bạn đọc → Copy thủ công → Format lại → Push code
⏱️ Mất: 30-45 phút
```

### ✅ Sau (Dùng Google Sheets):
```
Chị Mai điền Sheets → Bạn copy → Paste code → Push
⏱️ Mất: 10-15 phút
```

---

## 🎯 KẾT LUẬN:

### Ưu điểm:
- ✅ Chị Mai không cần biết code
- ✅ Thông tin có cấu trúc rõ ràng
- ✅ Bạn chỉ cần copy-paste
- ✅ Giảm thiểu lỗi
- ✅ Dễ kiểm tra, sửa lỗi

### Nhược điểm:
- ❌ Không tự động 100%
- ❌ Bạn vẫn phải format HTML thủ công
- ❌ Phải upload ảnh thủ công

### Nâng cấp sau này:
- Viết script Python tự động convert
- Hoặc dùng CMS (Strapi) để tự động hoàn toàn

---

## 📁 FILE DEMO:

Tôi đã tạo file `VI_DU_GOOGLE_SHEETS.csv` có 5 bài mẫu.

**Cách xem:**
1. Mở file CSV bằng Excel/Google Sheets
2. Xem cấu trúc và nội dung
3. Copy sang Google Sheets thật để dùng

**Bạn muốn tôi giúp gì thêm không?** 😊
