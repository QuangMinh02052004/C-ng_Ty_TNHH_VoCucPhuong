'use client';

import { useEffect, useState } from 'react';

interface ScanLog {
    id: number;
    scannerId: string;
    scannerName: string;
    scannerRole: string;
    vehiclePlate: string | null;
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
}

function formatTime(iso: string): string {
    try { return new Date(iso).toLocaleString('vi-VN', { hour12: false }); }
    catch { return iso; }
}

export default function AdminScanLogsPage() {
    const [logs, setLogs] = useState<ScanLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [search, setSearch] = useState('');

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set('limit', '200');
            if (roleFilter) params.set('role', roleFilter);
            if (search) params.set('search', search);
            const res = await fetch(`/api/admin/scan-logs?${params}`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lỗi tải dữ liệu');
            setLogs(data.logs || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [roleFilter]);

    return (
        <div className="p-4 md:p-6 max-w-6xl">
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Lịch sử quét QR</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Tất cả lần quét QR vé từ tài khoản tài xế (xác nhận) và admin/staff (check-in).
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-2">
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-900"
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="DRIVER">Tài xế</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                </select>
                <form
                    onSubmit={e => { e.preventDefault(); load(); }}
                    className="flex gap-2 flex-1 min-w-[200px]"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm mã vé, tên khách, sđt, biển số..."
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-900"
                    />
                    <button
                        type="submit"
                        className="px-4 py-1.5 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
                    >
                        Tìm
                    </button>
                </form>
                <span className="text-xs text-gray-500 ml-auto">{logs.length} kết quả</span>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-3">{error}</div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Thời gian</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Người quét</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Mã vé</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Khách</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Tuyến / Giờ</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Điểm đón</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 w-28">Kết quả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Đang tải...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Không có log nào</td></tr>
                            ) : logs.map(log => {
                                const isError = log.result === 'NOT_FOUND';
                                return (
                                    <tr key={log.id} className="border-b border-gray-100">
                                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                                            {formatTime(log.scannedAt)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-gray-900 font-medium">{log.scannerName}</div>
                                            <div className="text-xs text-gray-500">
                                                {log.scannerRole}
                                                {log.vehiclePlate && ` · Xe ${log.vehiclePlate}`}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 font-mono font-semibold text-gray-900">{log.bookingCode}</td>
                                        <td className="px-3 py-2">
                                            {log.customerName ? (
                                                <>
                                                    <div className="text-gray-900">{log.customerName}</div>
                                                    <div className="text-xs text-gray-500">{log.customerPhone}</div>
                                                </>
                                            ) : <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-3 py-2 text-xs">
                                            <div className="text-gray-700">{log.route || '—'}</div>
                                            <div className="text-gray-500">
                                                {log.departureDate} {log.departureTime}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-700">
                                            {log.pickupMethod === 'Dọc đường'
                                                ? log.pickupAddress
                                                : log.pickupMethod || '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                                                isError ? 'bg-red-100 text-red-800'
                                                    : log.result === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800'
                                                    : log.wasPaid ? 'bg-green-100 text-green-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {isError ? 'Không tìm thấy'
                                                    : log.result === 'CHECKED_IN' ? 'Check-in'
                                                    : log.wasPaid ? 'Đã TT' : 'Chưa TT'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
