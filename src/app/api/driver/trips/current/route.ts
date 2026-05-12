import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { ensureScanSchema } from '@/lib/driver-schema';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'DRIVER')
            return NextResponse.json({ error: 'Chỉ tài xế' }, { status: 403 });

        await ensureScanSchema();

        const rows = await query<any>(
            `SELECT id, started_at, completed_at, vehicle_plate,
                    passenger_count, paid_online, expected_cash, total_amount
             FROM driver_trips
             WHERE driver_id = @driverId AND completed_at IS NULL
             ORDER BY started_at DESC LIMIT 1`,
            { driverId: session.user.id }
        );

        if (rows.length === 0) {
            return NextResponse.json({ trip: null });
        }

        const t = rows[0];
        return NextResponse.json({
            trip: {
                id: t.id,
                startedAt: t.started_at,
                vehiclePlate: t.vehicle_plate,
                passengerCount: t.passenger_count,
                paidOnline: Number(t.paid_online),
                expectedCash: Number(t.expected_cash),
                totalAmount: Number(t.total_amount),
            },
        });
    } catch (e: any) {
        console.error('[DRIVER_TRIP_CURRENT]', e);
        return NextResponse.json({ error: e?.message || 'Lỗi server' }, { status: 500 });
    }
}
