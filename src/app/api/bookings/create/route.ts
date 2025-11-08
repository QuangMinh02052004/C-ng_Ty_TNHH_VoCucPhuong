import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateBookingCode, formatDateVN } from '@/lib/utils';
import { sendBookingConfirmationEmail } from '@/services/email.service';
import { sendBookingConfirmationSMS } from '@/services/sms.service';
import { generateTicketQRCode, generatePaymentQRCode } from '@/services/qrcode.service';

// ===========================================
// API: TẠO ĐẶT VÉ MỚI
// ===========================================
// POST /api/bookings/create

// Validation schema
const createBookingSchema = z.object({
    routeId: z.string().min(1, 'Route ID is required'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().min(10, 'Valid phone number is required'),
    customerEmail: z.string().email().optional().or(z.literal('')),
    date: z.string().min(1, 'Date is required'),
    departureTime: z.string().min(1, 'Departure time is required'),
    seats: z.number().int().min(1).max(10),
    userId: z.string().optional(), // Nếu user đã đăng nhập
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('📥 [API] Received booking request:', body);

        // Validate input
        const validation = createBookingSchema.safeParse(body);

        if (!validation.success) {
            console.error('❌ [API] Validation failed:', validation.error.errors);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validation.error.errors,
                },
                { status: 400 }
            );
        }

        console.log('✅ [API] Validation passed');


        const data = validation.data;

        // 1. Get route information
        const route = await prisma.route.findUnique({
            where: { id: data.routeId },
        });

        if (!route) {
            return NextResponse.json(
                { success: false, error: 'Route not found' },
                { status: 404 }
            );
        }

        if (!route.isActive) {
            return NextResponse.json(
                { success: false, error: 'Route is not active' },
                { status: 400 }
            );
        }

        // 2. Calculate total price
        const totalPrice = route.price * data.seats;

        // 3. Generate unique booking code
        let bookingCode = generateBookingCode();

        // Ensure unique booking code
        let exists = await prisma.booking.findUnique({
            where: { bookingCode },
        });

        while (exists) {
            bookingCode = generateBookingCode();
            exists = await prisma.booking.findUnique({
                where: { bookingCode },
            });
        }

        // 4. Generate QR codes
        const ticketQRCode = await generateTicketQRCode({
            bookingCode,
            customerName: data.customerName,
            route: `${route.from} → ${route.to}`,
            date: formatDateVN(data.date),
            departureTime: data.departureTime,
            seats: data.seats,
        });

        const paymentQRCode = await generatePaymentQRCode({
            bookingCode,
            amount: totalPrice,
        });

        // 5. Create booking in database
        const booking = await prisma.booking.create({
            data: {
                bookingCode,
                userId: data.userId || null,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                customerEmail: data.customerEmail || null,
                routeId: data.routeId,
                date: new Date(data.date),
                departureTime: data.departureTime,
                seats: data.seats,
                totalPrice,
                status: 'PENDING', // Chờ thanh toán
                qrCode: ticketQRCode,
            },
            include: {
                route: true,
            },
        });

        // 6. Create payment record
        await prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount: totalPrice,
                method: 'QRCODE', // Default là quét QR
                status: 'PENDING',
            },
        });

        // 7. Send confirmation email (async, don't wait)
        if (data.customerEmail) {
            sendBookingConfirmationEmail({
                to: data.customerEmail,
                customerName: data.customerName,
                bookingCode,
                route: `${route.from} → ${route.to}`,
                date: formatDateVN(data.date),
                departureTime: data.departureTime,
                seats: data.seats,
                totalPrice,
            }).catch(err => console.error('[Email] Failed to send:', err));
        }

        // 8. Send confirmation SMS (async, don't wait)
        sendBookingConfirmationSMS({
            to: data.customerPhone,
            customerName: data.customerName,
            bookingCode,
            route: `${route.from} → ${route.to}`,
            date: formatDateVN(data.date),
            departureTime: data.departureTime,
        }).catch(err => console.error('[SMS] Failed to send:', err));

        // 9. Return response with booking info and QR codes
        return NextResponse.json({
            success: true,
            message: 'Booking created successfully',
            data: {
                booking: {
                    id: booking.id,
                    bookingCode: booking.bookingCode,
                    customerName: booking.customerName,
                    customerPhone: booking.customerPhone,
                    customerEmail: booking.customerEmail,
                    route: {
                        from: route.from,
                        to: route.to,
                        busType: route.busType,
                        duration: route.duration,
                    },
                    date: formatDateVN(booking.date),
                    departureTime: booking.departureTime,
                    seats: booking.seats,
                    totalPrice: booking.totalPrice,
                    status: booking.status,
                    createdAt: booking.createdAt,
                },
                qrCodes: {
                    ticket: ticketQRCode,
                    payment: paymentQRCode,
                },
            },
        }, { status: 201 });

    } catch (error) {
        console.error('[API] Error creating booking:', error);

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
