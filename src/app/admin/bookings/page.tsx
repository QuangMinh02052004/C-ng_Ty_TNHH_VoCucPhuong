'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  createdAt: string;
  route: {
    from: string;
    to: string;
  };
  user: {
    name: string;
    email: string;
  } | null;
}

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCheckedIn, setFilterCheckedIn] = useState('ALL');
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinCode, setCheckinCode] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [checkinSuccess, setCheckinSuccess] = useState<any | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Redirect if not admin/staff
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (
      status === 'authenticated' &&
      session?.user?.role !== 'ADMIN' &&
      session?.user?.role !== 'STAFF'
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/bookings');

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

    if (status === 'authenticated' && (session?.user?.role === 'ADMIN' || session?.user?.role === 'STAFF')) {
      fetchBookings();
    }
  }, [status, session]);

  const handleCheckin = async (bookingCode: string) => {
    try {
      setCheckinLoading(true);
      setCheckinError(null);
      setCheckinSuccess(null);

      const response = await fetch('/api/bookings/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCheckinError(data.error || 'Lỗi khi check-in');
        return;
      }

      setCheckinSuccess(data);
      setCheckinCode('');

      // Reload bookings
      const refreshResponse = await fetch('/api/admin/bookings');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setBookings(refreshData.bookings || []);
      }
    } catch (err: any) {
      setCheckinError(err.message || 'Lỗi khi check-in');
    } finally {
      setCheckinLoading(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) { videoRef.current.srcObject = null; }
    setCameraActive(false);
  }, []);

  // Gán stream vào video element SAU khi DOM đã render (cameraActive=true)
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});

      if (!('BarcodeDetector' in window)) return;
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue.trim();
            // Extract booking code nếu QR chứa URL (/ve/VCP...) hoặc dùng thẳng
            const urlMatch = raw.match(/\/ve\/(VCP[A-Z0-9]+)/i);
            const code = urlMatch ? urlMatch[1] : raw;
            stopCamera();
            setCheckinCode(code);
            handleCheckin(code);
          }
        } catch {}
      }, 600);
    }
    return () => {
      if (scanIntervalRef.current && !cameraActive) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setCameraActive(true); // trigger useEffect to attach stream after render
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Vui lòng cấp quyền truy cập camera trong cài đặt trình duyệt.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('Không tìm thấy camera trên thiết bị này.');
      } else {
        setCameraError('Không thể mở camera: ' + (err.message || err.name));
      }
    }
  };

  const closeCheckinModal = () => {
    stopCamera();
    setShowCheckinModal(false);
    setCheckinCode('');
    setCheckinError(null);
    setCheckinSuccess(null);
    setCameraError(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (searchCode && !booking.bookingCode.toLowerCase().includes(searchCode.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'ALL' && booking.status !== filterStatus) {
      return false;
    }
    if (filterCheckedIn === 'CHECKED_IN' && !booking.checkedIn) {
      return false;
    }
    if (filterCheckedIn === 'NOT_CHECKED_IN' && booking.checkedIn) {
      return false;
    }
    return true;
  });

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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý vé</h1>
          <p className="mt-2 text-gray-600">
            Xem danh sách vé đã đặt và thực hiện check-in
          </p>
        </div>

        {/* Check-in Button */}
        <div className="mb-6">
          <button
            onClick={() => { setCheckinSuccess(null); setCheckinError(null); setCheckinCode(''); setShowCheckinModal(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📱 Quét mã QR / Check-in vé
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm theo mã vé
              </label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã vé..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Chờ thanh toán</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <select
                value={filterCheckedIn}
                onChange={(e) => setFilterCheckedIn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Tất cả</option>
                <option value="CHECKED_IN">Đã check-in</option>
                <option value="NOT_CHECKED_IN">Chưa check-in</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Tổng số vé</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Đã check-in</p>
            <p className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.checkedIn).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Chưa check-in</p>
            <p className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => !b.checkedIn && (b.status === 'PAID' || b.status === 'CONFIRMED')).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Chờ thanh toán</p>
            <p className="text-2xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === 'PENDING').length}
            </p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã vé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tuyến đường
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian đặt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.bookingCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.route.from} → {booking.route.to}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.departureTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.seats} ghế</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(booking.totalPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.checkedIn ? (
                        <div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Đã check-in
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {booking.checkedInAt && formatDateTime(booking.checkedInAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Chưa check-in
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(booking.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy vé nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Check-in vé</h2>
              <button onClick={closeCheckinModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">✕</button>
            </div>

            {checkinSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-800 font-bold text-lg">{checkinSuccess.message}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã vé</span>
                    <span className="font-bold font-mono">{checkinSuccess.booking.bookingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Khách hàng</span>
                    <span className="font-semibold">{checkinSuccess.booking.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Điện thoại</span>
                    <span className="font-semibold">{checkinSuccess.booking.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tuyến</span>
                    <span className="font-semibold text-right">{checkinSuccess.booking.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày — Giờ</span>
                    <span className="font-semibold">{formatDate(checkinSuccess.booking.date)} {checkinSuccess.booking.departureTime}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-500">Tổng tiền</span>
                    <span className="font-bold text-green-600">{formatPrice(checkinSuccess.booking.totalPrice)}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setCheckinSuccess(null); setCheckinCode(''); }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold"
                >
                  Check-in tiếp
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Camera view — video always mounted so ref is ready */}
                <div className={`relative rounded-xl overflow-hidden bg-black ${cameraActive ? 'block' : 'hidden'}`}>
                  <video ref={videoRef} className="w-full h-56 object-cover" muted playsInline autoPlay />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-44 border-2 border-white rounded-xl opacity-70">
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                    </div>
                  </div>
                  <button
                    onClick={stopCamera}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-3 py-1.5 rounded-lg"
                  >
                    ✕ Tắt camera
                  </button>
                  <p className="absolute bottom-2 left-0 right-0 text-center text-white text-xs bg-black bg-opacity-40 py-1">
                    Hướng camera vào mã QR trên vé
                  </p>
                </div>

                {cameraError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-800 text-sm">{cameraError}</p>
                  </div>
                )}

                {cameraActive && typeof window !== 'undefined' && !('BarcodeDetector' in window) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-yellow-800 text-sm">Camera đang chạy nhưng trình duyệt chưa hỗ trợ quét QR tự động. Vui lòng nhập mã thủ công hoặc dùng Chrome mới nhất.</p>
                  </div>
                )}

                {/* Manual input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã vé</label>
                  <input
                    type="text"
                    value={checkinCode}
                    onChange={(e) => {
                      const raw = e.target.value.trim();
                      const urlMatch = raw.match(/\/ve\/(VCP[A-Z0-9]+)/i);
                      setCheckinCode(urlMatch ? urlMatch[1] : raw.toUpperCase());
                      setCheckinError(null);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && checkinCode) handleCheckin(checkinCode); }}
                    placeholder="VCP240109001  (Enter để check-in)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
                    autoFocus={!cameraActive}
                  />
                  <p className="text-xs text-gray-400 mt-1">Nhập thủ công hoặc dùng máy quét QR USB — tự động check-in khi quét</p>
                </div>

                {checkinError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-800 text-sm">{checkinError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-medium text-sm border border-gray-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Quét camera
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleCheckin(checkinCode)}
                    disabled={!checkinCode || checkinLoading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    {checkinLoading ? '⏳ Đang xử lý...' : '✓ Check-in'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
