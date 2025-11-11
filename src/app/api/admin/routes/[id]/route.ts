import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH: Cập nhật route
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

    // Chỉ ADMIN và STAFF mới được cập nhật
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Staff only' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Prepare update data
    const updateData: any = {}

    if (data.from !== undefined) updateData.from = data.from
    if (data.to !== undefined) updateData.to = data.to
    if (data.price !== undefined) updateData.price = data.price
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.busType !== undefined) updateData.busType = data.busType
    if (data.distance !== undefined) updateData.distance = data.distance || null
    if (data.description !== undefined) updateData.description = data.description || null
    if (data.routeMapImage !== undefined) updateData.routeMapImage = data.routeMapImage || null
    if (data.thumbnailImage !== undefined) updateData.thumbnailImage = data.thumbnailImage || null
    if (data.operatingStart !== undefined) updateData.operatingStart = data.operatingStart
    if (data.operatingEnd !== undefined) updateData.operatingEnd = data.operatingEnd
    if (data.intervalMinutes !== undefined) updateData.intervalMinutes = data.intervalMinutes
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // Cập nhật route
    const route = await prisma.route.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ route })
  } catch (error) {
    console.error('Error updating route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Xóa route
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

    // Chỉ ADMIN mới được xóa route
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    // Kiểm tra xem route có bookings không
    const routeWithBookings = await prisma.route.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            bookings: true,
            schedules: true
          }
        }
      }
    })

    if (!routeWithBookings) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    if (routeWithBookings._count.bookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete route with existing bookings. Please deactivate it instead.' },
        { status: 400 }
      )
    }

    // Xóa schedules trước
    if (routeWithBookings._count.schedules > 0) {
      await prisma.schedule.deleteMany({
        where: { routeId: params.id }
      })
    }

    // Xóa route
    await prisma.route.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Route deleted successfully' })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
