'use client';

import { useEffect, useState } from 'react';

const TONGHOP_URL = process.env.NEXT_PUBLIC_TONGHOP_URL || 'https://vocucphuongmanage.vercel.app';

interface Vehicle {
    id: number;
    code: string;
    type: string;
}

export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Vehicle | null>(null);
    const [form, setForm] = useState({ code: '', type: 'Limousine 9 chỗ' });

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${TONGHOP_URL}/api/tong-hop/vehicles`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Lỗi tải xe');
            setVehicles(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setEditing(null);
        setForm({ code: '', type: 'Limousine 9 chỗ' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = form.code.trim().toUpperCase();
        const type = form.type.trim();
        if (!code) {
            setError('Vui lòng nhập biển số');
            return;
        }
        try {
            if (editing) {
                const res = await fetch(`${TONGHOP_URL}/api/tong-hop/vehicles/${editing.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, type }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');
            } else {
                const res = await fetch(`${TONGHOP_URL}/api/tong-hop/vehicles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, type }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Tạo thất bại');
            }
            resetForm();
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi');
        }
    };

    const remove = async (v: Vehicle) => {
        if (!confirm(`Xóa xe "${v.code}" (${v.type})?`)) return;
        try {
            const res = await fetch(`${TONGHOP_URL}/api/tong-hop/vehicles/${v.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Xóa thất bại');
            }
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Lỗi');
        }
    };

    const startEdit = (v: Vehicle) => {
        setEditing(v);
        setForm({ code: v.code, type: v.type || 'Limousine 9 chỗ' });
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl">
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Quản lý xe</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Danh sách xe dùng cho tài xế chọn khi quét vé. Dữ liệu lưu chung với hệ thống Tổng Hợp.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 mb-5 grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Biển số xe</label>
                    <input
                        type="text"
                        value={form.code}
                        onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                        placeholder="60S-086.12"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded uppercase tracking-wider font-semibold text-gray-900"
                    />
                </div>
                <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Loại xe</label>
                    <input
                        type="text"
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        placeholder="Limousine 9 chỗ"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-gray-900"
                    />
                </div>
                <div className="md:col-span-3 flex items-end gap-2">
                    <button type="submit" className="px-4 py-1.5 text-sm bg-sky-600 text-white rounded hover:bg-sky-700">
                        {editing ? 'Cập nhật' : 'Thêm xe'}
                    </button>
                    {editing && (
                        <button type="button" onClick={resetForm} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                            Hủy
                        </button>
                    )}
                </div>
                {error && <div className="md:col-span-12 text-sm text-red-600">{error}</div>}
            </form>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Biển số</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Loại xe</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700 w-40">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-500">Đang tải...</td></tr>
                        ) : vehicles.length === 0 ? (
                            <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-500">Chưa có xe nào</td></tr>
                        ) : vehicles.map(v => (
                            <tr key={v.id} className="border-b border-gray-100">
                                <td className="px-3 py-2 font-mono font-semibold text-gray-900">{v.code}</td>
                                <td className="px-3 py-2 text-gray-700">{v.type}</td>
                                <td className="px-3 py-2 text-right">
                                    <button onClick={() => startEdit(v)} className="text-xs text-sky-700 hover:underline mr-3">Sửa</button>
                                    <button onClick={() => remove(v)} className="text-xs text-red-600 hover:underline">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
