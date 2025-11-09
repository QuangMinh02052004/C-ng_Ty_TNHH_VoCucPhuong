import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
        const pendingBookings = await prisma.booking.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                route: true,
                payment: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // 3. Format data
        const formattedBookings = pendingBookings.map(booking => ({
            id: booking.id,
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            customerEmail: booking.customerEmail,
            route: {
                from: booking.route.from,
                to: booking.route.to,
            },
            date: booking.date,
            departureTime: booking.departureTime,
            seats: booking.seats,
            totalPrice: booking.totalPrice,
            status: booking.status,
            createdAt: booking.createdAt,
            qrCode: booking.qrCode,
            payment: booking.payment || null,
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
