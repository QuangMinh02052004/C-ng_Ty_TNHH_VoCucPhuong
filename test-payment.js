// Test payment auto-detection
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPayment() {
    try {
        // Find latest PENDING booking
        const booking = await prisma.booking.findFirst({
            where: {
                status: 'PENDING'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!booking) {
            console.log('❌ No PENDING booking found');
            return;
        }

        console.log('📋 Found booking:', {
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            totalPrice: booking.totalPrice,
            status: booking.status
        });

        console.log('\n💰 Updating booking to PAID...');

        // Update to PAID
        const updated = await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'PAID' }
        });

        console.log('✅ Booking updated!');
        console.log('📌 Booking code:', updated.bookingCode);
        console.log('\n🎉 Bây giờ vào trang đặt vé thành công và đợi popup xuất hiện!');
        console.log('🔗 http://localhost:3000/dat-ve/thanh-cong');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPayment();
