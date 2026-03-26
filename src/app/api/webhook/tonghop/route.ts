import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// ===========================================
// API: WEBHOOK NHẬN BOOKING TỪ TỔNG HỢP
// ===========================================
// POST /api/webhook/tonghop

// Danh sách các trạm thuộc khu vực Sài Gòn (điểm đầu)
const SAI_GON_STATIONS = [
    'sài gòn', 'saigon', 'sg', 'hcm', 'hồ chí minh', 'ho chi minh',
    'bến xe miền đông', 'ben xe mien dong', 'miền đông',
    'quận 1', 'quận 2', 'quận 3', 'quận 4', 'quận 5', 'quận 6', 'quận 7',
    'quận 8', 'quận 9', 'quận 10', 'quận 11', 'quận 12',
    'thủ đức', 'thu duc', 'bình thạnh', 'binh thanh', 'gò vấp', 'go vap',
    'tân bình', 'tan binh', 'phú nhuận', 'phu nhuan'
];

// Danh sách các trạm thuộc khu vực Long Khánh/Xuân Lộc (điểm cuối)
const LONG_KHANH_STATIONS = [
    'long khánh', 'long khanh', 'lk',
    'xuân lộc', 'xuan loc', 'xl',
    'đồng nai', 'dong nai',
    'bình sơn', 'binh son',
    'suối tre', 'suoi tre',
    'ngã ba ông đồn', 'nga ba ong don'
];

// Xác định tuyến dựa trên địa chỉ đón/trả
function determineRoute(pickupAddress: string, dropoffAddress: string): { from: string; to: string; direction: string } {
    const pickup = (pickupAddress || '').toLowerCase();
    const dropoff = (dropoffAddress || '').toLowerCase();

    // Kiểm tra điểm đón có thuộc Sài Gòn không
    const pickupIsSaiGon = SAI_GON_STATIONS.some(station => pickup.includes(station));
    // Kiểm tra điểm đón có thuộc Long Khánh/Xuân Lộc không
    const pickupIsLongKhanh = LONG_KHANH_STATIONS.some(station => pickup.includes(station));

    // Kiểm tra điểm trả
    const dropoffIsSaiGon = SAI_GON_STATIONS.some(station => dropoff.includes(station));
    const dropoffIsLongKhanh = LONG_KHANH_STATIONS.some(station => dropoff.includes(station));

    // Logic xác định tuyến:
    // 1. Nếu đón tại Sài Gòn hoặc trả tại Long Khánh → Sài Gòn - Long Khánh
    // 2. Nếu đón tại Long Khánh hoặc trả tại Sài Gòn → Long Khánh - Sài Gòn
    if (pickupIsSaiGon || dropoffIsLongKhanh) {
        return { from: 'Sài Gòn', to: 'Long Khánh', direction: 'SG-LK' };
    }

    if (pickupIsLongKhanh || dropoffIsSaiGon) {
        return { from: 'Long Khánh', to: 'Sài Gòn', direction: 'LK-SG' };
    }

    // Mặc định: Sài Gòn - Long Khánh
    return { from: 'Sài Gòn', to: 'Long Khánh', direction: 'SG-LK' };
}

// Tìm route trong database dựa trên from/to (PostgreSQL)
async function findRouteByFromTo(from: string, to: string): Promise<any | null> {
    // Tìm chính xác
    let route = await queryOne<any>(
        `SELECT * FROM routes WHERE origin ILIKE @from AND destination ILIKE @to AND is_active = true`,
        { from: `%${from}%`, to: `%${to}%` }
    );

    if (route) {
        return {
            id: route.id,
            from: route.origin,
            to: route.destination,
            price: route.price,
        };
    }

    // Tìm route đầu tiên active nếu không tìm thấy
    route = await queryOne<any>(
        `SELECT * FROM routes WHERE is_active = true ORDER BY created_at LIMIT 1`,
        {}
    );

    if (route) {
        return {
            id: route.id,
            from: route.origin,
            to: route.destination,
            price: route.price,
        };
    }

    return null;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('[Webhook TongHop] Received booking:', body);

        const {
            customerName,    // Tên người nhận
            customerPhone,   // Số điện thoại
            note,           // Ghi chú: số lượng vé + ghế
            // Các trường tùy chọn
            date,
            timeSlot,       // Khung giờ (ví dụ: "9:30", "14:00")
            route: routeName,
            seatNumber,
            amount,
            // Thông tin địa chỉ để xác định tuyến
            pickupAddress,
            dropoffAddress,
            source = 'TONGHOP'
        } = body;

        // Validate required fields
        if (!customerName || !customerPhone) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Thiếu thông tin bắt buộc',
                    details: 'Cần có customerName và customerPhone'
                },
                { status: 400 }
            );
        }

        // Xác định tuyến dựa trên địa chỉ đón/trả
        const routeInfo = determineRoute(pickupAddress || '', dropoffAddress || '');
        console.log('[Webhook TongHop] Determined route:', routeInfo);

        // Tìm route trong database
        const dbRoute = await findRouteByFromTo(routeInfo.from, routeInfo.to);
        const routeId = dbRoute?.id || null;
        const routePrice = dbRoute?.price || 0;

        console.log('[Webhook TongHop] Found route:', dbRoute ? `${dbRoute.from} → ${dbRoute.to}` : 'None');

        // Generate unique booking code với prefix theo hướng
        const bookingCode = generateBookingCode(routeInfo.direction);

        // Parse seats from note if available
        let seats = seatNumber || 1;
        if (!seatNumber && note) {
            const seatMatch = note.match(/(\d+)\s*vé/i);
            if (seatMatch) {
                seats = parseInt(seatMatch[1], 10);
            }
        }

        // Tính tổng tiền
        const totalPrice = amount || (routePrice * seats);

        // Format departureTime (khung giờ)
        const departureTime = timeSlot || '';

        // Insert booking into database (PostgreSQL - snake_case)
        const bookingId = crypto.randomUUID();
        const now = new Date();

        await query(
            `INSERT INTO bookings (
                id, booking_code, user_id, customer_name, customer_phone, customer_email,
                route_id, schedule_id, date, departure_time, seats, total_price, status,
                qr_code, ticket_url, checked_in, notes, created_at, updated_at
            ) VALUES (
                @id, @bookingCode, NULL, @customerName, @customerPhone, NULL,
                @routeId, NULL, @date, @departureTime, @seats, @totalPrice, @status,
                NULL, NULL, false, @notes, @createdAt, @updatedAt
            )`,
            {
                id: bookingId,
                bookingCode,
                customerName,
                customerPhone,
                routeId,
                date: date ? new Date(date) : now,
                departureTime,
                seats,
                totalPrice,
                status: 'PENDING',
                notes: `[Từ Tổng Hợp] Tuyến: ${routeInfo.from} → ${routeInfo.to} | Khung giờ: ${departureTime} | Ghế: ${seatNumber || 'N/A'} | ${note || ''}`.trim(),
                createdAt: now,
                updatedAt: now,
            }
        );

        console.log('[Webhook TongHop] Created booking:', bookingCode, `(${routeInfo.direction})`);

        return NextResponse.json({
            success: true,
            message: 'Đã nhận booking từ Tổng Hợp',
            data: {
                bookingCode,
                customerName,
                customerPhone,
                route: `${routeInfo.from} → ${routeInfo.to}`,
                direction: routeInfo.direction,
                departureTime,
                seats,
                totalPrice,
                status: 'PENDING',
                createdAt: now,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('[Webhook TongHop] Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Lỗi server',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// GET - Health check
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Webhook TongHop endpoint is active',
        timestamp: new Date().toISOString(),
    });
}

// Helper function to generate booking code
function generateBookingCode(direction?: string): string {
    // Prefix theo hướng: SG = Sài Gòn đi, LK = Long Khánh đi
    const prefix = direction === 'LK-SG' ? 'LK' : 'SG';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}
