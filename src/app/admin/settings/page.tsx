'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Route } from '@/types';

function inferRouteType(r: Route): 'cao_toc' | 'quoc_lo' {
    if (r.routeType) return r.routeType;
    return /quốc\s*lộ/i.test(r.to) ? 'quoc_lo' : 'cao_toc';
}

export default function AdminSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [bookingEnabled, setBookingEnabled] = useState(true);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [routes, setRoutes] = useState<Route[]>([]);
    const [orderedIds, setOrderedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'authenticated' && session?.user.role !== 'ADMIN') {
            router.push('/admin');
        }
    }, [status, session, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        (async () => {
            try {
                const [settingsRes, routesRes] = await Promise.all([
                    fetch('/api/admin/settings', { cache: 'no-store' }),
                    fetch('/api/routes', { cache: 'no-store' }),
                ]);
                const settings = await settingsRes.json();
                const routesJson = await routesRes.json();
                if (!settingsRes.ok || !settings.success) throw new Error(settings.error || 'Lỗi tải cài đặt');

                const s = settings.settings || {};
                setBookingEnabled((s.booking_enabled ?? 'true') !== 'false');
                setMaintenanceMessage(
                    s.maintenance_message ??
                        'Hệ thống đặt vé online đang trong quá trình hoàn thiện. Vui lòng liên hệ hotline để đặt vé.'
                );

                const allRoutes: Route[] = Array.isArray(routesJson) ? routesJson : [];
                setRoutes(allRoutes);

                let savedOrder: string[] = [];
                try {
                    const parsed = JSON.parse(s.route_display_order || '[]');
                    if (Array.isArray(parsed)) savedOrder = parsed.map(String);
                } catch { /* ignore */ }

                const known = new Set(allRoutes.map(r => r.id));
                const ordered = [
                    ...savedOrder.filter(id => known.has(id)),
                    ...allRoutes.map(r => r.id).filter(id => !savedOrder.includes(id)),
                ];
                setOrderedIds(ordered);
            } catch (e: any) {
                setError(e.message || 'Không tải được cài đặt');
            } finally {
                setLoading(false);
            }
        })();
    }, [status]);

    const routesById = useMemo(() => {
        const m: Record<string, Route> = {};
        for (const r of routes) m[r.id] = r;
        return m;
    }, [routes]);

    const groupedOrder = useMemo(() => {
        const cao: string[] = [];
        const quoc: string[] = [];
        for (const id of orderedIds) {
            const r = routesById[id];
            if (!r) continue;
            if (inferRouteType(r) === 'cao_toc') cao.push(id);
            else quoc.push(id);
        }
        return { cao, quoc };
    }, [orderedIds, routesById]);

    function moveWithinGroup(group: 'cao' | 'quoc', id: string, dir: -1 | 1) {
        const arr = group === 'cao' ? [...groupedOrder.cao] : [...groupedOrder.quoc];
        const i = arr.indexOf(id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const otherGroup = group === 'cao' ? groupedOrder.quoc : groupedOrder.cao;
        const merged = group === 'cao' ? [...arr, ...otherGroup] : [...otherGroup, ...arr];
        setOrderedIds(merged);
    }

    async function save() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: {
                        booking_enabled: bookingEnabled ? 'true' : 'false',
                        maintenance_message: maintenanceMessage,
                        route_display_order: JSON.stringify(orderedIds),
                    },
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error || 'Lưu thất bại');
            setSavedAt(new Date().toLocaleTimeString('vi-VN'));
        } catch (e: any) {
            setError(e.message || 'Không lưu được');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p className="text-sm text-gray-600">Đang tải cài đặt...</p>;
    }

    const renderGroup = (label: string, group: 'cao' | 'quoc') => {
        const ids = groupedOrder[group];
        const borderClass = group === 'cao' ? 'border-sky-200' : 'border-amber-200';
        return (
            <div>
                <div className={`flex items-center justify-between mb-2 pb-1 border-b ${borderClass}`}>
                    <h4 className="text-sm font-semibold text-gray-800">
                        {label} <span className="text-gray-400 font-normal">({ids.length})</span>
                    </h4>
                </div>
                {ids.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2">Chưa có tuyến</p>
                ) : (
                    <ul className="space-y-1.5">
                        {ids.map((id, idx) => {
                            const r = routesById[id];
                            if (!r) return null;
                            return (
                                <li
                                    key={id}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded text-sm"
                                >
                                    <span className="text-xs text-gray-400 w-5">{idx + 1}.</span>
                                    <span className="flex-1 text-gray-800">
                                        {r.from} → {r.to}
                                    </span>
                                    <span className="text-xs text-gray-500">{r.price.toLocaleString('vi-VN')}đ</span>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => moveWithinGroup(group, id, -1)}
                                            className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Chuyển lên"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            type="button"
                                            disabled={idx === ids.length - 1}
                                            onClick={() => moveWithinGroup(group, id, 1)}
                                            className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Chuyển xuống"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-3xl">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Cài đặt hệ thống</h1>
            <p className="text-sm text-gray-500 mb-6">Bật/tắt đặt vé online và sắp xếp thứ tự hiển thị tuyến đường.</p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5 mb-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Cho phép khách đặt vé online</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Tắt để hiển thị banner bảo trì và chặn API tạo vé. Quản trị viên vẫn có thể tạo vé qua hệ
                            thống nội bộ.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setBookingEnabled(v => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition flex-shrink-0 ${
                            bookingEnabled ? 'bg-sky-500' : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                bookingEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                        Tin nhắn bảo trì
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Hiển thị cho khách khi tính năng đặt vé bị tắt.
                    </p>
                    <textarea
                        value={maintenanceMessage}
                        onChange={e => setMaintenanceMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Hệ thống đặt vé online đang trong quá trình hoàn thiện..."
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Thứ tự hiển thị tuyến đường</h3>
                <p className="text-xs text-gray-500 mb-4">
                    Áp dụng cho trang <code>/tuyen-duong</code> và dropdown chọn tuyến trên trang đặt vé. Mỗi loại
                    (Cao tốc / Quốc lộ) sắp xếp riêng.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {renderGroup('⚡ Cao tốc', 'cao')}
                    {renderGroup('🛣️ Quốc lộ', 'quoc')}
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 pb-6">
                <div className="text-xs text-gray-500">
                    {savedAt ? `Đã lưu lúc ${savedAt}` : 'Nhớ bấm Lưu sau khi sắp xếp'}
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-md transition"
                >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">💡 Lưu ý</h3>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                    <li>Cài đặt áp dụng ngay sau khi lưu, không cần deploy lại.</li>
                    <li>Khi tắt đặt vé: trang /dat-ve hiện banner bảo trì, API trả 503.</li>
                    <li>Tuyến mới (thêm sau) sẽ tự xếp ở cuối nhóm tương ứng.</li>
                </ul>
            </div>
        </div>
    );
}
