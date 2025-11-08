# 📝 HƯỚNG DẪN VIẾT BÀI CHO NGƯỜI KHÔNG BIẾT CODE

## Phương án 1: Sử dụng Google Sheets (KHUYẾN NGHỊ) ⭐

### Bước 1: Tạo Google Sheets
1. Truy cập: https://sheets.google.com
2. Tạo file mới với các cột:

| ID | Tiêu đề | Slug | Mô tả ngắn | Nội dung | Tác giả | Ngày đăng | Danh mục | Hình ảnh | Tags |
|----|---------|------|------------|----------|---------|-----------|----------|----------|------|

### Bước 2: Người viết điền thông tin
- **ID**: Số thứ tự (4, 5, 6...)
- **Tiêu đề**: "Khuyến mãi tháng 11 giảm 30%"
- **Slug**: `khuyen-mai-thang-11` (viết không dấu, dùng dấu gạch ngang)
- **Mô tả ngắn**: 1-2 câu tóm tắt
- **Nội dung**: Viết bình thường, xuống dòng khi muốn
- **Tác giả**: Tên người viết
- **Ngày đăng**: 2025-11-07
- **Danh mục**: Tin tức / Hướng dẫn / Khuyến mãi / Chính sách
- **Hình ảnh**: Tên file ảnh (gửi ảnh riêng qua Zalo/Email)
- **Tags**: khuyến mãi, giảm giá, tháng 11

### Bước 3: Share link Google Sheets cho bạn
- Click "Chia sẻ" → Copy link → Gửi cho bạn

### Bước 4: Bạn (developer) chuyển đổi
- Copy nội dung từ Google Sheets
- Paste vào file `posts.ts`
- Format lại HTML nếu cần (h2, h3, ul, li...)

---

## Phương án 2: Form Google Forms (Tự động hơn)

### Tạo Google Form với các câu hỏi:
1. Tiêu đề bài viết (văn bản ngắn)
2. Slug URL (văn bản ngắn) - ví dụ: khuyen-mai-thang-11
3. Mô tả ngắn (đoạn văn)
4. Nội dung đầy đủ (đoạn văn)
5. Tác giả (văn bản ngắn)
6. Ngày đăng (ngày tháng)
7. Danh mục (dropdown: Tin tức, Hướng dẫn, Khuyến mãi, Chính sách)
8. Upload ảnh (tải file)
9. Tags (văn bản ngắn) - ví dụ: khuyến mãi, giảm giá

### Kết quả:
- Form gửi về Google Sheets tự động
- Bạn vào Sheets xem và copy sang code

Link tạo form: https://forms.google.com

---

## Phương án 3: Nhắn tin qua Zalo/Messenger/Email

### Template gửi cho người viết:

```
📝 THÔNG TIN BÀI VIẾT

1️⃣ Tiêu đề: 
[Ví dụ: Khuyến mãi tháng 11 - Giảm 30% tất cả tuyến xe]

2️⃣ Đường dẫn (slug): 
[Ví dụ: khuyen-mai-thang-11]

3️⃣ Mô tả ngắn (1-2 câu):
[Ví dụ: Chương trình khuyến mãi lớn nhất trong năm với ưu đãi giảm 30% cho tất cả tuyến xe...]

4️⃣ Nội dung đầy đủ:
[Viết đầy đủ nội dung bài viết ở đây, xuống dòng bình thường]

5️⃣ Tác giả:
[Ví dụ: Nguyễn Văn A]

6️⃣ Ngày đăng:
[Ví dụ: 07/11/2025]

7️⃣ Danh mục:
[Chọn 1: Tin tức / Hướng dẫn / Khuyến mãi / Chính sách]

8️⃣ Hình ảnh:
[Đính kèm file ảnh hoặc gửi riêng]

9️⃣ Tags (từ khóa):
[Ví dụ: khuyến mãi, giảm giá, tháng 11]
```

### Khi nhận được:
- Copy nội dung
- Paste vào file posts.ts theo format có sẵn
- Upload ảnh vào thư mục /public
- Deploy website

---

## Phương án 4: Sử dụng CMS (Nâng cao - Tốn tiền)

### Các CMS phổ biến:
- **Strapi** (miễn phí, tự host)
- **Contentful** (có gói miễn phí)
- **Sanity** (có gói miễn phí)

### Ưu điểm:
- Giao diện trực quan như Word
- Không cần biết code
- Tự động lưu vào database
- Preview trước khi đăng

### Nhược điểm:
- Cần setup thêm (phức tạp)
- Cần server/hosting riêng
- Tốn chi phí

---

## 📊 So sánh các phương án:

| Phương án | Độ dễ | Chi phí | Thời gian setup | Phù hợp |
|-----------|-------|---------|-----------------|---------|
| Google Sheets | ⭐⭐⭐⭐⭐ | Miễn phí | 5 phút | **Nhỏ, ít bài** |
| Google Forms | ⭐⭐⭐⭐ | Miễn phí | 10 phút | **Nhiều người viết** |
| Nhắn tin Zalo | ⭐⭐⭐⭐⭐ | Miễn phí | 0 phút | **1-2 người viết** |
| CMS (Strapi) | ⭐⭐ | Miễn phí* | 2-3 giờ | **Nhiều bài, chuyên nghiệp** |

---

## 💡 KHUYẾN NGHỊ CHO BẠN:

### Hiện tại (đơn giản):
1. **Tạo Google Form** để người viết điền thông tin
2. Form tự động lưu vào Google Sheets
3. Bạn vào Sheets → Copy → Paste vào code
4. Push lên GitHub → Website tự động cập nhật

### Tương lai (nếu có nhiều bài):
- Setup **Strapi CMS** để người viết có giao diện đăng bài như WordPress
- Kết nối API từ Strapi sang Next.js
- Người viết đăng bài → Website tự động load từ API

---

## 📌 File Template Google Sheets mẫu:

Tôi có thể tạo sẵn file Google Sheets template cho bạn. Bạn chỉ cần:
1. Copy file đó
2. Share link cho người viết
3. Họ điền thông tin
4. Bạn copy sang code

---

**Bạn muốn dùng phương án nào? Tôi sẽ setup chi tiết cho bạn!** 🚀
