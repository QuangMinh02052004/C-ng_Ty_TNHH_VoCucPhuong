"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'USER' | 'STAFF' | 'ADMIN'
  createdAt: string
  emailVerified: string | null
  _count?: {
    bookings: number
  }
}

export default function UsersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<'USER' | 'STAFF' | 'ADMIN'>('USER')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '', role: 'STAFF' as 'USER' | 'STAFF' | 'ADMIN' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/dang-nhap'); return }
    if (session.user.role !== 'ADMIN') { router.push('/admin'); return }
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editingRole })
      })
      if (!response.ok) throw new Error('Failed to update role')
      alert('Cập nhật vai trò thành công')
      setShowModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Không thể cập nhật vai trò')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete user')
      alert('Xóa người dùng thành công')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Không thể xóa người dùng')
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditingRole(user.role)
    setShowModal(true)
  }

  const handleCreateUser = async () => {
    setCreateError(null)
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setCreateError('Vui lòng điền đầy đủ tên, email và mật khẩu')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error || 'Lỗi tạo tài khoản'); return }
      setShowCreateModal(false)
      setCreateForm({ name: '', email: '', phone: '', password: '', role: 'STAFF' })
      fetchUsers()
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery))
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    staff: users.filter(u => u.role === 'STAFF').length,
    users: users.filter(u => u.role === 'USER').length
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên'
      case 'STAFF': return 'Nhân viên'
      case 'USER': return 'Khách hàng'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-600 mt-0.5">Tài khoản và phân quyền</p>
        </div>
        <button
          onClick={() => { setCreateError(null); setCreateForm({ name: '', email: '', phone: '', password: '', role: 'STAFF' }); setShowCreateModal(true); }}
          className="px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800"
        >
          Tạo tài khoản
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-600">Tổng người dùng</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-600">Quản trị viên</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{stats.admins}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-600">Nhân viên</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{stats.staff}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-600">Khách hàng</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{stats.users}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">Vai trò</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="ALL">Tất cả</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="STAFF">Nhân viên</option>
              <option value="USER">Khách hàng</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs text-gray-700">
              <th className="px-3 py-2 font-medium">Họ tên</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Số điện thoại</th>
              <th className="px-3 py-2 font-medium">Vai trò</th>
              <th className="px-3 py-2 font-medium text-right">Số vé</th>
              <th className="px-3 py-2 font-medium">Ngày tạo</th>
              <th className="px-3 py-2 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-900">{user.name}</td>
                <td className="px-3 py-2 text-gray-700">{user.email}</td>
                <td className="px-3 py-2 text-gray-700">{user.phone || '-'}</td>
                <td className="px-3 py-2 text-gray-700">{getRoleLabel(user.role)}</td>
                <td className="px-3 py-2 text-gray-700 text-right">{user._count?.bookings || 0}</td>
                <td className="px-3 py-2 text-gray-600 text-xs">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => openEditModal(user)}
                    className="px-2 py-1 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-100 mr-1"
                  >
                    Sửa
                  </button>
                  {session?.user.id !== user.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-2 py-1 text-xs text-red-700 border border-red-300 rounded hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow border border-gray-200 max-w-md w-full mx-4">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Tạo tài khoản mới</h3>
            </div>

            <div className="p-4 space-y-3">
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">{createError}</div>
              )}

              <div>
                <label className="block text-xs text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@vocucphuong.com"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0901234567"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Mật khẩu *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Vai trò</label>
                <select
                  value={createForm.role}
                  onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as any }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="USER">Khách hàng</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="px-3 py-1.5 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow border border-gray-200 max-w-md w-full mx-4">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Chỉnh sửa vai trò</h3>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Người dùng</p>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-2">Vai trò mới</label>
                <div className="space-y-1.5">
                  {[
                    { value: 'USER', label: 'Khách hàng', desc: 'Quyền cơ bản, đặt vé và quản lý booking' },
                    { value: 'STAFF', label: 'Nhân viên', desc: 'Quản lý vé, thanh toán, check-in' },
                    { value: 'ADMIN', label: 'Quản trị viên', desc: 'Toàn quyền quản lý hệ thống' }
                  ].map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-start gap-2 p-2 rounded border cursor-pointer ${
                        editingRole === role.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={role.value}
                        checked={editingRole === role.value}
                        onChange={(e) => setEditingRole(e.target.value as 'USER' | 'STAFF' | 'ADMIN')}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{role.label}</div>
                        <p className="text-xs text-gray-600">{role.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-3 py-1.5 text-sm text-white bg-gray-900 rounded hover:bg-gray-800"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
