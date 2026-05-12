import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { ensureScanSchema } from '@/lib/driver-schema';

// GET: lấy biển số xe hiện tại
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'DRIVER')
            return NextResponse.json({ error: 'Chỉ tài xế' }, { status: 403 });

        await ensureScanSchema();
        const rows = await query<{ vehicle_plate: string | null }>(
            `SELECT vehicle_plate FROM users WHERE id = @id`,
            { id: session.user.id }
        );
        return NextResponse.json({ vehiclePlate: rows[0]?.vehicle_plate ?? null });
    } catch (e) {
        console.error('[DRIVER_ME_VEHICLE_GET]', e);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}

// PATCH: tài xế tự cập nhật biển số xe của chính mình
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'DRIVER')
            return NextResponse.json({ error: 'Chỉ tài xế' }, { status: 403 });

        const body = await request.json();
        const plate = (body?.vehiclePlate ?? '').toString().trim().toUpperCase();
        if (!plate) {
            return NextResponse.json({ error: 'Vui lòng nhập biển số xe' }, { status: 400 });
        }
        if (plate.length > 20) {
            return NextResponse.json({ error: 'Biển số quá dài' }, { status: 400 });
        }

        await ensureScanSchema();
        await query(
            `UPDATE users SET vehicle_plate = @plate, updated_at = NOW() WHERE id = @id`,
            { plate, id: session.user.id }
        );

        return NextResponse.json({ success: true, vehiclePlate: plate });
    } catch (e) {
        console.error('[DRIVER_ME_VEHICLE_PATCH]', e);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
