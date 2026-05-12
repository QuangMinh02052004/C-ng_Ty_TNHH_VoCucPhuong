'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/driver');
        } else if (session && session.user.role !== 'DRIVER') {
            // Không phải tài xế → đẩy về trang chủ
            router.push('/');
        }
    }, [status, session, router]);

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="px-4 py-3 flex items-center justify-between max-w-3xl mx-auto">
                    <div>
                        <p className="text-sm font-bold text-gray-900">{session.user.name}</p>
                        <p className="text-xs text-gray-500">
                            Số xe: <span className="font-semibold text-gray-700">{session.user.vehiclePlate || 'Chưa gán'}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-xs px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
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
        </div>
    );
}
