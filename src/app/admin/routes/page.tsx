"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Route {
  id: string
  from: string
  to: string
  price: number
  duration: string
  busType: string
  distance: string | null
  description: string | null
  routeMapImage: string | null
  thumbnailImage: string | null
  operatingStart: string
  operatingEnd: string
  intervalMinutes: number
  isActive: boolean
  createdAt: string
  _count?: {
    bookings: number
    schedules: number
  }
}

export default function RoutesManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    price: '',
    duration: '',
    busType: '',
    distance: '',
    description: '',
    routeMapImage: '',
    thumbnailImage: '',
    operatingStart: '',
    operatingEnd: '',
    intervalMinutes: '30',
    isActive: true
  })

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/dang-nhap')
      return
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      router.push('/admin')
      return
    }

    fetchRoutes()
  }, [session, status, router])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/routes')
      if (!response.ok) throw new Error('Failed to fetch routes')

      const data = await response.json()
      setRoutes(data.routes)
    } catch (error) {
      console.error('Error fetching routes:', error)
      alert('Không thể tải danh sách tuyến đường')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setSelectedRoute(null)
    setIsEditing(false)
    setFormData({
      from: '',
      to: '',
      price: '',
      duration: '',
      busType: '',
      distance: '',
      description: '',
      routeMapImage: '',
      thumbnailImage: '',
      operatingStart: '',
      operatingEnd: '',
      intervalMinutes: '30',
      isActive: true
    })
    setShowModal(true)
  }

  const openEditModal = (route: Route) => {
    setSelectedRoute(route)
    setIsEditing(true)
    setFormData({
      from: route.from,
      to: route.to,
      price: route.price.toString(),
      duration: route.duration,
      busType: route.busType,
      distance: route.distance || '',
      description: route.description || '',
      routeMapImage: route.routeMapImage || '',
      thumbnailImage: route.thumbnailImage || '',
      operatingStart: route.operatingStart,
      operatingEnd: route.operatingEnd,
      intervalMinutes: route.intervalMinutes.toString(),
      isActive: route.isActive
    })
    setShowModal(true)
  }

  const handleImageUpload = async (file: File, type: 'map' | 'thumbnail') => {
    try {
      setUploading(true)

      // Tạo FormData để upload
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) throw new Error('Failed to upload image')

      const data = await response.json()

      // Cập nhật formData với URL hình ảnh
      if (type === 'map') {
        setFormData(prev => ({ ...prev, routeMapImage: data.url }))
      } else {
        setFormData(prev => ({ ...prev, thumbnailImage: data.url }))
      }

      alert('Upload hình ảnh thành công!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Không thể upload hình ảnh. Vui lòng nhập URL trực tiếp.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const url = isEditing ? `/api/admin/routes/${selectedRoute?.id}` : '/api/admin/routes'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          intervalMinutes: parseInt(formData.intervalMinutes),
          routeMapImage: formData.routeMapImage || null,
          thumbnailImage: formData.thumbnailImage || null
        })
      })

      if (!response.ok) throw new Error('Failed to save route')

      alert(isEditing ? 'Cập nhật tuyến đường thành công!' : 'Tạo tuyến đường thành công!')
      setShowModal(false)
      fetchRoutes()
    } catch (error) {
      console.error('Error saving route:', error)
      alert('Không thể lưu tuyến đường')
    }
  }

  const toggleStatus = async (route: Route) => {
    try {
      const response = await fetch(`/api/admin/routes/${route.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !route.isActive })
      })

      if (!response.ok) throw new Error('Failed to toggle status')

      fetchRoutes()
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Không thể thay đổi trạng thái')
    }
  }

  // Lọc routes
  const filteredRoutes = routes.filter(route => {
    const matchesSearch =
      route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.busType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && route.isActive) ||
      (statusFilter === 'INACTIVE' && !route.isActive)

    return matchesSearch && matchesStatus
  })

  // Thống kê
  const stats = {
    total: routes.length,
    active: routes.filter(r => r.isActive).length,
    inactive: routes.filter(r => !r.isActive).length,
    totalBookings: routes.reduce((sum, r) => sum + (r._count?.bookings || 0), 0)
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
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Quản lý tuyến đường</h1>
        <button
          onClick={openCreateModal}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Thêm tuyến
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-500">Tổng tuyến</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-500">Hoạt động</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-500">Tạm ngừng</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.inactive}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-500">Vé đã bán</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalBookings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Điểm đi, điểm đến, loại xe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm ngừng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="bg-white border border-gray-200 rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="text-left px-3 py-2 font-medium">Tuyến</th>
              <th className="text-left px-3 py-2 font-medium">Loại xe</th>
              <th className="text-right px-3 py-2 font-medium">Giá</th>
              <th className="text-left px-3 py-2 font-medium">Thời gian</th>
              <th className="text-left px-3 py-2 font-medium">Giờ chạy</th>
              <th className="text-center px-3 py-2 font-medium">Vé / Lịch</th>
              <th className="text-center px-3 py-2 font-medium">Trạng thái</th>
              <th className="text-right px-3 py-2 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map((route) => (
              <tr key={route.id} className="border-b border-gray-100">
                <td className="px-3 py-2 text-gray-900 font-medium">{route.from} → {route.to}</td>
                <td className="px-3 py-2 text-gray-700">{route.busType}</td>
                <td className="px-3 py-2 text-right text-gray-900">{route.price.toLocaleString('vi-VN')}₫</td>
                <td className="px-3 py-2 text-gray-700">{route.duration}</td>
                <td className="px-3 py-2 text-gray-700">{route.operatingStart}–{route.operatingEnd} ({route.intervalMinutes}p)</td>
                <td className="px-3 py-2 text-center text-gray-700">{route._count?.bookings || 0} / {route._count?.schedules || 0}</td>
                <td className="px-3 py-2 text-center">
                  <span className={route.isActive ? 'text-green-700' : 'text-gray-500'}>
                    {route.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => openEditModal(route)} className="px-2 py-1 text-blue-700 border border-blue-200 rounded mr-1 hover:bg-blue-50">Sửa</button>
                  <button onClick={() => toggleStatus(route)} className="px-2 py-1 text-gray-700 border border-gray-200 rounded hover:bg-gray-50">{route.isActive ? 'Tắt' : 'Bật'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRoutes.length === 0 && (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          Không tìm thấy tuyến đường nào
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white border border-gray-200 rounded shadow max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                {isEditing ? 'Chỉnh sửa tuyến đường' : 'Thêm tuyến đường'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-100">Thông tin cơ bản</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Điểm đi *</label>
                    <input
                      type="text"
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="VD: Hà Nội"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Điểm đến *</label>
                    <input
                      type="text"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="VD: Cúc Phương"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Giá vé (VNĐ) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="VD: 150000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Thời gian *</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="VD: 2h 30p"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Loại xe *</label>
                    <input
                      type="text"
                      value={formData.busType}
                      onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="VD: Limousine 16 chỗ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Khoảng cách</label>
                    <input
                      type="text"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="VD: 120km"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-100">Hình ảnh lộ trình</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">URL bản đồ lộ trình</label>
                    <input
                      type="text"
                      value={formData.routeMapImage}
                      onChange={(e) => setFormData({ ...formData, routeMapImage: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="https://example.com/route-map.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">URL ảnh thu nhỏ</label>
                    <input
                      type="text"
                      value={formData.thumbnailImage}
                      onChange={(e) => setFormData({ ...formData, thumbnailImage: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-100">Giờ hoạt động</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bắt đầu *</label>
                    <input
                      type="time"
                      value={formData.operatingStart}
                      onChange={(e) => setFormData({ ...formData, operatingStart: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Kết thúc *</label>
                    <input
                      type="time"
                      value={formData.operatingEnd}
                      onChange={(e) => setFormData({ ...formData, operatingEnd: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cách nhau (phút) *</label>
                    <input
                      type="number"
                      value={formData.intervalMinutes}
                      onChange={(e) => setFormData({ ...formData, intervalMinutes: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="VD: 30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Các điểm dừng, tiện nghi..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
                  Tuyến đang hoạt động
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 p-3 border-t border-gray-200 bg-white flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Tạo mới')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
