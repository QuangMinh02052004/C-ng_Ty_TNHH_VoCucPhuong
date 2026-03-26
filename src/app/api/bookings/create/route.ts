import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RouteRepository } from '@/lib/repositories/route-repository';
import { BookingRepository } from '@/lib/repositories/booking-repository';
import { generateBookingCode, formatDateVN } from '@/lib/utils';
import { sendBookingConfirmationEmail } from '@/services/email.service';
import { sendBookingConfirmationSMS } from '@/services/sms.service';
import { generateTicketQRCode, generatePaymentQRCode } from '@/services/qrcode.service';

// ===========================================
// API: TẠO ĐẶT VÉ MỚI
// ===========================================
// POST /api/bookings/create

const TONGHOP_URL = process.env.TONGHOP_URL || 'https://vocucphuongmanage.vercel.app';

// Fetch route from TongHop API by ID
async function fetchRouteFromTongHop(routeId: string) {
    try {
        const res = await fetch(`${TONGHOP_URL}/api/tong-hop/routes`);
        if (!res.ok) return null;
        const routes = await res.json();
        const r = routes.find((route: any) => String(route.id) === routeId);
        if (!r || !r.isActive) return null;
        return {
            id: String(r.id),
            from: r.fromStation || '',
            to: `${r.toStation || ''} (${r.routeType === 'cao_toc' ? 'Cao tốc' : 'Quốc lộ'})`,
            price: parseFloat(r.price) || 0,
            duration: r.duration || '',
            busType: r.busType || 'Ghế ngồi',
            isActive: true,
        };
    } catch {
        return null;
    }
}

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
            console.error('❌ [API] Validation failed:', validation.error.issues);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validation.error.issues,
                },
                { status: 400 }
            );
        }

        console.log('✅ [API] Validation passed');


        const data = validation.data;

        // 1. Get route information (try local DB first, then TongHop API)
        let route = await RouteRepository.findById(data.routeId);

        if (!route) {
            console.log('⚠️ [API] Route not found in local DB, fetching from TongHop...');
            const tongHopRoute = await fetchRouteFromTongHop(data.routeId);
            if (tongHopRoute) {
                route = tongHopRoute as any;
                console.log('✅ [API] Route found in TongHop:', tongHopRoute.from, '→', tongHopRoute.to);
            }
        }

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
        let exists = await BookingRepository.findByCode(bookingCode);

        while (exists) {
            bookingCode = generateBookingCode();
            exists = await BookingRepository.findByCode(bookingCode);
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

        // 5. Create booking and payment in database (transaction)
        const { booking, payment } = await BookingRepository.createWithPayment({
            booking: {
                bookingCode,
                userId: data.userId || null,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                customerEmail: data.customerEmail || null,
                routeId: data.routeId,
                scheduleId: null,
                date: new Date(data.date),
                departureTime: data.departureTime,
                seats: data.seats,
                totalPrice,
                status: 'PENDING',
                qrCode: ticketQRCode,
                ticketUrl: null,
                checkedIn: false,
                notes: null,
            },
            payment: {
                amount: totalPrice,
                method: 'QRCODE',
                status: 'PENDING',
                transactionId: null,
                paidAt: null,
                metadata: null,
            },
        });

        // 7. Send confirmation email (async, don't wait)
        if (data.customerEmail) {
            console.log('📧 [Booking] Customer email provided, sending confirmation to:', data.customerEmail);
            sendBookingConfirmationEmail({
                to: data.customerEmail,
                customerName: data.customerName,
                bookingCode,
                route: `${route.from} → ${route.to}`,
                date: formatDateVN(data.date),
                departureTime: data.departureTime,
                seats: data.seats,
                totalPrice,
            })
            .then(result => {
                if (result.success) {
                    console.log('✅ [Booking] Confirmation email sent successfully to:', data.customerEmail);
                } else {
                    console.error('❌ [Booking] Failed to send confirmation email:', result.error);
                }
            })
            .catch(err => console.error('❌ [Booking] Exception sending email:', err));
        } else {
            console.log('⚠️ [Booking] No customer email provided, skipping email confirmation');
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

        // 9. Gửi booking sang hệ thống Tổng Hợp (async, don't wait)
        sendToTongHop({
            bookingCode,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            date: data.date,
            departureTime: data.departureTime,
            seats: data.seats,
            totalPrice,
            route: `${route.from} → ${route.to}`,
            notes: booking.notes ?? null,
        }).catch(err => console.error('[TongHop] Failed to send:', err));

        // 10. Return response with booking info and QR codes
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

// Helper function để gửi booking sang hệ thống Tổng Hợp
async function sendToTongHop(bookingData: {
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    date: string;
    departureTime: string;
    seats: number;
    totalPrice: number;
    route: string;
    notes: string | null;
}) {
    // URL của hệ thống Tổng Hợp (vocucphuong-internal)
    const TONGHOP_URL = process.env.TONGHOP_URL || 'http://localhost:3001';

    try {
        // Gọi webhook endpoint: /api/tong-hop/webhook/datve
        const response = await fetch(`${TONGHOP_URL}/api/tong-hop/webhook/datve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('[DatVe] ✅ Đã gửi booking sang Tổng Hợp:', data.data);
        } else {
            console.error('[DatVe] ❌ Lỗi từ Tổng Hợp:', data.error);
        }

        return data;
    } catch (error) {
        console.error('[DatVe] ⚠️ Không thể kết nối Tổng Hợp:', error);
        throw error;
    }
}
