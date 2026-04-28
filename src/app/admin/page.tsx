'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        paidBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/stats');
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            } else {
                setError('Không thể tải thống kê');
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600 mt-0.5">Tổng quan hệ thống</p>
            </div>

            {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded p-3 animate-pulse">
                            <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white border border-gray-200 rounded p-3">
                            <p className="text-xs text-gray-600">Tổng vé</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">{stats.totalBookings}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded p-3">
                            <p className="text-xs text-gray-600">Chờ thanh toán</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">{stats.pendingBookings}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded p-3">
                            <p className="text-xs text-gray-600">Hoàn thành</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">{stats.completedBookings}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded p-3">
                            <p className="text-xs text-gray-600">Doanh thu</p>
                            <p className="text-xl font-semibold text-gray-900 mt-1">
                                {new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded p-3">
                        <h2 className="text-sm font-semibold text-gray-900 mb-2">Đặt vé gần đây</h2>
                        <p className="text-sm text-gray-500 py-6 text-center">Chức năng đang phát triển</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <a href="/admin/payments" className="bg-white border border-gray-200 rounded p-3 hover:bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-900">Thanh toán</h3>
                            <p className="text-xs text-gray-600 mt-0.5">Xác nhận thanh toán</p>
                            {stats.pendingBookings > 0 && (
                                <span className="inline-block mt-2 px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded">
                                    {stats.pendingBookings} chờ
                                </span>
                            )}
                        </a>
                        <a href="/admin/bookings" className="bg-white border border-gray-200 rounded p-3 hover:bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-900">Quản lý vé</h3>
                            <p className="text-xs text-gray-600 mt-0.5">Xem và quản lý vé</p>
                        </a>
                        <a href="/admin/routes" className="bg-white border border-gray-200 rounded p-3 hover:bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-900">Tuyến đường</h3>
                            <p className="text-xs text-gray-600 mt-0.5">Quản lý các tuyến xe</p>
                        </a>
                        <a href="/admin/users" className="bg-white border border-gray-200 rounded p-3 hover:bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-900">Người dùng</h3>
                            <p className="text-xs text-gray-600 mt-0.5">Quản lý tài khoản</p>
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
