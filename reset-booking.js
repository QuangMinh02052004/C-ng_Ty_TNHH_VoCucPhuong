// Reset booking về PENDING để test lại
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetBooking() {
    try {
        // Find latest PAID booking
        const booking = await prisma.booking.findFirst({
            where: {
                status: 'PAID'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!booking) {
            console.log('❌ No PAID booking found');
            return;
        }

        console.log('📋 Found booking:', {
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            status: booking.status
        });

        console.log('\n🔄 Resetting booking to PENDING...');

        // Reset to PENDING
        const updated = await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'PENDING' }
        });

        console.log('✅ Booking reset!');
        console.log('📌 Booking code:', updated.bookingCode);
        console.log('\n📝 Bây giờ:');
        console.log('1. Vào trang đặt vé thành công (hoặc reload nếu đang mở)');
        console.log('2. Đợi 5 giây để trang load lại status PENDING');
        console.log('3. Chạy: npx dotenv -e .env -- node test-payment.js');
        console.log('4. Popup sẽ xuất hiện sau 5 giây!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetBooking();
