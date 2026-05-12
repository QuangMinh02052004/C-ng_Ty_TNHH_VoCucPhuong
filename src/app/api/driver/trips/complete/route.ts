import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { ensureScanSchema, getOpenTripId } from '@/lib/driver-schema';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'DRIVER')
            return NextResponse.json({ error: 'Chỉ tài xế' }, { status: 403 });

        await ensureScanSchema();

        const tripId = await getOpenTripId(session.user.id);
        if (!tripId) {
            return NextResponse.json({ error: 'Không có chuyến đang mở' }, { status: 400 });
        }

        const result = await query<any>(
            `UPDATE driver_trips SET completed_at = NOW()
             WHERE id = @tripId AND completed_at IS NULL
             RETURNING id, started_at, completed_at, vehicle_plate,
                       passenger_count, paid_online, expected_cash, total_amount`,
            { tripId }
        );

        if (result.length === 0) {
            return NextResponse.json({ error: 'Không cập nhật được chuyến' }, { status: 500 });
        }

        const t = result[0];
        return NextResponse.json({
            success: true,
            trip: {
                id: t.id,
                startedAt: t.started_at,
                completedAt: t.completed_at,
                vehiclePlate: t.vehicle_plate,
                passengerCount: t.passenger_count,
                paidOnline: Number(t.paid_online),
                expectedCash: Number(t.expected_cash),
                totalAmount: Number(t.total_amount),
            },
        });
    } catch (e: any) {
        console.error('[TRIP_COMPLETE]', e);
        return NextResponse.json({ error: e?.message || 'Lỗi server' }, { status: 500 });
    }
}
