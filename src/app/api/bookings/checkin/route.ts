import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { bookingCode } = validation.data;

    // Tìm booking theo mã vé
    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        route: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

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

    // Kiểm tra trạng thái vé (phải đã thanh toán hoặc đã xác nhận)
    if (booking.status !== 'PAID' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        {
          error: `Không thể check-in vé có trạng thái ${booking.status}. Vé phải có trạng thái PAID hoặc CONFIRMED.`,
          booking: {
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            status: booking.status,
          },
        },
        { status: 400 }
      );
    }

    // Thực hiện check-in
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: session.user.id,
      },
      include: {
        route: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Check-in thành công!',
        booking: {
          bookingCode: updatedBooking.bookingCode,
          customerName: updatedBooking.customerName,
          customerPhone: updatedBooking.customerPhone,
          customerEmail: updatedBooking.customerEmail,
          route: `${updatedBooking.route.from} → ${updatedBooking.route.to}`,
          date: updatedBooking.date,
          departureTime: updatedBooking.departureTime,
          seats: updatedBooking.seats,
          totalPrice: updatedBooking.totalPrice,
          status: updatedBooking.status,
          checkedIn: updatedBooking.checkedIn,
          checkedInAt: updatedBooking.checkedInAt,
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
