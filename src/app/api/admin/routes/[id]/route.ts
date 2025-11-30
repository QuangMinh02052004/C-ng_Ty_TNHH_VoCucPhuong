import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RouteRepository } from '@/lib/repositories/route-repository'

// PATCH: Cập nhật route
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const route = await RouteRepository.update(id, updateData);

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const routeWithBookings = await RouteRepository.findByIdWithCounts(id);

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

    // Xóa route (hard delete sẽ xóa cả schedules nếu có CASCADE trong database)
    await RouteRepository.hardDelete(id);

    return NextResponse.json({ message: 'Route deleted successfully' })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
