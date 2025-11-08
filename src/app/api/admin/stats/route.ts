import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ===========================================
// API: LẤY THỐNG KÊ CHO ADMIN DASHBOARD
// ===========================================
// GET /api/admin/stats

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is ADMIN or STAFF
        if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
            return NextResponse.json(
                { success: false, error: 'Forbidden - Admin/Staff only' },
                { status: 403 }
            );
        }

        // Get statistics from database
        const [
            totalBookings,
            pendingBookings,
            paidBookings,
            completedBookings,
        ] = await Promise.all([
            // Tổng số vé đã đặt
            prisma.booking.count(),

            // Vé chờ thanh toán (PENDING)
            prisma.booking.count({
                where: {
                    status: 'PENDING',
                },
            }),

            // Vé đã thanh toán (PAID)
            prisma.booking.count({
                where: {
                    status: 'PAID',
                },
            }),

            // Vé đã hoàn thành (COMPLETED)
            prisma.booking.count({
                where: {
                    status: 'COMPLETED',
                },
            }),
        ]);

        // Tính tổng doanh thu (chỉ tính vé đã thanh toán hoặc hoàn thành)
        const revenueResult = await prisma.booking.aggregate({
            where: {
                OR: [
                    { status: 'PAID' },
                    { status: 'COMPLETED' },
                ],
            },
            _sum: {
                totalPrice: true,
            },
        });

        const totalRevenue = revenueResult._sum.totalPrice || 0;

        return NextResponse.json({
            success: true,
            data: {
                totalBookings,        // Tổng số vé đã đặt
                pendingBookings,      // Vé chờ thanh toán
                paidBookings,         // Vé đã thanh toán
                completedBookings,    // Vé đã hoàn thành
                totalRevenue,         // Tổng doanh thu
            },
        });

    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch statistics',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
