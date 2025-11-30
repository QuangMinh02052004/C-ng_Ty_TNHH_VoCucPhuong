import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingRepository, PaymentRepository } from '@/lib/repositories/booking-repository';
import { z } from 'zod';

// ===========================================
// API: XÁC NHẬN THANH TOÁN (ADMIN/STAFF)
// ===========================================
// POST /api/admin/payments/confirm

const confirmPaymentSchema = z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    method: z.enum(['CASH', 'BANK_TRANSFER', 'QRCODE', 'MOMO', 'VNPAY']).optional(),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        // 1. Kiểm tra quyền admin/staff
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Validate input
        const body = await request.json();
        const validation = confirmPaymentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validation.error.issues,
                },
                { status: 400 }
            );
        }

        const { bookingId, method, transactionId, notes } = validation.data;

        // 3. Tìm booking
        const booking = await BookingRepository.findById(bookingId);

        if (!booking) {
            return NextResponse.json(
                { success: false, error: 'Booking not found' },
                { status: 404 }
            );
        }

        // 4. Kiểm tra trạng thái
        if (booking.status === 'PAID' || booking.status === 'COMPLETED') {
            return NextResponse.json(
                { success: false, error: 'Booking already paid' },
                { status: 400 }
            );
        }

        // 5. Cập nhật trạng thái booking
        const updatedBooking = await BookingRepository.updateStatus(bookingId, 'PAID');

        // 6. Cập nhật hoặc tạo payment record
        const existingPayment = await PaymentRepository.findByBookingId(bookingId);

        if (existingPayment) {
            // Payment đã tồn tại, cập nhật
            await PaymentRepository.update(existingPayment.id, {
                status: 'COMPLETED',
                method: method || existingPayment.method,
                transactionId: transactionId || null,
                paidAt: new Date(),
                metadata: notes ? JSON.stringify({ notes }) : null,
            });
        } else {
            // Chưa có payment, tạo mới
            await PaymentRepository.create({
                bookingId: booking.id,
                amount: booking.totalPrice,
                method: method || 'CASH',
                status: 'COMPLETED',
                transactionId: transactionId || null,
                paidAt: new Date(),
                metadata: notes ? JSON.stringify({ notes }) : null,
            });
        }

        console.log(`✅ [PAYMENT] Booking ${booking.bookingCode} confirmed by ${session.user.email}`);

        return NextResponse.json({
            success: true,
            message: 'Payment confirmed successfully',
            data: {
                booking: updatedBooking,
            },
        });

    } catch (error) {
        console.error('[API] Error confirming payment:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
