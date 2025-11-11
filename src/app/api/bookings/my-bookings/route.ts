import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Fetch user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        route: {
          select: {
            from: true,
            to: true,
            busType: true,
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
    console.error('[MY_BOOKINGS_ERROR]', error);
    return NextResponse.json(
      { error: 'Lỗi server khi tải danh sách vé' },
      { status: 500 }
    );
  }
}
