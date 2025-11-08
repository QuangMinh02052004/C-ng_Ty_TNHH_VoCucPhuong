'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/admin');
        } else if (session && session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
            router.push('/');
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">🚌</div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ${
                    sidebarOpen ? 'w-64' : 'w-20'
                }`}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-8">
                        {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded hover:bg-gray-800"
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                    </div>

                    <nav className="space-y-2">
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors"
                        >
                            <span className="text-xl">📊</span>
                            {sidebarOpen && <span>Dashboard</span>}
                        </Link>

                        <Link
                            href="/admin/bookings"
                            className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors"
                        >
                            <span className="text-xl">🎫</span>
                            {sidebarOpen && <span>Quản lý vé</span>}
                        </Link>

                        <Link
                            href="/admin/routes"
                            className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors"
                        >
                            <span className="text-xl">🚌</span>
                            {sidebarOpen && <span>Tuyến đường</span>}
                        </Link>

                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors"
                        >
                            <span className="text-xl">👥</span>
                            {sidebarOpen && <span>Người dùng</span>}
                        </Link>

                        {session.user.role === 'ADMIN' && (
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors"
                            >
                                <span className="text-xl">⚙️</span>
                                {sidebarOpen && <span>Cài đặt</span>}
                            </Link>
                        )}

                        <div className="border-t border-gray-700 my-4"></div>

                        <Link
                            href="/"
                            className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors"
                        >
                            <span className="text-xl">🏠</span>
                            {sidebarOpen && <span>Về trang chủ</span>}
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Top Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Xe Võ Cúc Phương</h2>
                            <p className="text-sm text-gray-600">Quản trị hệ thống</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
                                <p className="text-xs text-gray-500">{session.user.role}</p>
                            </div>

                            <Link
                                href="/api/auth/signout"
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                                Đăng xuất
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
