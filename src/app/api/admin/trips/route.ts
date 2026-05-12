import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { ensureScanSchema } from '@/lib/driver-schema';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        await ensureScanSchema();

        const { searchParams } = new URL(request.url);
        const driverId = searchParams.get('driverId');
        const status = searchParams.get('status'); // 'open' | 'completed'
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

        const conditions: string[] = ['1=1'];
        const params: Record<string, unknown> = { limit };

        if (driverId) {
            conditions.push('driver_id = @driverId');
            params.driverId = driverId;
        }
        if (status === 'open') conditions.push('completed_at IS NULL');
        if (status === 'completed') conditions.push('completed_at IS NOT NULL');
        if (dateFrom) {
            conditions.push('started_at >= @dateFrom');
            params.dateFrom = dateFrom;
        }
        if (dateTo) {
            conditions.push('started_at <= @dateTo');
            params.dateTo = dateTo;
        }

        const trips = await query<any>(
            `SELECT id, driver_id, driver_name, vehicle_plate,
                    started_at, completed_at,
                    passenger_count, paid_online, expected_cash, total_amount
             FROM driver_trips
             WHERE ${conditions.join(' AND ')}
             ORDER BY started_at DESC
             LIMIT @limit`,
            params
        );

        return NextResponse.json({
            trips: trips.map(t => ({
                id: t.id,
                driverId: t.driver_id,
                driverName: t.driver_name,
                vehiclePlate: t.vehicle_plate,
                startedAt: t.started_at,
                completedAt: t.completed_at,
                passengerCount: t.passenger_count,
                paidOnline: Number(t.paid_online),
                expectedCash: Number(t.expected_cash),
                totalAmount: Number(t.total_amount),
            })),
        });
    } catch (e: any) {
        console.error('[ADMIN_TRIPS]', e);
        return NextResponse.json({ error: e?.message || 'Lỗi server' }, { status: 500 });
    }
}
