import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRepository } from '@/lib/repositories/user-repository'
import bcrypt from 'bcryptjs'

// GET: Lấy danh sách tất cả users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const users = await UserRepository.findAllWithBookingCount();
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Admin tạo tài khoản mới (STAFF/ADMIN/USER)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { email, name, phone, password, role } = await request.json()

    if (!email?.trim() || !name?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Email, tên và mật khẩu không được để trống' }, { status: 400 })
    }

    const validRoles = ['USER', 'STAFF', 'ADMIN']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 })
    }

    // Kiểm tra email đã tồn tại chưa
    const existing = await UserRepository.findByEmail(email.trim().toLowerCase())
    if (existing) {
      return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await UserRepository.create({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      phone: phone?.trim() || undefined,
      password: hashedPassword,
      role: role || 'USER',
    })

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
