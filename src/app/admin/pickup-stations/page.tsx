'use client';

import { useEffect, useState, useMemo } from 'react';

const TONGHOP_URL = process.env.NEXT_PUBLIC_TONGHOP_URL || 'https://vocucphuongmanage.vercel.app';

interface Station {
    id: number;
    stt: string;
    sortOrder: number | string;
    name: string;
    aliases: string[];
    isActive: boolean;
}

type Direction = 'sg-lk' | 'lk-sg';

export default function PickupStationsAdmin() {
    const [direction, setDirection] = useState<Direction>('sg-lk');
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Station | null>(null);
    const [form, setForm] = useState({
        stt: '',
        sortOrder: '',
        name: '',
        aliasesText: '',
    });

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${TONGHOP_URL}/api/tong-hop/pickup-stations?direction=${direction}&activeOnly=false`,
                { cache: 'no-store' }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lỗi tải dữ liệu');
            setStations(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi không xác định');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [direction]);

    const resetForm = () => {
        setEditing(null);
        setForm({ stt: '', sortOrder: '', name: '', aliasesText: '' });
    };

    const startEdit = (s: Station) => {
        setEditing(s);
        setForm({
            stt: s.stt,
            sortOrder: String(s.sortOrder),
            name: s.name,
            aliasesText: (s.aliases || []).join(', '),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const payload = {
            stt: form.stt.trim(),
            sortOrder: parseFloat(form.sortOrder),
            name: form.name.trim(),
            aliases: form.aliasesText.split(',').map(s => s.trim()).filter(Boolean),
        };
        if (!payload.stt || !payload.name || Number.isNaN(payload.sortOrder)) {
            setError('Cần điền STT, thứ tự sắp xếp và Tên trạm');
            return;
        }
        try {
            const url = editing
                ? `${TONGHOP_URL}/api/tong-hop/pickup-stations/${editing.id}`
                : `${TONGHOP_URL}/api/tong-hop/pickup-stations`;
            const res = await fetch(url, {
                method: editing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lưu thất bại');
            resetForm();
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi không xác định');
        }
    };

    const toggleActive = async (s: Station) => {
        try {
            const res = await fetch(`${TONGHOP_URL}/api/tong-hop/pickup-stations/${s.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !s.isActive }),
            });
            if (!res.ok) throw new Error('Toggle thất bại');
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi không xác định');
        }
    };

    const remove = async (s: Station) => {
        if (!confirm(`Xóa trạm "${s.name}"? Hành động này không khôi phục được.`)) return;
        try {
            const res = await fetch(`${TONGHOP_URL}/api/tong-hop/pickup-stations/${s.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Xóa thất bại');
            }
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi không xác định');
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-5xl">
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Quản lý trạm đón dọc đường</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Danh sách trạm dùng chung cho cả 2 tuyến. Hệ thống tự đảo thứ tự khi khách chọn tuyến
                    Long Khánh → Sài Gòn. STT bên dưới là STT hiển thị theo hướng đang xem.
                </p>
            </div>

            {/* Tabs đảo chiều */}
            <div className="inline-flex bg-gray-100 rounded-md p-1 mb-5 text-sm">
                <button
                    onClick={() => setDirection('sg-lk')}
                    className={`px-3 py-1.5 rounded ${direction === 'sg-lk' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-600'}`}
                >
                    Sài Gòn → Long Khánh
                </button>
                <button
                    onClick={() => setDirection('lk-sg')}
                    className={`px-3 py-1.5 rounded ${direction === 'lk-sg' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-600'}`}
                >
                    Long Khánh → Sài Gòn
                </button>
            </div>

            {/* Form thêm / sửa */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">STT hiển thị</label>
                    <input
                        type="text"
                        value={form.stt}
                        onChange={e => setForm(f => ({ ...f, stt: e.target.value }))}
                        placeholder="vd. 7.1"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-900"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Thứ tự sắp xếp</label>
                    <input
                        type="number"
                        step="0.01"
                        value={form.sortOrder}
                        onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                        placeholder="vd. 7.1"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-900"
                    />
                </div>
                <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tên trạm</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="vd. Bưu điện Trảng Bom"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-900"
                    />
                </div>
                <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bí danh (cách nhau bằng dấu phẩy)</label>
                    <input
                        type="text"
                        value={form.aliasesText}
                        onChange={e => setForm(f => ({ ...f, aliasesText: e.target.value }))}
                        placeholder="bd tbom, tbom"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-900"
                    />
                </div>
                <div className="md:col-span-12 flex items-center gap-2">
                    <button type="submit" className="px-4 py-1.5 text-sm bg-sky-600 text-white rounded hover:bg-sky-700">
                        {editing ? 'Cập nhật' : 'Thêm trạm'}
                    </button>
                    {editing && (
                        <button type="button" onClick={resetForm} className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                            Hủy
                        </button>
                    )}
                    {error && <span className="text-sm text-red-600 ml-2">{error}</span>}
                </div>
            </form>

            {/* Bảng */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 w-20">STT hiển thị</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 w-20">Sort</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Tên trạm</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Bí danh</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 w-24">Trạng thái</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700 w-40">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Đang tải...</td></tr>
                        ) : stations.length === 0 ? (
                            <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Chưa có trạm</td></tr>
                        ) : (
                            stations.map((s: any) => (
                                <tr key={s.id} className={`border-b border-gray-100 ${!s.isActive ? 'bg-gray-50 text-gray-400' : ''}`}>
                                    <td className="px-3 py-2 font-mono">{s.displayStt}</td>
                                    <td className="px-3 py-2 text-gray-500">{s.sortOrder}</td>
                                    <td className="px-3 py-2 font-medium text-gray-900">{s.name}</td>
                                    <td className="px-3 py-2 text-xs text-gray-600">{(s.aliases || []).join(', ')}</td>
                                    <td className="px-3 py-2">
                                        <button
                                            onClick={() => toggleActive(s)}
                                            className={`text-xs px-2 py-0.5 rounded ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            {s.isActive ? 'Hoạt động' : 'Tắt'}
                                        </button>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button onClick={() => startEdit(s)} className="text-xs text-sky-700 hover:underline mr-3">Sửa</button>
                                        <button onClick={() => remove(s)} className="text-xs text-red-600 hover:underline">Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
