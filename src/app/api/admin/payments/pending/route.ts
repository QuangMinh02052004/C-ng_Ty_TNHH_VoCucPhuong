import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingRepository } from '@/lib/repositories/booking-repository';

// ===========================================
// API: LẤY DANH SÁCH VÉ CHỜ THANH TOÁN
// ===========================================
// GET /api/admin/payments/pending

export async function GET(request: NextRequest) {
    try {
        // 1. Kiểm tra quyền admin/staff
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Lấy danh sách booking chờ thanh toán
        const pendingBookings = await BookingRepository.findAllWithDetails({
            status: 'PENDING',
        });

        // 3. Format data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedBookings = pendingBookings.map((booking: any) => ({
            id: booking.id,
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            customerEmail: booking.customerEmail,
            route: booking.route ? {
                from: booking.route.from,
                to: booking.route.to,
            } : null,
            date: booking.date,
            departureTime: booking.departureTime,
            seats: booking.seats,
            totalPrice: booking.totalPrice,
            status: booking.status,
            createdAt: booking.createdAt,
            qrCode: booking.qrCode,
            payment: null, // Will need to fetch separately if needed
        }));

        return NextResponse.json({
            success: true,
            data: formattedBookings,
            count: formattedBookings.length,
        });

    } catch (error) {
        console.error('[API] Error fetching pending payments:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
