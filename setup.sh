#!/bin/bash

# Script setup nhanh cho dự án Xe Võ Cúc Phương
# Author: Claude
# Usage: chmod +x setup.sh && ./setup.sh

set -e  # Exit on error

echo "🚀 Bắt đầu setup dự án Xe Võ Cúc Phương..."
echo ""

# Step 1: Install dependencies
echo "📦 [1/5] Cài đặt dependencies..."
npm install
echo "✅ Đã cài đặt dependencies"
echo ""

# Step 2: Check .env file
echo "⚙️  [2/5] Kiểm tra file .env..."
if [ ! -f .env ]; then
    echo "❌ Không tìm thấy file .env"
    echo "📋 Tạo file .env từ .env.example..."
    cp .env.example .env
    echo "⚠️  Vui lòng cập nhật các giá trị trong file .env trước khi tiếp tục!"
    exit 1
fi
echo "✅ File .env đã tồn tại"
echo ""

# Step 3: Generate Prisma Client
echo "🔧 [3/5] Generate Prisma Client..."
npx dotenv -e .env -- npx prisma generate
echo "✅ Đã generate Prisma Client"
echo ""

# Step 4: Pull database schema hoặc run migrations
echo "🗄️  [4/5] Setup database..."
echo "Chọn một trong hai:"
echo "  1) Pull schema từ database hiện tại (khuyến nghị nếu DB đã có sẵn)"
echo "  2) Chạy migrations để tạo database mới"
read -p "Lựa chọn của bạn (1/2): " -n 1 -r
echo ""
if [[ $REPLY == "1" ]]; then
    npx dotenv -e .env -- npx prisma db pull
    npx dotenv -e .env -- npx prisma generate
    echo "✅ Đã pull schema từ database"
elif [[ $REPLY == "2" ]]; then
    npx dotenv -e .env -- npx prisma migrate dev --name init
    echo "✅ Đã chạy migrations"
else
    echo "⏭️  Bỏ qua database setup"
fi
echo ""

# Step 5: Seed database (optional)
echo "🌱 [5/5] Seed database với dữ liệu mẫu..."
read -p "Bạn có muốn seed dữ liệu mẫu? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "prisma/seed.ts" ]; then
        npx dotenv -e .env -- npx prisma db seed
        echo "✅ Đã seed dữ liệu mẫu"
    else
        echo "⚠️  Không tìm thấy file prisma/seed.ts"
    fi
else
    echo "⏭️  Bỏ qua seed"
fi
echo ""

echo "✨ Setup hoàn tất!"
echo ""
echo "📋 Các bước tiếp theo:"
echo "   1. Kiểm tra file .env và cập nhật các giá trị cần thiết"
echo "   2. Chạy: npm run dev"
echo "   3. Mở trình duyệt: http://localhost:3000"
echo ""
echo "📚 Xem file HUONG_DAN_CHAY_PROJECT.md để biết thêm chi tiết"
echo ""
echo "🎉 Chúc bạn code vui vẻ!"
