'use client';

import { useEffect, useState, useCallback } from 'react';

interface Driver {
    id: string;
    name: string;
    vehiclePlate: string | null;
}

interface Trip {
    id: number;
    driverId: string;
    driverName: string;
    vehiclePlate: string | null;
    startedAt: string;
    completedAt: string | null;
    passengerCount: number;
    paidOnline: number;
    expectedCash: number;
    totalAmount: number;
}

interface Scan {
    id: number;
    bookingCode: string;
    bookingStatus: string;
    wasPaid: boolean;
    result: string | null;
    totalPrice: number;
    customerName: string | null;
    customerPhone: string | null;
    route: string | null;
    departureTime: string | null;
    departureDate: string | null;
    seats: number | null;
    pickupMethod: string | null;
    pickupAddress: string | null;
    scannedAt: string;
}

function formatTime(iso: string | null): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('vi-VN', { hour12: false }); }
    catch { return iso; }
}

function formatVND(n: number): string {
    return (n || 0).toLocaleString('vi-VN') + ' đ';
}

function duration(start: string, end: string | null): string {
    if (!end) return '';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 60) return `${min} phút`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h${m}p`;
}

export default function AdminScanLogsPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [expandedTripId, setExpandedTripId] = useState<number | null>(null);
    const [tripScans, setTripScans] = useState<Record<number, Scan[]>>({});
    const [error, setError] = useState<string | null>(null);

    // Load drivers
    useEffect(() => {
        fetch('/api/admin/drivers', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => setDrivers(data.drivers || []))
            .catch(() => { /* ignore */ });
    }, []);

    const loadTrips = useCallback(async () => {
        setLoadingTrips(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (selectedDriverId) params.set('driverId', selectedDriverId);
            params.set('limit', '100');
            const res = await fetch(`/api/admin/trips?${params}`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lỗi');
            setTrips(data.trips || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi');
        } finally {
            setLoadingTrips(false);
        }
    }, [selectedDriverId]);

    useEffect(() => { loadTrips(); }, [loadTrips]);

    const toggleTrip = async (tripId: number) => {
        if (expandedTripId === tripId) {
            setExpandedTripId(null);
            return;
        }
        setExpandedTripId(tripId);
        if (!tripScans[tripId]) {
            try {
                const res = await fetch(`/api/admin/trips/${tripId}/scans`, { cache: 'no-store' });
                const data = await res.json();
                setTripScans(prev => ({ ...prev, [tripId]: data.scans || [] }));
            } catch { /* ignore */ }
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl">
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Quản lý chuyến quét QR</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Mỗi chuyến gồm các lần quét vé từ lúc tài xế bấm &quot;Bắt đầu chuyến&quot; đến khi &quot;Hoàn thành&quot;.
                    Click vào 1 chuyến để xem danh sách vé đã quét.
                </p>
            </div>

            {/* Filter */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-2">
                <label className="text-xs text-gray-700 font-medium">Tài xế:</label>
                <select
                    value={selectedDriverId}
                    onChange={e => setSelectedDriverId(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-900 min-w-[200px]"
                >
                    <option value="">— Tất cả tài xế —</option>
                    {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                            {d.name}{d.vehiclePlate ? ` (${d.vehiclePlate})` : ''}
                        </option>
                    ))}
                </select>
                <span className="text-xs text-gray-500 ml-auto">{trips.length} chuyến</span>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-3">{error}</div>
            )}

            {/* Trip list */}
            <div className="space-y-2">
                {loadingTrips ? (
                    <div className="text-center py-8 text-gray-500 text-sm">Đang tải...</div>
                ) : trips.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-500 text-sm">
                        Chưa có chuyến nào
                    </div>
                ) : trips.map(t => {
                    const isOpen = !t.completedAt;
                    const isExpanded = expandedTripId === t.id;
                    return (
                        <div key={t.id} className={`bg-white border rounded-lg overflow-hidden ${isOpen ? 'border-sky-300' : 'border-gray-200'}`}>
                            <button
                                onClick={() => toggleTrip(t.id)}
                                className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-sm font-semibold text-gray-900">{t.driverName}</span>
                                            {t.vehiclePlate && (
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono">
                                                    {t.vehiclePlate}
                                                </span>
                                            )}
                                            {isOpen && (
                                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold bg-sky-100 text-sky-800">
                                                    Đang chạy
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium">Bắt đầu:</span> {formatTime(t.startedAt)}
                                            {t.completedAt && (
                                                <>
                                                    {' · '}
                                                    <span className="font-medium">Kết thúc:</span> {formatTime(t.completedAt)}
                                                    {' '}
                                                    <span className="text-gray-500">({duration(t.startedAt, t.completedAt)})</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex gap-3 text-xs">
                                        <div className="text-center">
                                            <p className="text-gray-500">Khách</p>
                                            <p className="font-bold text-gray-900">{t.passengerCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-green-700">Đã TT</p>
                                            <p className="font-bold text-green-800">{formatVND(t.paidOnline)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-amber-700">Tiền mặt</p>
                                            <p className="font-bold text-amber-800">{formatVND(t.expectedCash)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sky-700">Tổng</p>
                                            <p className="font-bold text-sky-800">{formatVND(t.totalAmount)}</p>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Expanded: danh sách scan trong chuyến */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 bg-gray-50">
                                    {!tripScans[t.id] ? (
                                        <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
                                    ) : tripScans[t.id].length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">Chưa có vé nào trong chuyến này</div>
                                    ) : (
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-700">Giờ quét</th>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-700">Mã vé</th>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-700">Khách</th>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-700">Điểm đón</th>
                                                    <th className="px-3 py-1.5 text-right font-semibold text-gray-700">Tiền</th>
                                                    <th className="px-3 py-1.5 text-left font-semibold text-gray-700 w-24">Kết quả</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tripScans[t.id].map(s => {
                                                    const isError = s.result === 'NOT_FOUND';
                                                    const isDup = s.result === 'DUPLICATE';
                                                    return (
                                                        <tr key={s.id} className="border-b border-gray-100 last:border-0">
                                                            <td className="px-3 py-1.5 text-gray-600 whitespace-nowrap">{formatTime(s.scannedAt)}</td>
                                                            <td className="px-3 py-1.5 font-mono font-semibold text-gray-900">{s.bookingCode}</td>
                                                            <td className="px-3 py-1.5">
                                                                {s.customerName ? (
                                                                    <>
                                                                        <div className="text-gray-900">{s.customerName}</div>
                                                                        <div className="text-gray-500">{s.customerPhone}</div>
                                                                    </>
                                                                ) : <span className="text-gray-400">—</span>}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-gray-700">
                                                                {s.pickupMethod === 'Dọc đường' ? s.pickupAddress : s.pickupMethod || '—'}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-right font-semibold text-gray-900">
                                                                {s.totalPrice ? formatVND(s.totalPrice) : '—'}
                                                            </td>
                                                            <td className="px-3 py-1.5">
                                                                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                                                                    isError ? 'bg-red-100 text-red-800'
                                                                        : isDup ? 'bg-blue-100 text-blue-800'
                                                                        : s.wasPaid ? 'bg-green-100 text-green-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {isError ? 'Không có'
                                                                        : isDup ? 'Trùng'
                                                                        : s.wasPaid ? 'Đã TT'
                                                                        : 'Chưa TT'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
