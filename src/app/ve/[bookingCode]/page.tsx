'use client'

import { useState, useEffect, useRef } from 'react'
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
  bus: { licensePlate: string; busType: string } | null
  status: string
  checkedIn: boolean
  checkedInAt: string | null
  qrCode: string | null
  payment: { method: string; status: string; paidAt: string | null } | null
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PAID:      { label: 'Đã thanh toán', bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-400' },
  CONFIRMED: { label: 'Đã xác nhận',  bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-400'  },
  PENDING:   { label: 'Chờ xác nhận', bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-400' },
  CANCELLED: { label: 'Đã hủy',       bg: 'bg-red-50',    text: 'text-red-700',   border: 'border-red-400'   },
  COMPLETED: { label: 'Hoàn thành',   bg: 'bg-gray-50',   text: 'text-gray-700',  border: 'border-gray-400'  },
}

export default function TicketPage() {
  const params = useParams()
  const bookingCode = params.bookingCode as string
  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ticketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bookingCode) fetchBooking()
  }, [bookingCode])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/bookings/${bookingCode}`)
      if (!res.ok) throw new Error(res.status === 404 ? 'Không tìm thấy vé' : 'Lỗi tải vé')
      const data = await res.json()
      setBooking(data.booking)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    window.print()
  }

  const fmtDate = (d: string) => {
    try {
      const dt = new Date(d)
      return dt.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch { return d }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Đang tải vé...</p>
      </div>
    </div>
  )

  if (error || !booking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy vé</h2>
        <p className="text-gray-500 text-sm mb-5">{error}</p>
        <a href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm">
          Về trang chủ
        </a>
      </div>
    </div>
  )

  const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #ticket-print, #ticket-print * { visibility: visible !important; }
          #ticket-print {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100% !important; max-width: none !important;
            box-shadow: none !important; border-radius: 0 !important;
            margin: 0 !important; padding: 16px !important;
          }
          .no-print { display: none !important; }
          @page { size: A5 portrait; margin: 8mm; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 py-6 px-4">
        {/* Action buttons */}
        <div className="max-w-md mx-auto mb-4 flex gap-3 no-print">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tải / In vé
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(booking.bookingCode); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Sao chép mã
          </button>
        </div>

        {/* Ticket */}
        <div id="ticket-print" ref={ticketRef} className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Company Header */}
          <div className="bg-blue-600 text-white px-5 py-4 text-center">
            <p className="font-bold text-lg tracking-wide">CÔNG TY TNHH VÕ CÚC PHƯƠNG</p>
            <p className="text-blue-200 text-xs mt-0.5">Hotline: 02519 999 975</p>
          </div>

          {/* Route banner */}
          <div className="bg-blue-50 px-5 py-3 flex items-center justify-between border-b border-blue-100">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Điểm đi</p>
              <p className="font-bold text-gray-900 text-base">{booking.route.from}</p>
            </div>
            <div className="px-3 text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Điểm đến</p>
              <p className="font-bold text-gray-900 text-base">{booking.route.to}</p>
            </div>
          </div>

          {/* Ticket body */}
          <div className="px-5 py-4">
            {/* Code + Status */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400">Mã vé</p>
                <p className="font-bold text-gray-900 font-mono text-base">{booking.bookingCode}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                  {st.label}
                </span>
                {booking.checkedIn && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Đã lên xe
                  </span>
                )}
              </div>
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-xl p-3">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-0.5">Ngày đi</p>
                <p className="font-bold text-gray-900 text-sm">{fmtDate(booking.date)}</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-xs text-gray-400 mb-0.5">Giờ</p>
                <p className="font-bold text-blue-600 text-lg">{booking.departureTime}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-0.5">Ghế</p>
                <p className="font-bold text-gray-900 text-sm">{booking.seats} ghế</p>
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dashed border-gray-200">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                {booking.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{booking.customerName}</p>
                <p className="text-sm text-gray-500">{booking.customerPhone}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-400">Tổng tiền</p>
                <p className="font-bold text-blue-600 text-lg">{booking.totalPrice.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center pb-3">
              <p className="text-xs text-gray-400 mb-3">Quét mã khi lên xe</p>
              {booking.qrCode ? (
                <Image
                  src={booking.qrCode}
                  alt="QR vé xe"
                  width={160}
                  height={160}
                  className="mx-auto border-4 border-white shadow-md rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <span className="text-xs text-gray-400 text-center px-3">{booking.bookingCode}</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Xuất trình cho nhân viên khi lên xe</p>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-amber-50 border-t border-amber-100 px-5 py-3">
            <p className="text-xs text-amber-800 font-semibold mb-1">Lưu ý:</p>
            <ul className="text-xs text-amber-700 space-y-0.5">
              <li>• Có mặt tại bến <strong>trước 15 phút</strong> so với giờ xuất bến</li>
              <li>• Mang theo CMND/CCCD khi lên xe</li>
              <li>• Liên hệ hotline <strong>02519 999 975</strong> nếu cần hỗ trợ</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
