import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/lib/utils';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Create Admin User
    console.log('👤 Creating admin user...');
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@vocucphuong.com' },
        update: {},
        create: {
            email: 'admin@vocucphuong.com',
            password: await hashPassword('admin123456'),
            name: 'Quản trị viên',
            phone: '02519999975',
            role: UserRole.ADMIN,
        },
    });
    console.log(`✅ Admin created: ${adminUser.email} (password: admin123456)`);

    // 2. Create Staff User
    console.log('👤 Creating staff user...');
    const staffUser = await prisma.user.upsert({
        where: { email: 'staff@vocucphuong.com' },
        update: {},
        create: {
            email: 'staff@vocucphuong.com',
            password: await hashPassword('staff123456'),
            name: 'Nhân viên',
            phone: '02519999975',
            role: UserRole.STAFF,
        },
    });
    console.log(`✅ Staff created: ${staffUser.email} (password: staff123456)`);

    // 3. Create Test User
    console.log('👤 Creating test user...');
    const testUser = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: await hashPassword('user123456'),
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            role: UserRole.USER,
        },
    });
    console.log(`✅ User created: ${testUser.email} (password: user123456)`);

    // 4. Create Routes (matched with frontend routes.ts)
    console.log('🚌 Creating routes...');

    const routes = [
        {
            id: '1',
            from: 'Long Khánh',
            to: 'Sài Gòn (Cao tốc)',
            price: 120000,
            duration: '1.5 giờ',
            busType: 'Ghế ngồi',
            operatingStart: '05:00',
            operatingEnd: '18:00',
            description: 'Tuyến Long Khánh - Sài Gòn qua cao tốc, nhanh chóng tiện lợi',
            isActive: true,
        },
        {
            id: '2',
            from: 'Long Khánh',
            to: 'Sài Gòn (Quốc lộ)',
            price: 110000,
            duration: '2 giờ',
            busType: 'Ghế ngồi',
            operatingStart: '05:00',
            operatingEnd: '18:00',
            description: 'Tuyến Long Khánh - Sài Gòn qua quốc lộ, giá rẻ',
            isActive: true,
        },
        {
            id: '3',
            from: 'Sài Gòn',
            to: 'Long Khánh (Cao tốc)',
            price: 120000,
            duration: '1.5 giờ',
            busType: 'Ghế ngồi',
            operatingStart: '05:00',
            operatingEnd: '18:00',
            description: 'Tuyến Sài Gòn - Long Khánh qua cao tốc',
            isActive: true,
        },
        {
            id: '4',
            from: 'Sài Gòn',
            to: 'Long Khánh (Quốc lộ)',
            price: 110000,
            duration: '2 giờ 30 phút',
            busType: 'Ghế ngồi',
            operatingStart: '05:00',
            operatingEnd: '18:00',
            description: 'Tuyến Sài Gòn - Long Khánh qua quốc lộ',
            isActive: true,
        },
        {
            id: '5',
            from: 'Sài Gòn',
            to: 'Xuân Lộc (Cao tốc)',
            price: 130000,
            duration: '2 giờ - 4 giờ',
            busType: 'Ghế ngồi',
            operatingStart: '05:30',
            operatingEnd: '19:00',
            description: 'Tuyến Sài Gòn - Xuân Lộc qua cao tốc',
            isActive: true,
        },
        {
            id: '6',
            from: 'Quốc Lộ 1A',
            to: 'Xuân Lộc (Quốc lộ)',
            price: 130000,
            duration: '1.5 giờ - 4 tiếng',
            busType: 'Ghế ngồi',
            operatingStart: '05:30',
            operatingEnd: '19:00',
            description: 'Tuyến Quốc Lộ 1A - Xuân Lộc',
            isActive: true,
        },
        {
            id: '7',
            from: 'Xuân Lộc',
            to: 'Long Khánh (Cao tốc)',
            price: 130000,
            duration: '1 giờ',
            busType: 'Ghế ngồi',
            operatingStart: '05:30',
            operatingEnd: '19:00',
            description: 'Tuyến Xuân Lộc - Long Khánh qua cao tốc',
            isActive: true,
        },
        {
            id: '8',
            from: 'Xuân Lộc',
            to: 'Long Khánh (Quốc lộ)',
            price: 130000,
            duration: '1.5 giờ',
            busType: 'Ghế ngồi',
            operatingStart: '05:30',
            operatingEnd: '19:00',
            description: 'Tuyến Xuân Lộc - Long Khánh qua quốc lộ',
            isActive: true,
        },
    ];

    for (const route of routes) {
        await prisma.route.upsert({
            where: { id: route.id },
            update: {},
            create: route,
        });
        console.log(`  ✅ Route: ${route.from} → ${route.to}`);
    }

    console.log('🎉 Database seeding completed successfully!');
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
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
