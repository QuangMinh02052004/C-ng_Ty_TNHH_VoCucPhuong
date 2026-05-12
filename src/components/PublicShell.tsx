'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function PublicShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const isAdmin = pathname.startsWith('/admin');
    const isDriver = pathname.startsWith('/driver');

    // Trang admin và trang tài xế dùng layout riêng — không hiện Header/Footer công khai
    if (isAdmin || isDriver) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    );
}
