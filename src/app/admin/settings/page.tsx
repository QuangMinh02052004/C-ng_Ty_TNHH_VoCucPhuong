'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [bookingEnabled, setBookingEnabled] = useState(true);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
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
                const res = await fetch('/api/admin/settings', { cache: 'no-store' });
                const json = await res.json();
                if (!res.ok || !json.success) throw new Error(json.error || 'Lỗi tải cài đặt');
                const s = json.settings || {};
                setBookingEnabled((s.booking_enabled ?? 'true') !== 'false');
                setMaintenanceMessage(
                    s.maintenance_message ??
                        'Hệ thống đặt vé online đang trong quá trình hoàn thiện. Vui lòng liên hệ hotline để đặt vé.'
                );
            } catch (e: any) {
                setError(e.message || 'Không tải được cài đặt');
            } finally {
                setLoading(false);
            }
        })();
    }, [status]);

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

    return (
        <div className="max-w-2xl">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Cài đặt hệ thống</h1>
            <p className="text-sm text-gray-500 mb-6">Bật/tắt tính năng đặt vé online cho khách hàng.</p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
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

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        {savedAt ? `Đã lưu lúc ${savedAt}` : ' '}
                    </div>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-md transition"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">💡 Lưu ý</h3>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                    <li>Khi tắt: trang /dat-ve hiển thị banner bảo trì, nút đặt vé bị vô hiệu hóa.</li>
                    <li>API <code>/api/bookings/create</code> trả về lỗi 503 với message tùy chỉnh ở trên.</li>
                    <li>Cài đặt này áp dụng ngay sau khi lưu, không cần deploy lại.</li>
                </ul>
            </div>
        </div>
    );
}
