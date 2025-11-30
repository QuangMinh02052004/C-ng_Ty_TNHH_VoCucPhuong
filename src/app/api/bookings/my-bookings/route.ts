import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingRepository } from '@/lib/repositories/booking-repository';

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

    // Fetch user's bookings with route details
    const bookings = await BookingRepository.findAllWithDetails({
      userId: session.user.id,
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
