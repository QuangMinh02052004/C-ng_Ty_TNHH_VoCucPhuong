# 🚀 CÁCH IMPORT FILE CSV VÀO GOOGLE SHEETS - 10 GIÂY

## BƯỚC 1: Mở Google Sheets

Truy cập:
```
https://sheets.google.com
```

---

## BƯỚC 2: Import file CSV

### Cách 1: Kéo thả (Nhanh nhất)

1. Tìm file `TEMPLATE_GOOGLE_SHEETS.csv` trên máy
2. Kéo thả vào trang sheets.google.com
3. ✅ XONG!

---

### Cách 2: Import thủ công

1. Click **"File"** → **"Import"**
2. Tab **"Upload"**
3. Click **"Select a file from your device"**
4. Chọn file `TEMPLATE_GOOGLE_SHEETS.csv`
5. Import location: **"Create new spreadsheet"**
6. Separator type: **"Detect automatically"**
7. Click **"Import data"**
8. ✅ XONG!

---

## BƯỚC 3: Đổi tên file

1. Click vào tên file ở góc trên trái (mặc định: "Untitled spreadsheet")
2. Đổi thành: **"Blog Posts - Xe Võ Cúc Phương"**
3. Enter

---

## BƯỚC 4: Format đẹp hơn (Không bắt buộc)

### 4.1. Bôi đen hàng 1 (tiêu đề):
- Click số "1" bên trái
- Click icon "Fill color" (xô sơn) → Chọn màu xanh nhạt
- Click "Bold" (chữ B) để in đậm
- Click "Align center" để canh giữa

### 4.2. Điều chỉnh độ rộng cột:
- Double-click vào đường kẻ giữa các cột → Tự động fit
- Hoặc kéo rộng thủ công

### 4.3. Freeze hàng đầu (khóa tiêu đề):
- Click "View" → "Freeze" → "1 row"
- Giờ khi scroll xuống, tiêu đề vẫn nhìn thấy

### 4.4. Xóa hàng 2 (bài mẫu):
- Hàng 2 chỉ là hướng dẫn
- Người viết sẽ điền từ hàng 3 trở đi
- Hoặc giữ lại để tham khảo

---

## BƯỚC 5: Chia sẻ với người viết

### 5.1. Click nút **"Share"** (góc trên phải)

### 5.2. Chọn **"Anyone with the link"**

### 5.3. Chọn quyền **"Editor"** (có thể chỉnh sửa)

### 5.4. Click **"Copy link"**

### 5.5. Gửi link cho người viết:

**Template tin nhắn:**
```
📝 LINK VIẾT BÀI BLOG

Link Google Sheets:
[PASTE LINK Ở ĐÂY]

HƯỚNG DẪN NHANH:
1. Mở link trên
2. Thêm hàng mới (từ hàng 3 trở đi)
3. Điền đủ 10 cột theo mẫu hàng 2
4. Gửi ảnh riêng cho anh qua Zalo
5. Báo anh khi hoàn thành!

LƯU Ý:
- Slug: viết không dấu, dùng dấu gạch ngang
- Ngày: format YYYY-MM-DD (ví dụ: 2025-11-07)
- Danh mục: chọn 1 trong 4 (Tin tức, Hướng dẫn, Khuyến mãi, Chính sách)

Cần hỗ trợ inbox anh nhé! 📞
```

---

## ✅ CHECKLIST

- [ ] Đã import file CSV vào Google Sheets
- [ ] Đã đổi tên file thành "Blog Posts - Xe Võ Cúc Phương"
- [ ] Đã format hàng tiêu đề (màu xanh, in đậm)
- [ ] Đã freeze hàng 1
- [ ] Đã set quyền "Anyone with the link" → "Editor"
- [ ] Đã copy link
- [ ] Đã gửi link + hướng dẫn cho người viết

---

## 🎯 SAU KHI SETUP XONG

### Người viết sẽ điền bài mới vào hàng 3, 4, 5...

**Ví dụ hàng 3:**
```
ID: 3
Tiêu đề: Khuyến mãi tháng 11 - Giảm 30%
Slug: khuyen-mai-thang-11
Mô tả: Chương trình khuyến mãi lớn nhất tháng...
Nội dung: [Nội dung đầy đủ...]
Tác giả: Admin
Ngày đăng: 2025-11-07
Danh mục: Khuyến mãi
Hình ảnh: promo-11.jpg
Tags: khuyến mãi, giảm giá, tháng 11
```

### Khi họ điền xong:

Bạn làm theo file **SETUP_GOOGLE_SHEETS_5_PHUT.md** phần "BƯỚC 6"
→ Copy từ Sheets → Paste vào code → Git push

---

## 🆘 GẶP LỖI?

### Lỗi: "Failed to import"
- Kiểm tra file CSV có bị lỗi không
- Thử cách 1: Kéo thả trực tiếp

### Lỗi: Tiếng Việt bị lỗi font
- Khi import, chọn encoding: **UTF-8**

### Lỗi: Không thấy nút "Share"
- Đảm bảo đã đăng nhập Google
- Thử refresh lại trang

---

## 💡 MẸO BỔ SUNG

### 1. Tạo sheet riêng "Hướng dẫn":
- Click dấu "+" ở dưới cùng → Tạo sheet mới
- Đặt tên "Hướng dẫn chi tiết"
- Paste hướng dẫn cho người viết vào đó

### 2. Sử dụng Data Validation:
- Click cột H (Danh mục)
- Data → Data validation
- Criteria: "List of items"
- Items: `Tin tức, Hướng dẫn, Khuyến mãi, Chính sách`
- Save

Giờ người viết chỉ cần chọn từ dropdown, không sợ nhập sai!

### 3. Thêm ghi chú (Notes):
- Right-click vào ô tiêu đề
- Insert note
- Viết hướng dẫn chi tiết cho cột đó

---

**BẮT ĐẦU NGAY:**
1. Tìm file `TEMPLATE_GOOGLE_SHEETS.csv` trong project
2. Kéo thả vào sheets.google.com
3. ✅ XONG! Bạn có sẵn form rồi!

Mất đúng 10 giây! ⚡
