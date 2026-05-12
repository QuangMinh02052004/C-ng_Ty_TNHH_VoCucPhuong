import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { ensureScanSchema } from '@/lib/driver-schema';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (session.user.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Chỉ tài xế mới được xem' }, { status: 403 });
        }
        await ensureScanSchema();

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

        const rows = await query<any>(
            `SELECT
                id, scanner_name, vehicle_plate,
                booking_code, booking_status, was_paid, result,
                customer_name, customer_phone, route,
                departure_time, departure_date, seats,
                pickup_method, pickup_address, scanned_at
             FROM qr_scan_logs
             WHERE scanner_id = @driverId AND scanner_role = 'DRIVER'
             ORDER BY scanned_at DESC
             LIMIT @limit`,
            { driverId: session.user.id, limit }
        );

        return NextResponse.json({
            driver: {
                name: session.user.name,
                vehiclePlate: session.user.vehiclePlate ?? null,
            },
            logs: rows.map(r => ({
                id: r.id,
                bookingCode: r.booking_code,
                bookingStatus: r.booking_status,
                wasPaid: r.was_paid,
                result: r.result,
                customerName: r.customer_name,
                customerPhone: r.customer_phone,
                route: r.route,
                departureTime: r.departure_time,
                departureDate: r.departure_date,
                seats: r.seats,
                pickupMethod: r.pickup_method,
                pickupAddress: r.pickup_address,
                scannedAt: r.scanned_at,
                driverName: r.scanner_name,
                vehiclePlate: r.vehicle_plate,
            })),
        });
    } catch (error) {
        console.error('[DRIVER_HISTORY]', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
