'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  date: string;
  departureTime: string;
  seats: number;
  totalPrice: number;
  status: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  qrCode: string | null;
  createdAt: string;
  route: {
    from: string;
    to: string;
    busType: string;
  };
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-bookings');
    }
  }, [status, router]);

  // Fetch user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bookings/my-bookings');

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách vé');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
    };

    const statusLabels: Record<string, string> = {
      PENDING: 'Chờ thanh toán',
      CONFIRMED: 'Đã xác nhận',
      PAID: 'Đã thanh toán',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vé của tôi</h1>
          <p className="mt-2 text-gray-600">
            Quản lý các vé xe đã đặt
          </p>
        </div>

        {/* Bookings Grid */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có vé nào
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa đặt vé xe nào. Hãy đặt vé ngay để không bỏ lỡ chuyến đi!
            </p>
            <button
              onClick={() => router.push('/dat-ve')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Đặt vé ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Mã vé</p>
                      <p className="text-lg font-bold text-gray-900">
                        {booking.bookingCode}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Route */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Điểm đi</p>
                        <p className="font-semibold text-gray-900">
                          {booking.route.from}
                        </p>
                      </div>
                      <div className="text-blue-600">→</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Điểm đến</p>
                        <p className="font-semibold text-gray-900">
                          {booking.route.to}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="mb-4 flex gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Ngày đi</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(booking.date)}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Giờ xuất bến</p>
                      <p className="font-medium text-gray-900">
                        {booking.departureTime}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mb-4 flex gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Số ghế</p>
                      <p className="font-medium text-gray-900">
                        {booking.seats} ghế
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Tổng tiền</p>
                      <p className="font-bold text-blue-600">
                        {formatPrice(booking.totalPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Check-in Status */}
                  {booking.checkedIn && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">
                            Đã check-in
                          </p>
                          <p className="text-xs text-green-600">
                            {booking.checkedInAt && formatDateTime(booking.checkedInAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Chi tiết vé
                  </h2>
                  <p className="text-gray-600">Mã vé: {selectedBooking.bookingCode}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Status */}
              <div className="mb-6">
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* QR Code */}
              {selectedBooking.qrCode && (
                <div className="mb-6 text-center">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 inline-block">
                    {selectedBooking.checkedIn ? (
                      <div className="relative">
                        <Image
                          src={selectedBooking.qrCode}
                          alt="QR Code"
                          width={200}
                          height={200}
                          className="opacity-30"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-500 text-white px-4 py-2 rounded-lg transform -rotate-12 shadow-lg">
                            <p className="font-bold">ĐÃ SỬ DỤNG</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={selectedBooking.qrCode}
                        alt="QR Code"
                        width={200}
                        height={200}
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    {selectedBooking.checkedIn
                      ? '⚠️ Vé này đã được check-in và không thể sử dụng lại'
                      : 'Xuất trình mã QR này khi lên xe'}
                  </p>
                </div>
              )}

              {/* Check-in Status */}
              {selectedBooking.checkedIn && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 text-2xl">✓</span>
                    <div>
                      <p className="font-semibold text-green-800 mb-1">
                        Vé đã được check-in
                      </p>
                      <p className="text-sm text-green-600">
                        Thời gian: {selectedBooking.checkedInAt && formatDateTime(selectedBooking.checkedInAt)}
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        Mã QR đã được vô hiệu hóa và không thể sử dụng lại.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Details */}
              <div className="space-y-4 mb-6">
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Thông tin chuyến đi
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tuyến đường:</span>
                      <span className="font-medium text-gray-900">
                        {selectedBooking.route.from} → {selectedBooking.route.to}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại xe:</span>
                      <span className="font-medium text-gray-900">
                        {selectedBooking.route.busType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày đi:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedBooking.date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giờ xuất bến:</span>
                      <span className="font-medium text-gray-900">
                        {selectedBooking.departureTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số ghế:</span>
                      <span className="font-medium text-gray-900">
                        {selectedBooking.seats} ghế
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="font-medium text-gray-900">
                        {selectedBooking.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-medium text-gray-900">
                        {selectedBooking.customerPhone}
                      </span>
                    </div>
                    {selectedBooking.customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">
                          {selectedBooking.customerEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Thanh toán
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(selectedBooking.totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thời gian đặt vé:</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(selectedBooking.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
