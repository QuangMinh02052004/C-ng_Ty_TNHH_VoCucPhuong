import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { ensureScanSchema } from '@/lib/driver-schema';

// GET /api/admin/trips/[id]/scans — danh sách scan trong 1 chuyến
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        await ensureScanSchema();

        const rows = await query<any>(
            `SELECT id, booking_code, booking_status, was_paid, result, total_price,
                    customer_name, customer_phone, route,
                    departure_time, departure_date, seats,
                    pickup_method, pickup_address, scanned_at
             FROM qr_scan_logs
             WHERE trip_id = @tripId
             ORDER BY scanned_at ASC`,
            { tripId: parseInt(id) }
        );

        return NextResponse.json({
            scans: rows.map(r => ({
                id: r.id,
                bookingCode: r.booking_code,
                bookingStatus: r.booking_status,
                wasPaid: r.was_paid,
                result: r.result,
                totalPrice: Number(r.total_price ?? 0),
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
    } catch (e: any) {
        console.error('[TRIP_SCANS]', e);
        return NextResponse.json({ error: e?.message || 'Lỗi server' }, { status: 500 });
    }
}
