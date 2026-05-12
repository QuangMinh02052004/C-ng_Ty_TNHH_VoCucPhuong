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
        if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await ensureScanSchema();

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
        const role = searchParams.get('role'); // optional filter: DRIVER / ADMIN / STAFF
        const search = searchParams.get('search'); // booking code / phone / name
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        const conditions: string[] = ['1=1'];
        const params: Record<string, unknown> = { limit };

        if (role) {
            conditions.push('scanner_role = @role');
            params.role = role;
        }
        if (search) {
            conditions.push(
                '(booking_code ILIKE @search OR customer_name ILIKE @search OR customer_phone ILIKE @search OR scanner_name ILIKE @search OR vehicle_plate ILIKE @search)'
            );
            params.search = `%${search}%`;
        }
        if (dateFrom) {
            conditions.push('scanned_at >= @dateFrom');
            params.dateFrom = dateFrom;
        }
        if (dateTo) {
            conditions.push('scanned_at <= @dateTo');
            params.dateTo = dateTo;
        }

        const rows = await query<any>(
            `SELECT
                id, scanner_id, scanner_name, scanner_role, vehicle_plate,
                booking_code, booking_status, was_paid, result,
                customer_name, customer_phone, route,
                departure_time, departure_date, seats,
                pickup_method, pickup_address, scanned_at
             FROM qr_scan_logs
             WHERE ${conditions.join(' AND ')}
             ORDER BY scanned_at DESC
             LIMIT @limit`,
            params
        );

        return NextResponse.json({
            logs: rows.map(r => ({
                id: r.id,
                scannerId: r.scanner_id,
                scannerName: r.scanner_name,
                scannerRole: r.scanner_role,
                vehiclePlate: r.vehicle_plate,
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
            })),
        });
    } catch (error) {
        console.error('[ADMIN_SCAN_LOGS]', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
