import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRepository } from '@/lib/repositories/user-repository'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

let roleConstraintEnsured = false;

/**
 * Đảm bảo cột role chấp nhận DRIVER. Hệ thống NextAuth gốc tạo bảng users
 * với CHECK constraint chỉ cho 'USER' | 'STAFF' | 'ADMIN'.
 * Hàm này nới constraint để cho phép DRIVER. Idempotent + swallow errors.
 */
async function ensureRoleAllowsDriver() {
  if (roleConstraintEnsured) return;
  try {
    // Tìm tên constraint hiện có trên cột role (nếu có)
    const constraints = await query<{ constraint_name: string }>(
      `SELECT con.conname AS constraint_name
       FROM pg_constraint con
       JOIN pg_class rel ON rel.oid = con.conrelid
       WHERE rel.relname = 'users' AND con.contype = 'c'`,
      {}
    );
    for (const c of constraints) {
      try {
        await query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS "${c.constraint_name}"`, {});
      } catch { /* ignore */ }
    }
    // Tạo lại constraint cho phép 4 vai trò
    await query(
      `ALTER TABLE users ADD CONSTRAINT users_role_check
       CHECK (role IN ('USER', 'STAFF', 'ADMIN', 'DRIVER'))`,
      {}
    );
    roleConstraintEnsured = true;
  } catch (e) {
    console.error('[ensureRoleAllowsDriver]', e);
    // Không throw — caller sẽ thấy lỗi cụ thể nếu INSERT vẫn fail
  }
}

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

    const validRoles = ['USER', 'STAFF', 'ADMIN', 'DRIVER']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 })
    }

    // Kiểm tra email đã tồn tại chưa
    const existing = await UserRepository.findByEmail(email.trim().toLowerCase())
    if (existing) {
      return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Nếu tạo tài xế, đảm bảo CHECK constraint trên cột role cho phép DRIVER
    if (role === 'DRIVER') {
      await ensureRoleAllowsDriver()
    }

    const user = await UserRepository.create({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      phone: phone?.trim() || undefined,
      password: hashedPassword,
      role: role || 'USER',
    })

    // Tài xế tự nhập biển số xe khi đăng nhập

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    // Trả message chi tiết để dễ debug từ UI
    const message = error?.message || error?.detail || 'Lỗi tạo tài khoản'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
