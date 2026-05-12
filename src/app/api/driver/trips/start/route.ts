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
        if (!session.user.vehiclePlate) {
            return NextResponse.json(
                { error: 'Vui lòng chọn biển số xe trước khi bắt đầu chuyến' },
                { status: 400 }
            );
        }

        await ensureScanSchema();

        const existing = await getOpenTripId(session.user.id);
        if (existing) {
            return NextResponse.json({ tripId: existing, alreadyOpen: true });
        }

        const result = await query<{ id: number; started_at: string }>(
            `INSERT INTO driver_trips (driver_id, driver_name, vehicle_plate)
             VALUES (@driverId, @driverName, @plate)
             RETURNING id, started_at`,
            {
                driverId: session.user.id,
                driverName: session.user.name,
                plate: session.user.vehiclePlate,
            }
        );

        return NextResponse.json({
            tripId: result[0].id,
            startedAt: result[0].started_at,
            alreadyOpen: false,
        }, { status: 201 });
    } catch (e: any) {
        console.error('[TRIP_START]', e);
        return NextResponse.json({ error: e?.message || 'Lỗi server' }, { status: 500 });
    }
}
