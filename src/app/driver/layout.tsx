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
    const [search, setSearch] = useState('');

    const TONGHOP_URL = process.env.NEXT_PUBLIC_TONGHOP_URL || 'https://vocucphuongmanage.vercel.app';

    // Tự nhận diện biển số thật dù người nhập dữ liệu có nhầm code/type
    // Plate VN: bắt đầu 2 chữ số + chữ cái (vd "60B04669", "60S-086.12")
    const detectPlate = (v: { code: string; type?: string }) => {
        const isPlate = (s?: string) => !!s && /\d{2}\s?[A-Z]/i.test(s);
        if (isPlate(v.code)) return { plate: v.code.toUpperCase(), desc: v.type || '' };
        if (isPlate(v.type)) return { plate: (v.type as string).toUpperCase(), desc: v.code };
        return { plate: v.code.toUpperCase(), desc: v.type || '' };
    };

    const vehicleOptions = vehicles
        .map(v => detectPlate(v))
        .filter(o => /\d/.test(o.plate))  // tối thiểu phải có số trong "biển số"
        .filter((o, i, arr) => arr.findIndex(x => x.plate === o.plate) === i)  // unique
        .sort((a, b) => a.plate.localeCompare(b.plate));

    const filteredOptions = (() => {
        const q = search.trim().toLowerCase();
        if (!q) return vehicleOptions;
        return vehicleOptions.filter(o =>
            o.plate.toLowerCase().includes(q) || o.desc.toLowerCase().includes(q)
        );
    })();

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

                            {/* Ô đã chọn / nhập */}
                            <input
                                type="text"
                                value={plateInput}
                                onChange={e => setPlateInput(e.target.value.toUpperCase())}
                                placeholder="60S-086.12"
                                autoFocus
                                className="w-full px-3 py-2.5 text-base border border-gray-300 rounded text-gray-900 uppercase tracking-wider font-bold focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />

                            {loadingVehicles ? (
                                <div className="text-sm text-gray-500 py-2 text-center">Đang tải danh sách xe...</div>
                            ) : vehicleOptions.length > 0 ? (
                                <div>
                                    {/* Tìm kiếm */}
                                    <div className="relative mt-2">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="Tìm biển số..."
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Danh sách lựa chọn */}
                                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded divide-y divide-gray-100">
                                        {filteredOptions.length === 0 ? (
                                            <div className="text-sm text-gray-500 py-4 text-center">
                                                Không khớp xe nào với &quot;{search}&quot;
                                            </div>
                                        ) : (
                                            filteredOptions.map(o => (
                                                <button
                                                    key={o.plate}
                                                    type="button"
                                                    onClick={() => { setPlateInput(o.plate); setSearch(''); }}
                                                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                                        plateInput === o.plate
                                                            ? 'bg-sky-50 text-sky-800'
                                                            : 'hover:bg-gray-50 text-gray-800'
                                                    }`}
                                                >
                                                    <span className="font-mono font-bold tracking-wider">{o.plate}</span>
                                                    {o.desc && (
                                                        <span className="text-xs text-gray-500 ml-2">— {o.desc}</span>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        {vehicleOptions.length} xe trong hệ thống. Gõ để lọc nhanh.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-[11px] text-gray-500">
                                    Chưa có biển số xe nào trong hệ thống. Vui lòng liên hệ quản lý hoặc nhập tạm biển số ở ô trên.
                                </p>
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
