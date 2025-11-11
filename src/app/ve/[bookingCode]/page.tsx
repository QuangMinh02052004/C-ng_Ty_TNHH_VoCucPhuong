"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface BookingInfo {
  bookingCode: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  route: {
    from: string
    to: string
    duration: string
    busType: string
    distance: string | null
  }
  date: string
  departureTime: string
  seats: number
  totalPrice: number
  bus: {
    licensePlate: string
    busType: string
  } | null
  status: string
  checkedIn: boolean
  checkedInAt: string | null
  qrCode: string | null
  payment: {
    method: string
    status: string
    paidAt: string | null
  } | null
  createdAt: string
}

export default function TicketViewPage() {
  const params = useParams()
  const bookingCode = params.bookingCode as string
  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingCode) {
      fetchBooking()
    }
  }, [bookingCode])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/bookings/${bookingCode}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy vé với mã này')
        }
        throw new Error('Lỗi khi tải thông tin vé')
      }

      const data = await response.json()
      setBooking(data.booking)
    } catch (err: any) {
      console.error('Error fetching booking:', err)
      setError(err.message || 'Không thể tải thông tin vé')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-300'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán'
      case 'CONFIRMED': return 'Đã xác nhận'
      case 'PENDING': return 'Chờ thanh toán'
      case 'CANCELLED': return 'Đã hủy'
      case 'COMPLETED': return 'Hoàn thành'
      default: return status
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'Tiền mặt'
      case 'BANK_TRANSFER': return 'Chuyển khoản'
      case 'QRCODE': return 'QR Code'
      case 'VNPAY': return 'VNPay'
      case 'MOMO': return 'MoMo'
      default: return method
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin vé...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy vé</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin vé xe</h1>
          <p className="text-gray-600">Mã vé: <span className="font-bold text-blue-600">{booking.bookingCode}</span></p>
        </div>

        {/* Main Ticket Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          {/* Route Header */}
          <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm opacity-90 mb-1">Điểm đi</p>
                <p className="text-2xl font-bold">{booking.route.from}</p>
              </div>
              <div className="px-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm opacity-90 mb-1">Điểm đến</p>
                <p className="text-2xl font-bold">{booking.route.to}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm opacity-90">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {booking.route.duration}
              </span>
              {booking.route.distance && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {booking.route.distance}
                </span>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
              {booking.checkedIn && (
                <span className="flex items-center gap-2 text-green-600 font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Đã check-in
                </span>
              )}
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-600 font-semibold mb-1">Họ và tên</p>
                <p className="text-lg font-bold text-gray-900">{booking.customerName}</p>
              </div>
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                <p className="text-sm text-sky-600 font-semibold mb-1">Số điện thoại</p>
                <p className="text-lg font-bold text-gray-900">{booking.customerPhone}</p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Ngày đi</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(booking.date).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Giờ xuất bến</p>
                <p className="text-lg font-bold text-gray-900">{booking.departureTime}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Số ghế</p>
                <p className="text-lg font-bold text-gray-900">{booking.seats} ghế</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Loại xe</p>
                <p className="text-lg font-bold text-gray-900">{booking.route.busType}</p>
              </div>
            </div>

            {/* Bus Info */}
            {booking.bus && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Thông tin xe</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{booking.bus.licensePlate}</p>
                    <p className="text-sm text-gray-600">{booking.bus.busType}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between">
                <p className="text-lg text-green-700 font-semibold">Tổng tiền</p>
                <p className="text-3xl font-bold text-green-600">
                  {booking.totalPrice.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              {booking.payment && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">Phương thức: {getPaymentMethodLabel(booking.payment.method)}</span>
                    {booking.payment.status === 'COMPLETED' && (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Đã thanh toán
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code */}
            {booking.qrCode && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                <p className="text-sm text-gray-600 font-semibold mb-4">Mã QR check-in</p>
                <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                  <Image
                    src={booking.qrCode}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Xuất trình mã này khi lên xe để check-in
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Đã đặt vé lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/"
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
            >
              Về trang chủ
            </a>
            <a
              href={`tel:${booking.customerPhone}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
