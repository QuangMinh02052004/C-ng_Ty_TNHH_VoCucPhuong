# 🔧 HƯỚNG DẪN ADMIN - CHUYỂN BÀI TỪ GOOGLE SHEETS VÀO WEBSITE

## 📋 QUY TRÌNH TỔNG QUAN:

```
Người viết điền Sheets → Admin kiểm tra → Copy sang posts.ts → Push code → Website cập nhật
```

---

## BƯỚC 1: Tạo Google Sheets Template

### 1.1. Truy cập Google Sheets
```
https://sheets.google.com
```

### 1.2. Tạo file mới với tên:
```
Blog Posts - Xe Võ Cúc Phương
```

### 1.3. Tạo các cột (hàng đầu tiên):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | Tiêu đề | Slug | Mô tả ngắn | Nội dung | Tác giả | Ngày đăng | Danh mục | Hình ảnh | Tags |

### 1.4. Điền 1 bài mẫu (hàng 2):

| ID | Tiêu đề | Slug | Mô tả ngắn | Nội dung | Tác giả | Ngày đăng | Danh mục | Hình ảnh | Tags |
|----|---------|------|------------|----------|---------|-----------|----------|----------|------|
| 4 | Khuyến mãi tháng 11 | khuyen-mai-thang-11 | Giảm 30% tất cả tuyến xe | Nội dung đầy đủ ở đây... | Admin | 2025-11-07 | Khuyến mãi | promo.jpg | khuyến mãi, giảm giá |

### 1.5. Chia sẻ file:
1. Click "Chia sẻ" (góc trên bên phải)
2. Chọn "Bất kỳ ai có link đều có thể chỉnh sửa"
3. Copy link
4. Gửi link cho người viết bài

---

## BƯỚC 2: Khi Người Viết Gửi Bài Mới

### 2.1. Mở Google Sheets
- Vào link Sheets đã tạo
- Xem hàng mới người viết vừa điền

### 2.2. Kiểm tra thông tin:
- [ ] ID có tăng dần không?
- [ ] Slug viết không dấu, chữ thường?
- [ ] Ngày đăng đúng format YYYY-MM-DD?
- [ ] Danh mục đúng 1 trong 4 loại?
- [ ] Đã nhận file ảnh chưa?

---

## BƯỚC 3: Chuyển Đổi Sang Code

### 3.1. Mở VSCode
```bash
cd /Users/lequangminh/xe-vo-cuc-phuong-website
code .
```

### 3.2. Mở file posts.ts
```
src/data/posts.ts
```

### 3.3. Copy template này:
```typescript
    {
        id: 'ID_TỪ_SHEETS',
        title: 'TIÊU_ĐỀ_TỪ_SHEETS',
        slug: 'SLUG_TỪ_SHEETS',
        excerpt: 'MÔ_TẢ_NGẮN_TỪ_SHEETS',
        content: `
            <h2>Tiêu đề chính</h2>
            <p>NỘI_DUNG_TỪ_SHEETS</p>
            
            <h3>Tiêu đề nhỏ</h3>
            <ul>
                <li>Điểm 1</li>
                <li>Điểm 2</li>
            </ul>
            
            <p>Đoạn văn tiếp theo...</p>
        `,
        author: 'TÁC_GIẢ_TỪ_SHEETS',
        date: 'NGÀY_ĐĂNG_TỪ_SHEETS',
        category: 'DANH_MỤC_TỪ_SHEETS',
        image: '/TÊN_FILE_ẢNH_TỪ_SHEETS',
        tags: ['TAG_1', 'TAG_2', 'TAG_3']
    },
```

### 3.4. Thay thế thông tin:

**VÍ DỤ:** Từ Sheets có:
```
ID: 4
Tiêu đề: Khuyến mãi tháng 11 - Giảm 30%
Slug: khuyen-mai-thang-11
Mô tả: Chương trình khuyến mãi lớn...
Nội dung: 
🎉 CHƯƠNG TRÌNH KHUYẾN MÃI
Giảm 30% tất cả tuyến xe...

ĐIỀU KIỆN:
- Đặt vé online
- Thanh toán trước
...
Tác giả: Admin
Ngày: 2025-11-07
Danh mục: Khuyến mãi
Hình ảnh: promo-thang-11.jpg
Tags: khuyến mãi, giảm giá, tháng 11
```

**CHUYỂN THÀNH CODE:**
```typescript
    {
        id: '4',
        title: 'Khuyến mãi tháng 11 - Giảm 30%',
        slug: 'khuyen-mai-thang-11',
        excerpt: 'Chương trình khuyến mãi lớn nhất tháng với ưu đãi giảm 30% cho tất cả tuyến xe. Áp dụng khi đặt vé online.',
        content: `
            <h2>🎉 Chương trình khuyến mãi tháng 11</h2>
            <p>Nhà xe Võ Cúc Phương tri ân khách hàng với chương trình giảm giá đặc biệt <strong>30%</strong> cho tất cả tuyến xe.</p>
            
            <h3>Thời gian áp dụng:</h3>
            <ul>
                <li>Từ ngày: 01/11/2025</li>
                <li>Đến ngày: 30/11/2025</li>
            </ul>

            <h3>Điều kiện áp dụng:</h3>
            <ul>
                <li>Đặt vé online qua website</li>
                <li>Thanh toán trước 100%</li>
                <li>Nhập mã: <strong>NOV2025</strong></li>
            </ul>

            <h3>Liên hệ:</h3>
            <p>Hotline: <strong>0251 999 9975</strong></p>
            <p>Website: <a href="/">xevocucphuong.com</a></p>
        `,
        author: 'Admin',
        date: '2025-11-07',
        category: 'Khuyến mãi',
        image: '/promo-thang-11.jpg',
        tags: ['khuyến mãi', 'giảm giá', 'tháng 11']
    },
```

### 3.5. Paste vào posts.ts:

**VỊ TRÍ:** Thêm vào cuối mảng `posts`, trước dấu `];`

```typescript
export const posts: Post[] = [
    {
        id: '1',
        title: 'Xe Đồng Nai Sài Gòn...',
        // ... bài cũ
    },
    {
        id: '2',
        title: 'Hướng dẫn đặt vé...',
        // ... bài cũ
    },
    {
        id: '3',
        title: 'Chính sách hoàn hủy...',
        // ... bài cũ
    },
    // ↓↓↓ THÊM BÀI MỚI Ở ĐÂY ↓↓↓
    {
        id: '4',
        title: 'Khuyến mãi tháng 11...',
        // ... bài mới
    },
]; // ← Đừng quên dấu phẩy ở trên!
```

---

## BƯỚC 4: Upload Ảnh

### 4.1. Nhận file ảnh từ người viết (qua Zalo/Email)

### 4.2. Copy ảnh vào thư mục public:
```bash
# Giả sử ảnh tên: promo-thang-11.jpg
cp ~/Downloads/promo-thang-11.jpg /Users/lequangminh/xe-vo-cuc-phuong-website/public/
```

### 4.3. Kiểm tra ảnh đã vào:
```bash
ls -la /Users/lequangminh/xe-vo-cuc-phuong-website/public/
```

**Lưu ý:** Tên file ảnh trong code phải khớp với tên file thực tế!

---

## BƯỚC 5: Format Nội Dung HTML

### Quy tắc format:

#### Tiêu đề lớn → `<h2>`
```html
<h2>Chương trình khuyến mãi</h2>
```

#### Tiêu đề nhỏ → `<h3>`
```html
<h3>Điều kiện áp dụng:</h3>
```

#### Đoạn văn → `<p>`
```html
<p>Đây là một đoạn văn bình thường.</p>
```

#### Danh sách → `<ul>` + `<li>`
```html
<ul>
    <li>Điểm thứ nhất</li>
    <li>Điểm thứ hai</li>
    <li>Điểm thứ ba</li>
</ul>
```

#### Chữ in đậm → `<strong>`
```html
<p>Giảm <strong>30%</strong> tất cả tuyến xe.</p>
```

#### Link → `<a>`
```html
<p>Xem thêm tại <a href="/tuyen-duong">đây</a></p>
```

---

## BƯỚC 6: Test Trên Localhost

### 6.1. Chạy dev server:
```bash
npm run dev
```

### 6.2. Mở trình duyệt:
```
http://localhost:3000/tin-tuc
```

### 6.3. Kiểm tra:
- [ ] Bài mới xuất hiện trong danh sách
- [ ] Click vào bài → Xem được chi tiết
- [ ] Ảnh hiển thị đúng
- [ ] Nội dung format đẹp
- [ ] Không có lỗi

---

## BƯỚC 7: Push Lên GitHub & Deploy

### 7.1. Add, commit, push:
```bash
git add .
git commit -m "Thêm bài viết mới: Khuyến mãi tháng 11"
git push origin main
```

### 7.2. Website tự động cập nhật (nếu dùng Vercel/Netlify)

### 7.3. Kiểm tra website thật:
```
https://your-domain.vercel.app/tin-tuc
```

---

## BƯỚC 8: Thông Báo Người Viết

Gửi tin nhắn cho người viết:
```
"Bài viết của bạn đã được đăng! 
Xem tại: https://your-domain.com/tin-tuc/khuyen-mai-thang-11
Cảm ơn bạn! 🎉"
```

---

## 🔥 MẸO NÂNG CAO:

### Sử dụng Tool chuyển đổi tự động:

Tạo script Python để tự động convert từ CSV sang code:

```python
# convert_posts.py
import csv
import json

# Đọc Google Sheets export CSV
with open('posts.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    posts = list(reader)

# Convert sang format TypeScript
for post in posts:
    print(f"""    {{
        id: '{post['ID']}',
        title: '{post['Tiêu đề']}',
        slug: '{post['Slug']}',
        excerpt: '{post['Mô tả ngắn']}',
        content: `{post['Nội dung']}`,
        author: '{post['Tác giả']}',
        date: '{post['Ngày đăng']}',
        category: '{post['Danh mục']}',
        image: '/{post['Hình ảnh']}',
        tags: {json.dumps(post['Tags'].split(', '))}
    }},""")
```

**Cách dùng:**
1. Export Google Sheets thành CSV
2. Chạy: `python convert_posts.py > output.txt`
3. Copy output.txt vào posts.ts

---

## ❓ TROUBLESHOOTING:

**Q: Bài mới không hiện trên website?**
- Kiểm tra syntax: có thiếu dấu phẩy, ngoặc không?
- Restart dev server: `Ctrl+C` rồi `npm run dev`
- Clear cache trình duyệt

**Q: Ảnh không hiển thị?**
- Kiểm tra tên file ảnh có khớp không
- Ảnh phải nằm trong `/public`
- Path trong code: `/ten-anh.jpg` (có dấu `/` đầu)

**Q: Lỗi khi push code?**
```bash
git status  # Xem file bị lỗi
git diff    # Xem thay đổi
```

---

## 📞 HỖ TRỢ:

Nếu gặp khó khăn, liên hệ:
- GitHub Issues
- Email: support@example.com

**Chúc bạn thành công! 🚀**
