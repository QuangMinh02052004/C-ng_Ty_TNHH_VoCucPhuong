import { NextResponse } from 'next/server';
import { routes as fallbackRoutes } from '@/data/routes';
import { getSetting } from '@/lib/repositories/settings-repository';

export const dynamic = 'force-dynamic';

const TONGHOP_URL = process.env.TONGHOP_URL || 'https://vocucphuongmanage.vercel.app';

// Helper: Generate departure times from operatingStart to operatingEnd
function generateDepartureTimes(start: string, end: string, interval: number): string[] {
    const times: string[] = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let current = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    while (current <= endMin) {
        const h = String(Math.floor(current / 60)).padStart(2, '0');
        const m = String(current % 60).padStart(2, '0');
        times.push(`${h}:${m}`);
        current += interval;
    }
    return times;
}

// Sort routes by admin-defined display order; unlisted routes go to the end (in original order)
function applyDisplayOrder<T extends { id: string }>(routes: T[], orderJson: string): T[] {
    let order: string[] = [];
    try {
        const parsed = JSON.parse(orderJson || '[]');
        if (Array.isArray(parsed)) order = parsed.map(String);
    } catch { /* ignore */ }
    if (order.length === 0) return routes;
    const indexOf = (id: string) => {
        const i = order.indexOf(String(id));
        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    return [...routes].sort((a, b) => indexOf(a.id) - indexOf(b.id));
}

// GET /api/routes - Lấy danh sách tuyến từ TongHop, convert sang DatVe format
export async function GET() {
    try {
        const [res, orderJson] = await Promise.all([
            fetch(`${TONGHOP_URL}/api/tong-hop/routes`, { next: { revalidate: 60 } }),
            getSetting('route_display_order', '[]'),
        ]);

        if (!res.ok) throw new Error('Failed to fetch routes from TongHop');

        const tongHopRoutes = await res.json();

        // Convert TongHop format → DatVe format
        const datVeRoutes = tongHopRoutes
            .filter((r: any) => r.isActive)
            .map((r: any, index: number) => ({
                id: String(r.id || index + 1),
                from: r.fromStation || '',
                to: `${r.toStation || ''} (${r.routeType === 'cao_toc' ? 'Cao tốc' : 'Quốc lộ'})`,
                price: parseFloat(r.price) || 0,
                duration: r.duration || '',
                departureTime: generateDepartureTimes(
                    r.operatingStart || '05:30',
                    r.operatingEnd || '20:00',
                    r.intervalMinutes || 30
                ),
                availableSeats: r.seats || 28,
                busType: r.busType || 'Ghế ngồi',
                distance: parseInt(r.distance) || 80,
                routeType: r.routeType === 'cao_toc' ? 'cao_toc' : 'quoc_lo',
            }));

        return NextResponse.json(applyDisplayOrder(datVeRoutes, orderJson));
    } catch (error) {
        console.error('[Routes API] Error fetching from TongHop:', error);
        return NextResponse.json(fallbackRoutes);
    }
}
