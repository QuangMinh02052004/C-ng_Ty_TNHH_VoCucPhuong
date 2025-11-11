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

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/dang-nhap')
      return
    }

    // Chỉ ADMIN mới được quản lý users
    if (session.user.role !== 'ADMIN') {
      router.push('/admin')
      return
    }

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

      alert('Cập nhật vai trò thành công!')
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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete user')

      alert('Xóa người dùng thành công!')
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

  // Lọc users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery))

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Thống kê
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    staff: users.filter(u => u.role === 'STAFF').length,
    users: users.filter(u => u.role === 'USER').length
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700 border-red-300'
      case 'STAFF': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'USER': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên'
      case 'STAFF': return 'Nhân viên'
      case 'USER': return 'Khách hàng'
      default: return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑'
      case 'STAFF': return '💼'
      case 'USER': return '👤'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-2">Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Tổng người dùng</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-1">Tất cả tài khoản</p>
            </div>
            <div className="w-14 h-14 bg-blue-200 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Quản trị viên</p>
              <p className="text-4xl font-bold text-red-900 mt-2">{stats.admins}</p>
              <p className="text-xs text-red-600 mt-1">Quyền cao nhất</p>
            </div>
            <div className="w-14 h-14 bg-red-200 rounded-xl flex items-center justify-center text-3xl">
              👑
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl shadow-sm border border-sky-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sky-700 font-medium">Nhân viên</p>
              <p className="text-4xl font-bold text-sky-900 mt-2">{stats.staff}</p>
              <p className="text-xs text-sky-600 mt-1">Quản lý vé & thanh toán</p>
            </div>
            <div className="w-14 h-14 bg-sky-200 rounded-xl flex items-center justify-center text-3xl">
              💼
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Khách hàng</p>
              <p className="text-4xl font-bold text-green-900 mt-2">{stats.users}</p>
              <p className="text-xs text-green-600 mt-1">Người dùng thường</p>
            </div>
            <div className="w-14 h-14 bg-green-200 rounded-xl flex items-center justify-center text-3xl">
              👤
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 Vai trò
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="ALL">Tất cả</option>
              <option value="ADMIN">👑 Quản trị viên</option>
              <option value="STAFF">💼 Nhân viên</option>
              <option value="USER">👤 Khách hàng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
            {/* Header with role color */}
            <div className={`h-24 bg-gradient-to-br ${
              user.role === 'ADMIN' ? 'from-red-400 to-red-500' :
              user.role === 'STAFF' ? 'from-blue-400 to-sky-500' :
              'from-green-400 to-green-500'
            } relative`}>
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white">
                  <span className="text-5xl">{getRoleIcon(user.role)}</span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="pt-16 px-6 pb-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                  {user.emailVerified && (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Xác thực
                    </span>
                  )}
                </div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleIcon(user.role)} {getRoleLabel(user.role)}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <span className="font-semibold">{user._count?.bookings || 0} vé</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(user)}
                  className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Sửa
                </button>
                {session?.user.id !== user.id && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="mt-6 text-gray-500 text-lg font-medium">Không tìm thấy người dùng nào</p>
          <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
        </div>
      )}

      {/* Edit Role Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold">✏️ Chỉnh sửa vai trò</h3>
              <p className="text-blue-100 text-sm mt-1">Thay đổi quyền hạn của người dùng</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Người dùng</p>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-sky-500 rounded-lg flex items-center justify-center text-2xl">
                    {getRoleIcon(selectedUser.role)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Vai trò mới
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'USER', label: 'Khách hàng', icon: '👤', desc: 'Quyền cơ bản, đặt vé và quản lý booking' },
                    { value: 'STAFF', label: 'Nhân viên', icon: '💼', desc: 'Quản lý vé, thanh toán, check-in' },
                    { value: 'ADMIN', label: 'Quản trị viên', icon: '👑', desc: 'Toàn quyền quản lý hệ thống' }
                  ].map((role) => (
                    <label
                      key={role.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        editingRole === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={role.value}
                        checked={editingRole === role.value}
                        onChange={(e) => setEditingRole(e.target.value as 'USER' | 'STAFF' | 'ADMIN')}
                        className="mt-1 w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{role.icon}</span>
                          <span className="font-bold text-gray-900">{role.label}</span>
                        </div>
                        <p className="text-xs text-gray-600">{role.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl hover:from-blue-700 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                💾 Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
