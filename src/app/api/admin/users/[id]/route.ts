import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRepository } from '@/lib/repositories/user-repository'

// PATCH: Cập nhật role của user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Kiểm tra xác thực
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Chỉ ADMIN mới được cập nhật role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const { role } = await request.json()

    // Validate role
    if (!['USER', 'STAFF', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Không cho phép tự thay đổi role của chính mình
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Cập nhật role
    const user = await UserRepository.update(id, { role });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Xóa user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Kiểm tra xác thực
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Chỉ ADMIN mới được xóa user
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    // Không cho phép tự xóa chính mình
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    // Kiểm tra xem user có bookings không
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userWithBookings = await UserRepository.findByIdWithBookingCount(id) as any;

    if (!userWithBookings) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userWithBookings._count?.bookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing bookings' },
        { status: 400 }
      )
    }

    // Xóa user
    await UserRepository.delete(id);

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
