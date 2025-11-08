'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/profile');
        }
    }, [status, router]);

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

    if (!session) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">👤</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Tài khoản của tôi</h1>
                    <p className="text-gray-600">Quản lý thông tin cá nhân và vé đã đặt</p>
                </div>

                {/* Profile Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Thông tin cá nhân</h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                            <div className="text-2xl">👤</div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Họ và tên</p>
                                <p className="text-gray-800 font-medium">{session.user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                            <div className="text-2xl">📧</div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-800 font-medium">{session.user.email}</p>
                            </div>
                        </div>

                        {session.user.phone && (
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                <div className="text-2xl">📞</div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                    <p className="text-gray-800 font-medium">{session.user.phone}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <div className="text-2xl">🏷️</div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Vai trò</p>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                        session.user.role === 'ADMIN'
                                            ? 'bg-red-100 text-red-700'
                                            : session.user.role === 'STAFF'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {session.user.role === 'ADMIN'
                                        ? 'Quản trị viên'
                                        : session.user.role === 'STAFF'
                                        ? 'Nhân viên'
                                        : 'Khách hàng'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={() => alert('Chức năng đang được phát triển...')}
                            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                        >
                            Chỉnh sửa thông tin
                        </button>
                        <button
                            onClick={() => alert('Chức năng đang được phát triển...')}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Đổi mật khẩu
                        </button>
                    </div>
                </div>

                {/* My Bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Vé của tôi</h2>

                    <div className="text-center py-12 text-gray-500">
                        <div className="text-5xl mb-4">🎫</div>
                        <p className="mb-4">Bạn chưa có vé nào</p>
                        <Link
                            href="/dat-ve"
                            className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                        >
                            Đặt vé ngay
                        </Link>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Link
                        href="/dat-ve"
                        className="bg-sky-50 border border-sky-100 rounded-xl p-6 hover:bg-sky-100 transition-colors text-center"
                    >
                        <div className="text-3xl mb-2">🎫</div>
                        <p className="font-semibold text-gray-800">Đặt vé mới</p>
                    </Link>

                    <Link
                        href="/my-bookings"
                        className="bg-sky-50 border border-sky-100 rounded-xl p-6 hover:bg-sky-100 transition-colors text-center"
                    >
                        <div className="text-3xl mb-2">📋</div>
                        <p className="font-semibold text-gray-800">Lịch sử đặt vé</p>
                    </Link>

                    {(session.user.role === 'ADMIN' || session.user.role === 'STAFF') && (
                        <Link
                            href="/admin"
                            className="bg-red-50 border border-red-100 rounded-xl p-6 hover:bg-red-100 transition-colors text-center"
                        >
                            <div className="text-3xl mb-2">⚙️</div>
                            <p className="font-semibold text-gray-800">Quản trị</p>
                        </Link>
                    )}
                </div>

                {/* Sign Out */}
                <div className="text-center">
                    <button
                        onClick={handleSignOut}
                        className="text-red-600 hover:text-red-700 font-medium"
                    >
                        Đăng xuất
                    </button>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
