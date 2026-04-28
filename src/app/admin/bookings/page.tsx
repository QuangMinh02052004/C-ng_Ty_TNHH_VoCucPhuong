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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/bookings');
        if (!response.ok) throw new Error('Failed to fetch bookings');
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
      setCameraActive(true);
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
    if (searchCode && !booking.bookingCode.toLowerCase().includes(searchCode.toLowerCase())) return false;
    if (filterStatus !== 'ALL' && booking.status !== filterStatus) return false;
    if (filterCheckedIn === 'CHECKED_IN' && !booking.checkedIn) return false;
    if (filterCheckedIn === 'NOT_CHECKED_IN' && booking.checkedIn) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Chờ thanh toán',
      CONFIRMED: 'Đã xác nhận',
      PAID: 'Đã thanh toán',
      CANCELLED: 'Đã hủy',
      COMPLETED: 'Hoàn thành',
    };
    return labels[status] || status;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-600 text-sm">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-sm">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Quản lý vé</h1>
          <p className="text-sm text-gray-600 mt-0.5">Danh sách vé và check-in</p>
        </div>
        <button
          onClick={() => { setCheckinSuccess(null); setCheckinError(null); setCheckinCode(''); setShowCheckinModal(true); }}
          className="px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800"
        >
          Quét QR / Check-in
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-700 mb-1">Tìm theo mã vé</label>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Nhập mã vé..."
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
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
            <label className="block text-xs text-gray-700 mb-1">Check-in</label>
            <select
              value={filterCheckedIn}
              onChange={(e) => setFilterCheckedIn(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="ALL">Tất cả</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="NOT_CHECKED_IN">Chưa check-in</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-600">Tổng số vé</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{bookings.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-600">Đã check-in</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{bookings.filter((b) => b.checkedIn).length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-600">Chưa check-in</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">
            {bookings.filter((b) => !b.checkedIn && (b.status === 'PAID' || b.status === 'CONFIRMED')).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3">
          <p className="text-xs text-gray-600">Chờ thanh toán</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{bookings.filter((b) => b.status === 'PENDING').length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs text-gray-700">
                <th className="px-3 py-2 font-medium">Mã vé</th>
                <th className="px-3 py-2 font-medium">Khách hàng</th>
                <th className="px-3 py-2 font-medium">Tuyến đường</th>
                <th className="px-3 py-2 font-medium">Ngày đi</th>
                <th className="px-3 py-2 font-medium">Ghế</th>
                <th className="px-3 py-2 font-medium">Tổng tiền</th>
                <th className="px-3 py-2 font-medium">Trạng thái</th>
                <th className="px-3 py-2 font-medium">Check-in</th>
                <th className="px-3 py-2 font-medium">Đặt lúc</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-gray-900">{booking.bookingCode}</td>
                  <td className="px-3 py-2">
                    <p className="text-gray-900">{booking.customerName}</p>
                    <p className="text-xs text-gray-500">{booking.customerPhone}</p>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{booking.route.from} → {booking.route.to}</td>
                  <td className="px-3 py-2">
                    <p className="text-gray-900">{formatDate(booking.date)}</p>
                    <p className="text-xs text-gray-500">{booking.departureTime}</p>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{booking.seats}</td>
                  <td className="px-3 py-2 text-gray-900">{formatPrice(booking.totalPrice)}</td>
                  <td className="px-3 py-2 text-gray-700">{getStatusLabel(booking.status)}</td>
                  <td className="px-3 py-2">
                    {booking.checkedIn ? (
                      <div>
                        <p className="text-gray-900">Đã check-in</p>
                        {booking.checkedInAt && (
                          <p className="text-xs text-gray-500">{formatDateTime(booking.checkedInAt)}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Chưa check-in</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">{formatDateTime(booking.createdAt)}</td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-sm text-gray-500">Không tìm thấy vé nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow border border-gray-200 max-w-md w-full">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Check-in vé</h2>
              <button
                onClick={closeCheckinModal}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              {checkinSuccess ? (
                <div className="space-y-3">
                  <div className="border border-gray-300 rounded p-3 text-center">
                    <p className="text-gray-900 font-medium">{checkinSuccess.message}</p>
                  </div>
                  <div className="border border-gray-200 rounded p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mã vé</span>
                      <span className="font-mono text-gray-900">{checkinSuccess.booking.bookingCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Khách hàng</span>
                      <span className="text-gray-900">{checkinSuccess.booking.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Điện thoại</span>
                      <span className="text-gray-900">{checkinSuccess.booking.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tuyến</span>
                      <span className="text-gray-900 text-right">{checkinSuccess.booking.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày — Giờ</span>
                      <span className="text-gray-900">{formatDate(checkinSuccess.booking.date)} {checkinSuccess.booking.departureTime}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-200">
                      <span className="text-gray-500">Tổng tiền</span>
                      <span className="text-gray-900">{formatPrice(checkinSuccess.booking.totalPrice)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setCheckinSuccess(null); setCheckinCode(''); }}
                    className="w-full px-3 py-2 text-sm text-white bg-gray-900 rounded hover:bg-gray-800"
                  >
                    Check-in tiếp
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`relative rounded overflow-hidden bg-black ${cameraActive ? 'block' : 'hidden'}`}>
                    <video ref={videoRef} className="w-full h-56 object-cover" muted playsInline autoPlay />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-44 h-44 border-2 border-white opacity-70" />
                    </div>
                    <button
                      onClick={stopCamera}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                    >
                      Tắt camera
                    </button>
                    <p className="absolute bottom-2 left-0 right-0 text-center text-white text-xs bg-black/40 py-1">
                      Hướng camera vào mã QR trên vé
                    </p>
                  </div>

                  {cameraError && (
                    <div className="border border-gray-300 rounded p-2">
                      <p className="text-gray-700 text-sm">{cameraError}</p>
                    </div>
                  )}

                  {cameraActive && typeof window !== 'undefined' && !('BarcodeDetector' in window) && (
                    <div className="border border-gray-300 rounded p-2">
                      <p className="text-gray-700 text-sm">Trình duyệt chưa hỗ trợ quét QR tự động. Vui lòng nhập mã thủ công hoặc dùng Chrome mới nhất.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Mã vé</label>
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
                      placeholder="VCP240109001 (Enter để check-in)"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-sm"
                      autoFocus={!cameraActive}
                    />
                    <p className="text-xs text-gray-500 mt-1">Nhập thủ công hoặc dùng máy quét QR USB — tự động check-in khi quét</p>
                  </div>

                  {checkinError && (
                    <div className="border border-red-300 bg-red-50 rounded p-2">
                      <p className="text-red-700 text-sm">{checkinError}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!cameraActive && (
                      <button
                        onClick={startCamera}
                        className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Quét camera
                      </button>
                    )}
                    <button
                      onClick={() => handleCheckin(checkinCode)}
                      disabled={!checkinCode || checkinLoading}
                      className="flex-1 px-3 py-2 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                      {checkinLoading ? 'Đang xử lý...' : 'Check-in'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
