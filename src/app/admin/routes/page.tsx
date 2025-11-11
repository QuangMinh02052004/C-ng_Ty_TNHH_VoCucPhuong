"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import RouteMapVisualization from '@/components/admin/RouteMapVisualization'

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

  const handleDelete = async (routeId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tuyến đường này?')) return

    try {
      const response = await fetch(`/api/admin/routes/${routeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete route')

      alert('Xóa tuyến đường thành công!')
      fetchRoutes()
    } catch (error) {
      console.error('Error deleting route:', error)
      alert('Không thể xóa tuyến đường')
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tuyến đường</h1>
          <p className="text-gray-600 mt-2">Quản lý các tuyến xe và lộ trình hình ảnh mô phỏng</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl hover:from-blue-700 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm tuyến đường
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Tổng tuyến</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-1">Tất cả tuyến đường</p>
            </div>
            <div className="w-14 h-14 bg-blue-200 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Hoạt động</p>
              <p className="text-4xl font-bold text-green-900 mt-2">{stats.active}</p>
              <p className="text-xs text-green-600 mt-1">Đang phục vụ</p>
            </div>
            <div className="w-14 h-14 bg-green-200 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Tạm ngừng</p>
              <p className="text-4xl font-bold text-red-900 mt-2">{stats.inactive}</p>
              <p className="text-xs text-red-600 mt-1">Không hoạt động</p>
            </div>
            <div className="w-14 h-14 bg-red-200 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl shadow-sm border border-sky-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sky-700 font-medium">Vé đã bán</p>
              <p className="text-4xl font-bold text-sky-900 mt-2">{stats.totalBookings}</p>
              <p className="text-xs text-sky-600 mt-1">Tổng số vé</p>
            </div>
            <div className="w-14 h-14 bg-sky-200 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
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
              placeholder="Tìm theo điểm đi, điểm đến, loại xe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm ngừng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoutes.map((route) => (
          <div key={route.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Map Visualization */}
            <RouteMapVisualization
              routeMapImage={route.routeMapImage || undefined}
              thumbnailImage={route.thumbnailImage || undefined}
              from={route.from}
              to={route.to}
              distance={route.distance || undefined}
              duration={route.duration}
            />

            {/* Route Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-blue-600">
                      {route.price.toLocaleString('vi-VN')} ₫
                    </h3>
                    {route.isActive ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-300">
                        ● Hoạt động
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-300">
                        ● Tạm ngừng
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {route.busType}
                  </p>
                </div>
              </div>

              {route.description && (
                <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {route.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-semibold">Giờ hoạt động</p>
                  <p className="font-bold text-blue-900 text-sm mt-1">{route.operatingStart} - {route.operatingEnd}</p>
                </div>
                <div className="bg-sky-50 p-3 rounded-lg">
                  <p className="text-xs text-sky-600 font-semibold">Khoảng cách chuyến</p>
                  <p className="font-bold text-sky-900 text-sm mt-1">{route.intervalMinutes} phút</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold">Số vé đã đặt</p>
                  <p className="font-bold text-green-900 text-sm mt-1">{route._count?.bookings || 0} vé</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600 font-semibold">Lịch trình</p>
                  <p className="font-bold text-purple-900 text-sm mt-1">{route._count?.schedules || 0} chuyến</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => openEditModal(route)}
                  className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Sửa
                </button>
                <button
                  onClick={() => toggleStatus(route)}
                  className={`flex-1 px-4 py-2.5 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                    route.isActive
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {route.isActive ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tạm ngừng
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kích hoạt
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(route.id)}
                  className="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="mt-6 text-gray-500 text-lg font-medium">Không tìm thấy tuyến đường nào</p>
          <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc thêm tuyến đường mới</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-sky-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {isEditing ? '✏️ Chỉnh sửa tuyến đường' : '➕ Thêm tuyến đường mới'}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {isEditing ? 'Cập nhật thông tin tuyến đường' : 'Điền thông tin để tạo tuyến mới'}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📍</span>
                  Thông tin cơ bản
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Điểm đi *
                    </label>
                    <input
                      type="text"
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Hà Nội"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Điểm đến *
                    </label>
                    <input
                      type="text"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Cúc Phương"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá vé (VNĐ) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: 150000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thời gian *
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: 2h 30p"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loại xe *
                    </label>
                    <input
                      type="text"
                      value={formData.busType}
                      onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Limousine 16 chỗ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Khoảng cách
                    </label>
                    <input
                      type="text"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: 120km"
                    />
                  </div>
                </div>
              </div>

              {/* Hình ảnh lộ trình */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">🖼️</span>
                  Hình ảnh lộ trình
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL Hình ảnh bản đồ lộ trình
                    </label>
                    <input
                      type="text"
                      value={formData.routeMapImage}
                      onChange={(e) => setFormData({ ...formData, routeMapImage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/route-map.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Nhập URL hình ảnh mô phỏng lộ trình (Google Maps screenshot, bản đồ tự vẽ, v.v.)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL Hình ảnh thu nhỏ (Thumbnail)
                    </label>
                    <input
                      type="text"
                      value={formData.thumbnailImage}
                      onChange={(e) => setFormData({ ...formData, thumbnailImage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>

                  {/* Preview */}
                  {formData.routeMapImage && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Xem trước:</p>
                      <RouteMapVisualization
                        routeMapImage={formData.routeMapImage}
                        thumbnailImage={formData.thumbnailImage}
                        from={formData.from || 'Điểm đi'}
                        to={formData.to || 'Điểm đến'}
                        distance={formData.distance}
                        duration={formData.duration || '0h 0p'}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Giờ hoạt động */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">⏰</span>
                  Giờ hoạt động
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giờ bắt đầu *
                    </label>
                    <input
                      type="time"
                      value={formData.operatingStart}
                      onChange={(e) => setFormData({ ...formData, operatingStart: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giờ kết thúc *
                    </label>
                    <input
                      type="time"
                      value={formData.operatingEnd}
                      onChange={(e) => setFormData({ ...formData, operatingEnd: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Khoảng cách (phút) *
                    </label>
                    <input
                      type="number"
                      value={formData.intervalMinutes}
                      onChange={(e) => setFormData({ ...formData, intervalMinutes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: 30"
                    />
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mô tả chi tiết về tuyến đường, các điểm dừng, tiện nghi..."
                />
              </div>

              {/* Trạng thái */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  ✅ Tuyến đường đang hoạt động
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl hover:from-blue-700 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50"
              >
                {uploading ? 'Đang xử lý...' : (isEditing ? '💾 Cập nhật' : '➕ Tạo mới')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
