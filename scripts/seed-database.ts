/**
 * Database Seeding Script
 * Seed dữ liệu mẫu vào SQL Server database
 */

import { UserRepository } from '../src/lib/repositories/user-repository';
import { RouteRepository } from '../src/lib/repositories/route-repository';
import { closePool } from '../src/lib/db';
import { hashPassword } from '../src/lib/utils';

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        // 1. Create Admin User
        console.log('👤 Creating admin user...');
        const existingAdmin = await UserRepository.findByEmail('admin@vocucphuong.com');
        if (!existingAdmin) {
            await UserRepository.create({
                email: 'admin@vocucphuong.com',
                password: await hashPassword('admin123456'),
                name: 'Quản trị viên',
                phone: '02519999975',
                role: 'ADMIN',
            });
            console.log('  ✅ Admin created: admin@vocucphuong.com (password: admin123456)');
        } else {
            console.log('  ℹ️  Admin already exists');
        }

        // 2. Create Staff User
        console.log('👤 Creating staff user...');
        const existingStaff = await UserRepository.findByEmail('staff@vocucphuong.com');
        if (!existingStaff) {
            await UserRepository.create({
                email: 'staff@vocucphuong.com',
                password: await hashPassword('staff123456'),
                name: 'Nhân viên',
                phone: '02519999975',
                role: 'STAFF',
            });
            console.log('  ✅ Staff created: staff@vocucphuong.com (password: staff123456)');
        } else {
            console.log('  ℹ️  Staff already exists');
        }

        // 3. Create Test User
        console.log('👤 Creating test user...');
        const existingUser = await UserRepository.findByEmail('user@example.com');
        if (!existingUser) {
            await UserRepository.create({
                email: 'user@example.com',
                password: await hashPassword('user123456'),
                name: 'Nguyễn Văn A',
                phone: '0987654321',
                role: 'USER',
            });
            console.log('  ✅ User created: user@example.com (password: user123456)');
        } else {
            console.log('  ℹ️  User already exists');
        }

        // 4. Create Routes (nếu chưa có)
        console.log('🚌 Creating routes...');

        const routes = [
            {
                from: 'Long Khánh',
                to: 'Sài Gòn (Cao tốc)',
                price: 120000,
                duration: '1.5 giờ',
                busType: 'Ghế ngồi',
                operatingStart: '05:00',
                operatingEnd: '18:00',
                intervalMinutes: 30,
                description: 'Tuyến Long Khánh - Sài Gòn qua cao tốc, nhanh chóng tiện lợi',
                isActive: true,
            },
            {
                from: 'Long Khánh',
                to: 'Sài Gòn (Quốc lộ)',
                price: 110000,
                duration: '2 giờ',
                busType: 'Ghế ngồi',
                operatingStart: '05:00',
                operatingEnd: '18:00',
                intervalMinutes: 30,
                description: 'Tuyến Long Khánh - Sài Gòn qua quốc lộ, giá rẻ',
                isActive: true,
            },
            {
                from: 'Sài Gòn',
                to: 'Long Khánh (Cao tốc)',
                price: 120000,
                duration: '1.5 giờ',
                busType: 'Ghế ngồi',
                operatingStart: '05:00',
                operatingEnd: '18:00',
                intervalMinutes: 30,
                description: 'Tuyến Sài Gòn - Long Khánh qua cao tốc',
                isActive: true,
            },
            {
                from: 'Sài Gòn',
                to: 'Long Khánh (Quốc lộ)',
                price: 110000,
                duration: '2 giờ 30 phút',
                busType: 'Ghế ngồi',
                operatingStart: '05:00',
                operatingEnd: '18:00',
                intervalMinutes: 30,
                description: 'Tuyến Sài Gòn - Long Khánh qua quốc lộ',
                isActive: true,
            },
            {
                from: 'Sài Gòn',
                to: 'Xuân Lộc (Cao tốc)',
                price: 130000,
                duration: '2 giờ - 4 giờ',
                busType: 'Ghế ngồi',
                operatingStart: '05:30',
                operatingEnd: '19:00',
                intervalMinutes: 30,
                description: 'Tuyến Sài Gòn - Xuân Lộc qua cao tốc',
                isActive: true,
            },
            {
                from: 'Quốc Lộ 1A',
                to: 'Xuân Lộc (Quốc lộ)',
                price: 130000,
                duration: '1.5 giờ - 4 tiếng',
                busType: 'Ghế ngồi',
                operatingStart: '05:30',
                operatingEnd: '19:00',
                intervalMinutes: 30,
                description: 'Tuyến Quốc Lộ 1A - Xuân Lộc',
                isActive: true,
            },
            {
                from: 'Xuân Lộc',
                to: 'Long Khánh (Cao tốc)',
                price: 130000,
                duration: '1 giờ',
                busType: 'Ghế ngồi',
                operatingStart: '05:30',
                operatingEnd: '19:00',
                intervalMinutes: 30,
                description: 'Tuyến Xuân Lộc - Long Khánh qua cao tốc',
                isActive: true,
            },
            {
                from: 'Xuân Lộc',
                to: 'Long Khánh (Quốc lộ)',
                price: 130000,
                duration: '1.5 giờ',
                busType: 'Ghế ngồi',
                operatingStart: '05:30',
                operatingEnd: '19:00',
                intervalMinutes: 30,
                description: 'Tuyến Xuân Lộc - Long Khánh qua quốc lộ',
                isActive: true,
            },
        ];

        const existingRoutes = await RouteRepository.findAll();
        if (existingRoutes.length === 0) {
            for (const route of routes) {
                await RouteRepository.create(route as any);
                console.log(`  ✅ Route: ${route.from} → ${route.to}`);
            }
        } else {
            console.log(`  ℹ️  Routes already exist (${existingRoutes.length} routes)`);
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Login credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:');
        console.log('  Email: admin@vocucphuong.com');
        console.log('  Password: admin123456');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Staff:');
        console.log('  Email: staff@vocucphuong.com');
        console.log('  Password: staff123456');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User:');
        console.log('  Email: user@example.com');
        console.log('  Password: user123456');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await closePool();
    }
}

main();
