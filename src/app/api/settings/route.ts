import { NextResponse } from 'next/server';
import { isBookingEnabled, getMaintenanceMessage } from '@/lib/repositories/settings-repository';

export const dynamic = 'force-dynamic';

// GET /api/settings — public flags
export async function GET() {
    try {
        const [enabled, message] = await Promise.all([
            isBookingEnabled(),
            getMaintenanceMessage(),
        ]);
        return NextResponse.json({
            bookingEnabled: enabled,
            maintenanceMessage: message,
        });
    } catch {
        // Nếu lỗi (vd table chưa tạo), default = bật
        return NextResponse.json({
            bookingEnabled: true,
            maintenanceMessage: '',
        });
    }
}
