import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingRepository } from '@/lib/repositories/booking-repository';
import { query } from '@/lib/db';
import { ensureScanSchema } from '@/lib/driver-schema';
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

        await ensureScanSchema();

        const body = await request.json();
        const validation = schema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }
        const { bookingCode } = validation.data;

        const booking = (await BookingRepository.findByCodeWithDetails(bookingCode)) as any;
        if (!booking) {
            await query(
                `INSERT INTO qr_scan_logs (
                    scanner_id, scanner_name, scanner_role, vehicle_plate,
                    booking_code, booking_status, was_paid, result
                ) VALUES (
                    @scannerId, @scannerName, 'DRIVER', @vehiclePlate,
                    @bookingCode, 'NOT_FOUND', false, 'NOT_FOUND'
                )`,
                {
                    scannerId: session.user.id,
                    scannerName: session.user.name,
                    vehiclePlate: session.user.vehiclePlate ?? null,
                    bookingCode,
                }
            );
            return NextResponse.json({ error: 'Không tìm thấy vé', bookingCode }, { status: 404 });
        }

        const wasPaid = booking.status === 'PAID';
        const routeStr = booking.route ? `${booking.route.from} → ${booking.route.to}` : '';

        await query(
            `INSERT INTO qr_scan_logs (
                scanner_id, scanner_name, scanner_role, vehicle_plate,
                booking_code, booking_status, was_paid, result,
                customer_name, customer_phone, route,
                departure_time, departure_date, seats,
                pickup_method, pickup_address
            ) VALUES (
                @scannerId, @scannerName, 'DRIVER', @vehiclePlate,
                @bookingCode, @bookingStatus, @wasPaid, 'OK',
                @customerName, @customerPhone, @route,
                @departureTime, @departureDate, @seats,
                @pickupMethod, @pickupAddress
            )`,
            {
                scannerId: session.user.id,
                scannerName: session.user.name,
                vehiclePlate: session.user.vehiclePlate ?? null,
                bookingCode: booking.bookingCode,
                bookingStatus: booking.status,
                wasPaid,
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

        return NextResponse.json({
            success: true,
            booking: {
                bookingCode: booking.bookingCode,
                customerName: booking.customerName,
                customerPhone: booking.customerPhone,
                route: routeStr,
                date: booking.date,
                departureTime: booking.departureTime,
                seats: booking.seats,
                totalPrice: booking.totalPrice,
                status: booking.status,
                wasPaid,
                pickupMethod: booking.pickupMethod ?? null,
                pickupAddress: booking.pickupAddress ?? null,
                checkedIn: booking.checkedIn,
                checkedInAt: booking.checkedInAt,
            },
            driver: {
                name: session.user.name,
                vehiclePlate: session.user.vehiclePlate ?? null,
            },
        });
    } catch (error) {
        console.error('[DRIVER_SCAN]', error);
        return NextResponse.json({ error: 'Lỗi server khi quét vé' }, { status: 500 });
    }
}
