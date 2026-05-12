import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Các path tài xế được phép truy cập (mọi path khác sẽ redirect về /driver)
const DRIVER_ALLOWED = [
    /^\/driver(\/.*)?$/,           // trang chính tài xế
    /^\/api\/driver(\/.*)?$/,      // API tài xế
    /^\/api\/auth(\/.*)?$/,        // NextAuth callbacks
    /^\/auth\/(login|logout|error)(\/.*)?$/, // login/logout
    /^\/api\/tong-hop\//,          // proxy gọi TongHop (vehicles, pickup-stations…)
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = await getToken({ req: request });

    // Tài xế chỉ được phép ở các route trong DRIVER_ALLOWED
    if (token?.role === 'DRIVER') {
        const isAllowed = DRIVER_ALLOWED.some(p => p.test(path));
        if (!isAllowed) {
            return NextResponse.redirect(new URL('/driver', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Match mọi request trừ static/_next/favicon (để middleware không can thiệp asset)
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp)).*)'],
};
