import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllSettings, setSetting } from '@/lib/repositories/settings-repository';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session) return { ok: false, status: 401, error: 'Unauthorized' };
    if (session.user.role !== 'ADMIN') return { ok: false, status: 403, error: 'Forbidden — Admin only' };
    return { ok: true, session };
}

// GET /api/admin/settings — all current settings
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    try {
        const settings = await getAllSettings();
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// PUT /api/admin/settings — body: { key, value } or { settings: { ... } }
export async function PUT(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    try {
        const body = await request.json();
        if (body.settings && typeof body.settings === 'object') {
            for (const [k, v] of Object.entries(body.settings)) {
                await setSetting(k, String(v));
            }
        } else if (body.key) {
            await setSetting(body.key, String(body.value ?? ''));
        } else {
            return NextResponse.json({ success: false, error: 'Missing settings or key' }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
