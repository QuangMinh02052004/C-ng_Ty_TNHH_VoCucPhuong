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
                <p className="text-gray-600 text-sm">Đang tải...</p>
            </div>
        );
    }

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-200 z-20 overflow-y-auto ${
                    sidebarOpen ? 'w-56' : 'w-14'
                }`}
            >
                <div className="p-3">
                    <div className="flex items-center justify-between mb-4">
                        {sidebarOpen && <h1 className="text-sm font-semibold text-gray-900">Quản trị</h1>}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>
                    </div>

                    <nav className="space-y-0.5">
                        <Link href="/admin" className="block px-2 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100">
                            {sidebarOpen ? 'Dashboard' : 'D'}
                        </Link>
                        <Link href="/admin/bookings" className="block px-2 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100">
                            {sidebarOpen ? 'Quản lý vé' : 'V'}
                        </Link>
                        <Link href="/admin/payments" className="block px-2 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100">
                            {sidebarOpen ? 'Thanh toán' : 'T'}
                        </Link>
                        <Link href="/admin/routes" className="block px-2 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100">
                            {sidebarOpen ? 'Tuyến đường' : 'R'}
                        </Link>
                        <Link href="/admin/users" className="block px-2 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100">
                            {sidebarOpen ? 'Người dùng' : 'U'}
                        </Link>
                        {session.user.role === 'ADMIN' && (
                            <Link href="/admin/settings" className="block px-2 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100">
                                {sidebarOpen ? 'Cài đặt' : 'S'}
                            </Link>
                        )}

                        <div className="border-t border-gray-200 my-2"></div>

                        <Link href="/" className="block px-2 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100">
                            {sidebarOpen ? 'Về trang chủ' : 'H'}
                        </Link>
                    </nav>
                </div>
            </aside>

            <div className={`transition-all duration-200 ${sidebarOpen ? 'ml-56' : 'ml-14'}`}>
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-4 py-2 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Xe Võ Cúc Phương</h2>
                            <p className="text-xs text-gray-500">Quản trị hệ thống</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm text-gray-900">{session.user.name}</p>
                                <p className="text-xs text-gray-500">{session.user.role}</p>
                            </div>
                            <Link
                                href="/api/auth/signout"
                                className="px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Đăng xuất
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="p-4">{children}</main>
            </div>
        </div>
    );
}
