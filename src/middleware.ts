// Middleware hiện không cần làm gì — tài xế được tự do truy cập mọi trang,
// chỉ khi LOGIN mới redirect về /driver (xem auth/login/page.tsx).
// Public/admin guard đã có sẵn ở layout từng route.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: [],
};
