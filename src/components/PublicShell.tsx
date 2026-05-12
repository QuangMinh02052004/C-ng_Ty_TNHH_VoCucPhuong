'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function PublicShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const router = useRouter();
    const { data: session } = useSession();

    const isAdmin = pathname.startsWith('/admin');
    const isDriver = pathname.startsWith('/driver');
    const isAuth = pathname.startsWith('/auth/');

    // Belt-and-suspenders: nếu tài xế bằng cách nào đó vào được trang ngoài /driver,
    // redirect về /driver. Middleware là tuyến bảo vệ đầu, đây là backup.
    useEffect(() => {
        if (
            session?.user?.role === 'DRIVER' &&
            !isDriver &&
            !isAuth &&
            !pathname.startsWith('/api/')
        ) {
            router.replace('/driver');
        }
    }, [session, pathname, isDriver, isAuth, router]);

    // Trang admin và trang tài xế dùng layout riêng — không hiện Header/Footer công khai
    if (isAdmin || isDriver) {
        return <>{children}</>;
    }

    // Nếu là DRIVER + đang ở trang công khai → hiện placeholder trong lúc redirect
    if (session?.user?.role === 'DRIVER' && !isAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
                    <p className="text-gray-600 text-sm">Chuyển hướng về giao diện tài xế...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    );
}
