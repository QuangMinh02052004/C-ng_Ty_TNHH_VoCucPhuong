import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Only admin and staff can access
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Forbidden - Chỉ admin/staff có quyền xem danh sách vé' },
        { status: 403 }
      );
    }

    // Fetch all bookings with related data
    const bookings = await prisma.booking.findMany({
      include: {
        route: {
          select: {
            from: true,
            to: true,
            busType: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        bookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADMIN_BOOKINGS_ERROR]', error);
    return NextResponse.json(
      { error: 'Lỗi server khi tải danh sách vé' },
      { status: 500 }
    );
  }
}
