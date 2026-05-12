import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingRepository } from '@/lib/repositories/booking-repository';
import { query } from '@/lib/db';
import { ensureScanSchema, getOrCreateOpenTrip } from '@/lib/driver-schema';
import { z } from 'zod';

const schema = z.object({
    bookingCode: z.string().min(1, 'Mã vé không được để trống'),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (session.user.role !== 'DRIVER') {
            return NextResponse.json({ error: 'Chỉ tài xế mới được dùng chức năng này' }, { status: 403 });
        }
        if (!session.user.vehiclePlate) {
            return NextResponse.json(
                { error: 'Vui lòng chọn biển số xe trước khi quét vé' },
                { status: 400 }
            );
        }

        await ensureScanSchema();

        const body = await request.json();
        const validation = schema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }
        const { bookingCode } = validation.data;

        const booking = (await BookingRepository.findByCodeWithDetails(bookingCode)) as any;

        // Trip hiện tại (auto-create nếu chưa có)
        const tripId = await getOrCreateOpenTrip(
            session.user.id,
            session.user.name,
            session.user.vehiclePlate
        );

        if (!booking) {
            await query(
                `INSERT INTO qr_scan_logs (
                    scanner_id, scanner_name, scanner_role, vehicle_plate, trip_id,
                    booking_code, booking_status, was_paid, result
                ) VALUES (
                    @scannerId, @scannerName, 'DRIVER', @vehiclePlate, @tripId,
                    @bookingCode, 'NOT_FOUND', false, 'NOT_FOUND'
                )`,
                {
                    scannerId: session.user.id,
                    scannerName: session.user.name,
                    vehiclePlate: session.user.vehiclePlate,
                    tripId,
                    bookingCode,
                }
            );
            return NextResponse.json({ error: 'Không tìm thấy vé', bookingCode }, { status: 404 });
        }

        const wasPaid = booking.status === 'PAID';
        const routeStr = booking.route ? `${booking.route.from} → ${booking.route.to}` : '';
        const totalPrice = Number(booking.totalPrice) || 0;

        // Idempotency: nếu cùng booking đã quét trong trip hiện tại, không cộng đôi
        const dup = await query<{ id: number }>(
            `SELECT id FROM qr_scan_logs
             WHERE trip_id = @tripId AND booking_code = @code AND result <> 'NOT_FOUND'
             LIMIT 1`,
            { tripId, code: booking.bookingCode }
        );

        await query(
            `INSERT INTO qr_scan_logs (
                scanner_id, scanner_name, scanner_role, vehicle_plate, trip_id,
                booking_code, booking_status, was_paid, result, total_price,
                customer_name, customer_phone, route,
                departure_time, departure_date, seats,
                pickup_method, pickup_address
            ) VALUES (
                @scannerId, @scannerName, 'DRIVER', @vehiclePlate, @tripId,
                @bookingCode, @bookingStatus, @wasPaid, @result, @totalPrice,
                @customerName, @customerPhone, @route,
                @departureTime, @departureDate, @seats,
                @pickupMethod, @pickupAddress
            )`,
            {
                scannerId: session.user.id,
                scannerName: session.user.name,
                vehiclePlate: session.user.vehiclePlate,
                tripId,
                bookingCode: booking.bookingCode,
                bookingStatus: booking.status,
                wasPaid,
                result: dup.length > 0 ? 'DUPLICATE' : 'OK',
                totalPrice,
                customerName: booking.customerName,
                customerPhone: booking.customerPhone,
                route: routeStr,
                departureTime: booking.departureTime,
                departureDate: booking.date ? new Date(booking.date).toISOString().split('T')[0] : null,
                seats: booking.seats,
                pickupMethod: booking.pickupMethod ?? null,
                pickupAddress: booking.pickupAddress ?? null,
            }
        );

        // Chỉ cộng vào tổng trip nếu KHÔNG phải duplicate
        if (dup.length === 0) {
            await query(
                `UPDATE driver_trips SET
                    passenger_count = passenger_count + 1,
                    paid_online = paid_online + CASE WHEN @wasPaid THEN @totalPrice ELSE 0 END,
                    expected_cash = expected_cash + CASE WHEN @wasPaid THEN 0 ELSE @totalPrice END,
                    total_amount = total_amount + @totalPrice
                 WHERE id = @tripId`,
                { tripId, wasPaid, totalPrice }
            );
        }

        return NextResponse.json({
            success: true,
            duplicate: dup.length > 0,
            tripId,
            booking: {
                bookingCode: booking.bookingCode,
                customerName: booking.customerName,
                customerPhone: booking.customerPhone,
                route: routeStr,
                date: booking.date,
                departureTime: booking.departureTime,
                seats: booking.seats,
                totalPrice,
                status: booking.status,
                wasPaid,
                pickupMethod: booking.pickupMethod ?? null,
                pickupAddress: booking.pickupAddress ?? null,
                checkedIn: booking.checkedIn,
                checkedInAt: booking.checkedInAt,
            },
            driver: {
                name: session.user.name,
                vehiclePlate: session.user.vehiclePlate,
            },
        });
    } catch (error: any) {
        console.error('[DRIVER_SCAN]', error);
        return NextResponse.json({ error: error?.message || 'Lỗi server khi quét vé' }, { status: 500 });
    }
}
