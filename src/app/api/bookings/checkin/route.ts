import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingRepository, PaymentRepository } from '@/lib/repositories/booking-repository';
import { query } from '@/lib/db';
import { ensureScanSchema } from '@/lib/driver-schema';
import { z } from 'zod';

const checkinSchema = z.object({
  bookingCode: z.string().min(1, 'Mã vé không được để trống'),
});

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra quyền admin/staff
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Chỉ admin và staff mới có quyền check-in
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Forbidden - Chỉ admin/staff có quyền check-in vé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = checkinSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { bookingCode } = validation.data;

    // Tìm booking theo mã vé
    const booking = await BookingRepository.findByCodeWithDetails(bookingCode) as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy vé với mã này' },
        { status: 404 }
      );
    }

    // Kiểm tra vé đã check-in chưa
    if (booking.checkedIn) {
      return NextResponse.json(
        {
          error: 'Vé này đã được check-in',
          booking: {
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            route: `${booking.route.from} → ${booking.route.to}`,
            date: booking.date,
            departureTime: booking.departureTime,
            seats: booking.seats,
            totalPrice: booking.totalPrice,
            status: booking.status,
            checkedIn: booking.checkedIn,
            checkedInAt: booking.checkedInAt,
          },
        },
        { status: 400 }
      );
    }

    // Chỉ không cho check-in vé đã hủy hoặc đã hoàn thành
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        {
          error: 'Vé này đã bị hủy, không thể check-in.',
          booking: { bookingCode: booking.bookingCode, customerName: booking.customerName, status: booking.status },
        },
        { status: 400 }
      );
    }

    // Nếu vé đang PENDING → tự động chuyển sang PAID (thu tiền mặt khi lên xe)
    if (booking.status === 'PENDING') {
      await BookingRepository.updateStatus(booking.id, 'PAID');
      // Cập nhật payment nếu có
      try {
        const payment = await PaymentRepository.findByBookingId(booking.id);
        if (payment) {
          await PaymentRepository.updateStatus(booking.id, 'COMPLETED', `CASH_CHECKIN_${Date.now()}`);
        }
      } catch {}
    }

    // Thực hiện check-in
    const updatedBooking = await BookingRepository.checkIn(booking.id, session.user.id);

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Lỗi khi check-in vé' },
        { status: 500 }
      );
    }

    // Lấy lại thông tin booking với route
    const bookingWithDetails = await BookingRepository.findByCodeWithDetails(bookingCode) as any;

    // Ghi log scan để admin có lịch sử (cùng bảng với log của tài xế)
    try {
      await ensureScanSchema();
      const routeStr = bookingWithDetails?.route
        ? `${bookingWithDetails.route.from} → ${bookingWithDetails.route.to}`
        : '';
      const dateStr = bookingWithDetails?.date
        ? new Date(bookingWithDetails.date).toISOString().split('T')[0]
        : null;
      await query(
        `INSERT INTO qr_scan_logs (
          scanner_id, scanner_name, scanner_role, vehicle_plate,
          booking_code, booking_status, was_paid, result,
          customer_name, customer_phone, route,
          departure_time, departure_date, seats,
          pickup_method, pickup_address
        ) VALUES (
          @scannerId, @scannerName, @scannerRole, NULL,
          @bookingCode, @bookingStatus, true, 'CHECKED_IN',
          @customerName, @customerPhone, @route,
          @departureTime, @departureDate, @seats,
          @pickupMethod, @pickupAddress
        )`,
        {
          scannerId: session.user.id,
          scannerName: session.user.name,
          scannerRole: session.user.role,
          bookingCode: bookingWithDetails?.bookingCode || updatedBooking.bookingCode,
          bookingStatus: bookingWithDetails?.status || updatedBooking.status,
          customerName: bookingWithDetails?.customerName || updatedBooking.customerName,
          customerPhone: bookingWithDetails?.customerPhone || updatedBooking.customerPhone,
          route: routeStr,
          departureTime: bookingWithDetails?.departureTime || updatedBooking.departureTime,
          departureDate: dateStr,
          seats: bookingWithDetails?.seats || updatedBooking.seats,
          pickupMethod: bookingWithDetails?.pickupMethod ?? null,
          pickupAddress: bookingWithDetails?.pickupAddress ?? null,
        }
      );
    } catch (e) {
      console.error('[CHECKIN_LOG]', e);
      // Không fail check-in nếu chỉ log lỗi
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Check-in thành công!',
        booking: {
          bookingCode: bookingWithDetails?.bookingCode || updatedBooking.bookingCode,
          customerName: bookingWithDetails?.customerName || updatedBooking.customerName,
          customerPhone: bookingWithDetails?.customerPhone || updatedBooking.customerPhone,
          customerEmail: bookingWithDetails?.customerEmail || updatedBooking.customerEmail,
          route: bookingWithDetails?.route ? `${bookingWithDetails.route.from} → ${bookingWithDetails.route.to}` : '',
          date: bookingWithDetails?.date || updatedBooking.date,
          departureTime: bookingWithDetails?.departureTime || updatedBooking.departureTime,
          seats: bookingWithDetails?.seats || updatedBooking.seats,
          totalPrice: bookingWithDetails?.totalPrice || updatedBooking.totalPrice,
          status: bookingWithDetails?.status || updatedBooking.status,
          checkedIn: bookingWithDetails?.checkedIn || updatedBooking.checkedIn,
          checkedInAt: bookingWithDetails?.checkedInAt || updatedBooking.checkedInAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CHECKIN_ERROR]', error);
    return NextResponse.json(
      { error: 'Lỗi server khi check-in vé' },
      { status: 500 }
    );
  }
}
