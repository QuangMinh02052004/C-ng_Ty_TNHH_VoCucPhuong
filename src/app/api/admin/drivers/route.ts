import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const rows = await query<any>(
            `SELECT id, name, email, vehicle_plate
             FROM users
             WHERE role = 'DRIVER'
             ORDER BY name`,
            {}
        );

        return NextResponse.json({
            drivers: rows.map(r => ({
                id: r.id,
                name: r.name,
                email: r.email,
                vehiclePlate: r.vehicle_plate,
            })),
        });
    } catch (e: any) {
        console.error('[ADMIN_DRIVERS]', e);
        return NextResponse.json({ error: e?.message || 'Lỗi server' }, { status: 500 });
    }
}
