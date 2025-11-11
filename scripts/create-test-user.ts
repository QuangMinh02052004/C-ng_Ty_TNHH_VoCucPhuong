/**
 * Script tạo User test để test tính năng check-in QR
 *
 * Chạy: npx tsx scripts/create-test-user.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/utils';

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        console.log('🚀 Đang tạo User test...');

        // Check xem user đã tồn tại chưa
        const existingUser = await prisma.user.findUnique({
            where: { email: 'customer@test.com' },
        });

        if (existingUser) {
            console.log('⚠️  User đã tồn tại!');
            console.log('📧 Email:', existingUser.email);
            console.log('👤 Tên:', existingUser.name);
            console.log('🔑 Password: 123456');
            console.log('');
            console.log('✅ Bạn có thể đăng nhập ngay với:');
            console.log('   Email: customer@test.com');
            console.log('   Password: 123456');
            return;
        }

        // Tạo user mới
        const hashedPassword = await hashPassword('123456');

        const user = await prisma.user.create({
            data: {
                email: 'customer@test.com',
                password: hashedPassword,
                name: 'Khách hàng test',
                phone: '0901234567',
                role: 'USER',
            },
        });

        console.log('✅ Tạo User test thành công!');
        console.log('');
        console.log('📋 Thông tin đăng nhập:');
        console.log('   Email: customer@test.com');
        console.log('   Password: 123456');
        console.log('');
        console.log('👤 Thông tin User:');
        console.log('   ID:', user.id);
        console.log('   Tên:', user.name);
        console.log('   Số điện thoại:', user.phone);
        console.log('   Role:', user.role);
        console.log('');
        console.log('🎯 Bước tiếp theo:');
        console.log('   1. Đăng nhập tại: http://localhost:3000/auth/login');
        console.log('   2. Đặt vé tại: http://localhost:3000/dat-ve');
        console.log('   3. Xem vé tại: http://localhost:3000/my-bookings');
        console.log('');
        console.log('📖 Xem hướng dẫn đầy đủ tại: HUONG_DAN_TEST_QR_CHECKIN.md');
    } catch (error) {
        console.error('❌ Lỗi khi tạo User:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
