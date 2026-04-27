import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RouteRepository } from '@/lib/repositories/route-repository'

// GET: Lấy danh sách tất cả routes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Kiểm tra xác thực
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Chỉ ADMIN và STAFF mới được xem
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Staff only' },
        { status: 403 }
      )
    }

    // Lấy danh sách routes với số lượng bookings và schedules
    const routes = await RouteRepository.findAllWithCounts();

    return NextResponse.json({ routes })
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Tạo route mới
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Kiểm tra xác thực
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Chỉ ADMIN và STAFF mới được tạo
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Forbidden - Admin or Staff only' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Validate dữ liệu bắt buộc
    if (!data.from || !data.to || !data.price || !data.duration || !data.busType || !data.operatingStart || !data.operatingEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Tạo route mới
    const route = await RouteRepository.create({
      from: data.from,
      to: data.to,
      price: data.price,
      duration: data.duration,
      busType: data.busType,
      distance: data.distance || null,
      description: data.description || null,
      routeMapImage: data.routeMapImage || null,
      thumbnailImage: data.thumbnailImage || null,
      images: null,
      fromLat: null,
      fromLng: null,
      toLat: null,
      toLng: null,
      operatingStart: data.operatingStart,
      operatingEnd: data.operatingEnd,
      intervalMinutes: data.intervalMinutes || 30,
      isActive: data.isActive !== undefined ? data.isActive : true
    });

    // Fire-and-forget reverse sync: tạo TH_Routes mirror
    const internalBase = process.env.VCP_INTERNAL_URL || 'https://vocucphuongmanage.vercel.app';
    fetch(`${internalBase}/api/admin/sync/routes`, {
      method: 'GET',
    }).catch(() => {});

    return NextResponse.json({ route }, { status: 201 })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
