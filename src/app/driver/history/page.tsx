'use client';

import { useEffect, useState } from 'react';

interface Trip {
    id: number;
    startedAt: string;
    completedAt: string | null;
    vehiclePlate: string | null;
    passengerCount: number;
    paidOnline: number;
    expectedCash: number;
    totalAmount: number;
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
    return `${h}h ${m}p`;
}

export default function DriverHistoryPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/driver/trips?limit=50', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setTrips(data.trips || []);
            })
            .catch(e => setError(e instanceof Error ? e.message : 'Lỗi'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-3 md:p-5">
            <div className="mb-4">
                <h1 className="text-lg font-bold text-gray-900">Lịch sử chuyến đi</h1>
                <p className="text-xs text-gray-600 mt-0.5">{trips.length} chuyến gần đây</p>
            </div>

            {loading && (
                <div className="text-center py-8 text-gray-500 text-sm">Đang tải...</div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-3">{error}</div>
            )}

            {!loading && trips.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">
                    Chưa có chuyến nào
                </div>
            )}

            <ul className="space-y-2">
                {trips.map(t => {
                    const isOpen = !t.completedAt;
                    return (
                        <li key={t.id} className={`bg-white border rounded-lg p-3 ${isOpen ? 'border-sky-300' : 'border-gray-200'}`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <p className="text-xs text-gray-500">Bắt đầu</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatTime(t.startedAt)}</p>
                                </div>
                                {isOpen ? (
                                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold bg-sky-100 text-sky-800">
                                        Đang chạy
                                    </span>
                                ) : (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Kết thúc</p>
                                        <p className="text-sm font-semibold text-gray-900">{formatTime(t.completedAt)}</p>
                                    </div>
                                )}
                            </div>

                            {!isOpen && (
                                <p className="text-xs text-gray-500 mb-2">
                                    Thời lượng: <span className="font-semibold text-gray-700">{duration(t.startedAt, t.completedAt)}</span>
                                    {t.vehiclePlate && <span> · Xe {t.vehiclePlate}</span>}
                                </p>
                            )}

                            <div className="grid grid-cols-3 gap-2 text-center mt-2">
                                <div className="bg-gray-50 rounded p-1.5">
                                    <p className="text-[10px] text-gray-500 uppercase">Khách</p>
                                    <p className="text-sm font-bold text-gray-900">{t.passengerCount}</p>
                                </div>
                                <div className="bg-green-50 rounded p-1.5">
                                    <p className="text-[10px] text-green-700 uppercase">Đã TT</p>
                                    <p className="text-xs font-bold text-green-800">{formatVND(t.paidOnline)}</p>
                                </div>
                                <div className="bg-amber-50 rounded p-1.5">
                                    <p className="text-[10px] text-amber-700 uppercase">Tiền mặt</p>
                                    <p className="text-xs font-bold text-amber-800">{formatVND(t.expectedCash)}</p>
                                </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-600">Tổng</span>
                                <span className="text-sm font-bold text-sky-700">{formatVND(t.totalAmount)}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
