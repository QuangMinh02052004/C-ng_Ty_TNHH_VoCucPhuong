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
        // Fetch real stats from API
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
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-gray-600">Tổng quan hệ thống</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                            <div className="h-12 bg-gray-200 rounded mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">🎫</div>
                        <span className="text-xs text-gray-500">Tổng số</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.totalBookings}</h3>
                    <p className="text-sm text-gray-600">Vé đã đặt</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">⏳</div>
                        <span className="text-xs text-gray-500">Chờ xử lý</span>
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-600 mb-1">{stats.pendingBookings}</h3>
                    <p className="text-sm text-gray-600">Vé chờ thanh toán</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">✅</div>
                        <span className="text-xs text-gray-500">Hoàn thành</span>
                    </div>
                    <h3 className="text-2xl font-bold text-green-600 mb-1">{stats.completedBookings}</h3>
                    <p className="text-sm text-gray-600">Vé đã hoàn thành</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">💰</div>
                        <span className="text-xs text-gray-500">Doanh thu</span>
                    </div>
                    <h3 className="text-2xl font-bold text-sky-600 mb-1">
                        {(stats.totalRevenue / 1000000).toFixed(1)}M
                    </h3>
                    <p className="text-sm text-gray-600">Tổng doanh thu</p>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Đặt vé gần đây</h2>

                <div className="text-center py-12 text-gray-500">
                    <div className="text-5xl mb-4">📋</div>
                    <p>Chức năng đang được phát triển...</p>
                    <p className="text-sm mt-2">Vui lòng quay lại sau</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <a
                    href="/admin/payments"
                    className="bg-green-50 border border-green-200 rounded-xl p-6 hover:bg-green-100 transition-colors"
                >
                    <div className="text-3xl mb-3">💳</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Thanh toán</h3>
                    <p className="text-sm text-gray-600">Xác nhận thanh toán vé</p>
                    {stats.pendingBookings > 0 && (
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                            {stats.pendingBookings} chờ xử lý
                        </span>
                    )}
                </a>

                <a
                    href="/admin/bookings"
                    className="bg-sky-50 border border-sky-100 rounded-xl p-6 hover:bg-sky-100 transition-colors"
                >
                    <div className="text-3xl mb-3">🎫</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Quản lý vé</h3>
                    <p className="text-sm text-gray-600">Xem và quản lý tất cả vé đặt</p>
                </a>

                <a
                    href="/admin/routes"
                    className="bg-sky-50 border border-sky-100 rounded-xl p-6 hover:bg-sky-100 transition-colors"
                >
                    <div className="text-3xl mb-3">🚌</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tuyến đường</h3>
                    <p className="text-sm text-gray-600">Quản lý các tuyến xe</p>
                </a>

                <a
                    href="/admin/users"
                    className="bg-sky-50 border border-sky-100 rounded-xl p-6 hover:bg-sky-100 transition-colors"
                >
                    <div className="text-3xl mb-3">👥</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Người dùng</h3>
                    <p className="text-sm text-gray-600">Quản lý tài khoản người dùng</p>
                </a>
            </div>
                </>
            )}
        </div>
    );
}
