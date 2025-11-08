import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;

        // Check if accessing admin routes
        if (pathname.startsWith('/admin')) {
            if (token?.role !== 'ADMIN' && token?.role !== 'STAFF') {
                return NextResponse.redirect(new URL('/auth/login?error=unauthorized', req.url));
            }
        }

        // Check if accessing staff routes
        if (pathname.startsWith('/staff')) {
            if (token?.role !== 'STAFF' && token?.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/auth/login?error=unauthorized', req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

// Specify which routes to protect
export const config = {
    matcher: [
        '/admin/:path*',
        '/staff/:path*',
        '/profile/:path*',
        '/my-bookings/:path*',
    ],
};
