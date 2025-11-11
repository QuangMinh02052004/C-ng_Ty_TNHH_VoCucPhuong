import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH: Cập nhật role của user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Cập nhật role
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json({ user })
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
  { params }: { params: { id: string } }
) {
  try {
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
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    // Kiểm tra xem user có bookings không
    const userWithBookings = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!userWithBookings) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userWithBookings._count.bookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing bookings' },
        { status: 400 }
      )
    }

    // Xóa user
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
