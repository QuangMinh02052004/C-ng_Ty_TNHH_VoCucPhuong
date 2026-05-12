'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [showEdit, setShowEdit] = useState(false);
    const [plateInput, setPlateInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Array<{ code: string; type?: string }>>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);

    const TONGHOP_URL = process.env.NEXT_PUBLIC_TONGHOP_URL || 'https://vocucphuongmanage.vercel.app';

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/driver');
        } else if (session && session.user.role !== 'DRIVER') {
            router.push('/');
        }
    }, [status, session, router]);

    // Tự bật modal + fetch danh sách xe nếu tài xế chưa có biển số
    useEffect(() => {
        if (session?.user?.role === 'DRIVER' && !session.user.vehiclePlate) {
            openEdit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.role, session?.user?.vehiclePlate]);

    const openEdit = () => {
        setPlateInput(session?.user?.vehiclePlate || '');
        setError(null);
        setShowEdit(true);
        // Fetch danh sách xe từ TongHop
        setLoadingVehicles(true);
        fetch(`${TONGHOP_URL}/api/tong-hop/vehicles`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setVehicles(data);
            })
            .catch(() => { /* fallback: cho phép gõ tay */ })
            .finally(() => setLoadingVehicles(false));
    };

    const handleSave = async () => {
        const plate = plateInput.trim().toUpperCase();
        if (!plate) {
            setError('Vui lòng nhập biển số xe');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/driver/me/vehicle', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehiclePlate: plate }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lưu thất bại');
            // Refresh session JWT
            await update({ vehiclePlate: data.vehiclePlate });
            setShowEdit(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi không xác định');
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (session.user.role !== 'DRIVER') return null;

    const isScanPage = pathname === '/driver';
    const isHistoryPage = pathname === '/driver/history';
    const plate = session.user.vehiclePlate;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="px-4 py-3 flex items-center justify-between max-w-3xl mx-auto gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{session.user.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-gray-500">
                                Số xe:{' '}
                                <span className={`font-semibold ${plate ? 'text-gray-800' : 'text-amber-600'}`}>
                                    {plate || 'Chưa nhập'}
                                </span>
                            </p>
                            <button
                                onClick={openEdit}
                                className="text-[11px] px-2 py-0.5 bg-sky-50 border border-sky-200 text-sky-700 rounded hover:bg-sky-100"
                            >
                                Đổi xe
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-xs px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 shrink-0"
                    >
                        Đăng xuất
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full">{children}</main>

            <nav className="bg-white border-t border-gray-200 sticky bottom-0 z-30">
                <div className="grid grid-cols-2 max-w-3xl mx-auto">
                    <Link
                        href="/driver"
                        className={`text-center py-3 text-sm font-semibold ${isScanPage ? 'text-sky-700 border-t-2 border-sky-600 -mt-px' : 'text-gray-600'}`}
                    >
                        Quét vé
                    </Link>
                    <Link
                        href="/driver/history"
                        className={`text-center py-3 text-sm font-semibold ${isHistoryPage ? 'text-sky-700 border-t-2 border-sky-600 -mt-px' : 'text-gray-600'}`}
                    >
                        Lịch sử quét
                    </Link>
                </div>
            </nav>

            {/* Modal đổi biển số xe */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h3 className="text-base font-bold text-gray-900">
                                {plate ? 'Đổi biển số xe' : 'Nhập biển số xe hôm nay'}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Mỗi ngày hoặc khi đổi xe, vui lòng cập nhật để log đúng số xe đang chạy.
                            </p>
                        </div>
                        <div className="p-5 space-y-3">
                            <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold">
                                Chọn xe đang chạy
                            </label>
                            {loadingVehicles ? (
                                <div className="text-sm text-gray-500 py-2">Đang tải danh sách xe...</div>
                            ) : vehicles.length > 0 ? (
                                <select
                                    value={plateInput}
                                    onChange={e => setPlateInput(e.target.value.toUpperCase())}
                                    autoFocus
                                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded text-gray-900 uppercase tracking-wider font-semibold focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                >
                                    <option value="">-- Chọn biển số --</option>
                                    {vehicles.map(v => (
                                        <option key={v.code} value={v.code}>
                                            {v.code}{v.type ? ` — ${v.type}` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={plateInput}
                                        onChange={e => setPlateInput(e.target.value.toUpperCase())}
                                        placeholder="60S-086.12"
                                        autoFocus
                                        className="w-full px-3 py-2.5 text-base border border-gray-300 rounded text-gray-900 uppercase tracking-wider font-semibold focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    />
                                    <p className="text-[11px] text-gray-500">
                                        Chưa tải được danh sách xe từ Tổng Hợp, vui lòng nhập biển số xe đang chạy.
                                    </p>
                                </>
                            )}
                            {error && <p className="text-sm text-red-600">{error}</p>}
                        </div>
                        <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
                            {plate && (
                                <button
                                    onClick={() => setShowEdit(false)}
                                    disabled={saving}
                                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving || !plateInput.trim()}
                                className="px-4 py-1.5 text-sm text-white bg-sky-600 rounded hover:bg-sky-700 disabled:bg-sky-300"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
