// Middleware tạm thời disable để debug
// TODO: Re-enable sau khi fix session role

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Tạm thời cho phép tất cả - không check auth
    return NextResponse.next();
}

export const config = {
    matcher: [],
};
