import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const bookingCode = searchParams.get('bookingCode');

        if (!bookingCode) {
            return NextResponse.json(
                { error: 'Booking code is required' },
                { status: 400 }
            );
        }

        // Find booking
        const booking = await prisma.booking.findUnique({
            where: { bookingCode },
            select: {
                id: true,
                bookingCode: true,
                status: true,
                totalPrice: true,
                customerName: true,
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            status: booking.status,
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            totalPrice: booking.totalPrice,
        });
    } catch (error) {
        console.error('[CHECK_STATUS_ERROR]', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
