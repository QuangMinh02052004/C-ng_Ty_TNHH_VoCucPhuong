import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { ensureScanSchema } from '@/lib/driver-schema';

// GET /api/driver/trips — danh sách chuyến của tài xế đang đăng nhập
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'DRIVER')
            return NextResponse.json({ error: 'Chỉ tài xế' }, { status: 403 });

        await ensureScanSchema();

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);

        const rows = await query<any>(
            `SELECT id, started_at, completed_at, vehicle_plate,
                    passenger_count, paid_online, expected_cash, total_amount
             FROM driver_trips
             WHERE driver_id = @driverId
             ORDER BY started_at DESC
             LIMIT @limit`,
            { driverId: session.user.id, limit }
        );

        return NextResponse.json({
            trips: rows.map(t => ({
                id: t.id,
                startedAt: t.started_at,
                completedAt: t.completed_at,
                vehiclePlate: t.vehicle_plate,
                passengerCount: t.passenger_count,
                paidOnline: Number(t.paid_online),
                expectedCash: Number(t.expected_cash),
                totalAmount: Number(t.total_amount),
            })),
        });
    } catch (e: any) {
        console.error('[DRIVER_TRIPS]', e);
        return NextResponse.json({ error: e?.message || 'Lỗi server' }, { status: 500 });
    }
}
