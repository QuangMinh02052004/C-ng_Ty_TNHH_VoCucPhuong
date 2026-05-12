'use client';

import { useEffect, useState } from 'react';

interface ScanLog {
    id: number;
    bookingCode: string;
    bookingStatus: string;
    wasPaid: boolean;
    result: string | null;
    customerName: string | null;
    customerPhone: string | null;
    route: string | null;
    departureTime: string | null;
    departureDate: string | null;
    seats: number | null;
    pickupMethod: string | null;
    pickupAddress: string | null;
    scannedAt: string;
    driverName: string;
    vehiclePlate: string | null;
}

function formatTime(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleString('vi-VN', { hour12: false });
    } catch {
        return iso;
    }
}

export default function DriverHistoryPage() {
    const [logs, setLogs] = useState<ScanLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/driver/history?limit=100', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setLogs(data.logs || []);
            })
            .catch(e => setError(e instanceof Error ? e.message : 'Lỗi'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-3 md:p-5">
            <div className="mb-4">
                <h1 className="text-lg font-bold text-gray-900">Lịch sử vé đã quét</h1>
                <p className="text-xs text-gray-600 mt-0.5">
                    {logs.length} lần quét gần đây
                </p>
            </div>

            {loading && (
                <div className="text-center py-8 text-gray-500 text-sm">Đang tải...</div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-3">{error}</div>
            )}

            {!loading && logs.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">
                    Chưa có vé nào được quét
                </div>
            )}

            <ul className="space-y-2">
                {logs.map(log => {
                    const isError = log.result === 'NOT_FOUND';
                    const badgeClass = isError
                        ? 'bg-red-100 text-red-800'
                        : log.wasPaid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800';
                    const badgeText = isError
                        ? 'Không tìm thấy'
                        : log.wasPaid
                            ? 'Đã thanh toán'
                            : 'Chưa thanh toán';

                    return (
                        <li key={log.id} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="font-mono text-sm font-bold text-gray-900">{log.bookingCode}</span>
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${badgeClass}`}>
                                    {badgeText}
                                </span>
                            </div>
                            {!isError && (
                                <>
                                    {log.customerName && (
                                        <p className="text-sm text-gray-800">
                                            {log.customerName}
                                            {log.customerPhone && <span className="text-gray-500"> · {log.customerPhone}</span>}
                                        </p>
                                    )}
                                    {log.route && (
                                        <p className="text-xs text-gray-600 mt-0.5">{log.route}</p>
                                    )}
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600 mt-1">
                                        {log.departureDate && <span>Ngày: {log.departureDate}</span>}
                                        {log.departureTime && <span>Giờ: {log.departureTime}</span>}
                                        {log.seats != null && <span>{log.seats} ghế</span>}
                                    </div>
                                    {log.pickupMethod === 'Dọc đường' && log.pickupAddress && (
                                        <p className="text-xs text-sky-700 mt-0.5">Đón: {log.pickupAddress}</p>
                                    )}
                                </>
                            )}
                            <p className="text-[10px] text-gray-400 mt-2">
                                Quét lúc {formatTime(log.scannedAt)}
                                {log.vehiclePlate && ` · Xe ${log.vehiclePlate}`}
                            </p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
