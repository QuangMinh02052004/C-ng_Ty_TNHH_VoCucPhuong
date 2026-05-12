import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Các path tài xế được phép truy cập (mọi path khác sẽ redirect về /driver)
const DRIVER_ALLOWED = [
    /^\/driver(\/.*)?$/,
    /^\/api\/driver(\/.*)?$/,
    /^\/api\/auth(\/.*)?$/,
    /^\/auth\/(login|logout|error)(\/.*)?$/,
    /^\/api\/tong-hop\//,
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Bỏ qua khi không có cookie để tránh thừa work
    const hasNextAuthCookie = request.cookies.getAll().some(c =>
        c.name.includes('next-auth.session-token')
    );
    if (!hasNextAuthCookie) {
        return NextResponse.next();
    }

    let token;
    try {
        token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: process.env.NODE_ENV === 'production',
        });
    } catch {
        return NextResponse.next();
    }

    if (token?.role === 'DRIVER') {
        const isAllowed = DRIVER_ALLOWED.some(p => p.test(path));
        if (!isAllowed) {
            return NextResponse.redirect(new URL('/driver', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match mọi path TRỪ next internal + static asset files
        '/((?!_next/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|css|js)$).*)',
    ],
};
