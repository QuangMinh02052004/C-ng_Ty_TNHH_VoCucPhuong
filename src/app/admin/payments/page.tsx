'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface PendingBooking {
    id: string;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    route: {
        from: string;
        to: string;
    };
    date: Date;
    departureTime: string;
    seats: number;
    totalPrice: number;
    status: string;
    createdAt: Date;
    qrCode: string | null;
    payment: any;
}

export default function PaymentsManagementPage() {
    const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(null);

    useEffect(() => {
        fetchPendingBookings();
    }, []);

    const fetchPendingBookings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/payments/pending');
            const result = await response.json();

            if (result.success) {
                setPendingBookings(result.data);
            } else {
                setError('Không thể tải danh sách vé chờ thanh toán');
            }
        } catch (err) {
            console.error('Error fetching pending bookings:', err);
            setError('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const confirmPayment = async (bookingId: string, method: string = 'BANK_TRANSFER') => {
        if (!confirm('Xác nhận đã nhận được thanh toán cho vé này?')) {
            return;
        }

        try {
            setProcessingId(bookingId);

            const response = await fetch('/api/admin/payments/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId,
                    method,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Xác nhận thanh toán thành công!');
                // Refresh list
                fetchPendingBookings();
                setSelectedBooking(null);
            } else {
                alert(`❌ Lỗi: ${result.error || 'Không thể xác nhận thanh toán'}`);
            }
        } catch (err) {
            console.error('Error confirming payment:', err);
            alert('Có lỗi xảy ra khi xác nhận thanh toán');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString('vi-VN');
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý thanh toán</h1>
                <p className="text-gray-600">Danh sách vé chờ thanh toán và xác nhận</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">⏳</span>
                        <span className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Vé chờ thanh toán</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">💰</span>
                        <span className="text-2xl font-bold text-green-600">
                            {(pendingBookings.reduce((sum, b) => sum + b.totalPrice, 0) / 1000000).toFixed(1)}M
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Tổng tiền chờ thu</p>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">💺</span>
                        <span className="text-2xl font-bold text-sky-600">
                            {pendingBookings.reduce((sum, b) => sum + b.seats, 0)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">Tổng số ghế đặt</p>
                </div>
            </div>

            {/* Pending Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        Danh sách vé chờ thanh toán
                    </h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                ) : pendingBookings.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="text-6xl">✅</span>
                        <p className="mt-4 text-gray-600">Không có vé chờ thanh toán</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã vé
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tuyến
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
                                        Đặt lúc
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-semibold text-sky-600">
                                                {booking.bookingCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{booking.customerName}</p>
                                                <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {booking.route.from} → {booking.route.to}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm text-gray-900">{formatDate(booking.date)}</p>
                                                <p className="text-xs text-gray-500">{booking.departureTime}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                                                {booking.seats} ghế
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-green-600">
                                                {booking.totalPrice.toLocaleString('vi-VN')} đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(booking.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="px-3 py-1 text-xs bg-sky-100 text-sky-700 rounded hover:bg-sky-200 transition-colors"
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    onClick={() => confirmPayment(booking.id)}
                                                    disabled={processingId === booking.id}
                                                    className={`px-3 py-1 text-xs rounded transition-colors ${
                                                        processingId === booking.id
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-green-500 text-white hover:bg-green-600'
                                                    }`}
                                                >
                                                    {processingId === booking.id ? 'Đang xử lý...' : 'Xác nhận'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-800">Chi tiết vé</h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Booking Info */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Thông tin đặt vé</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Mã vé</p>
                                        <p className="font-mono font-semibold text-sky-600">{selectedBooking.bookingCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Trạng thái</p>
                                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                            Chờ thanh toán
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tuyến đường</p>
                                        <p className="font-semibold">{selectedBooking.route.from} → {selectedBooking.route.to}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Ngày đi</p>
                                        <p className="font-semibold">{formatDate(selectedBooking.date)} - {selectedBooking.departureTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Số ghế</p>
                                        <p className="font-semibold">{selectedBooking.seats} ghế</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tổng tiền</p>
                                        <p className="font-bold text-green-600">{selectedBooking.totalPrice.toLocaleString('vi-VN')} đ</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Thông tin khách hàng</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Họ tên</p>
                                        <p className="font-semibold">{selectedBooking.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Số điện thoại</p>
                                        <p className="font-semibold">{selectedBooking.customerPhone}</p>
                                    </div>
                                    {selectedBooking.customerEmail && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-semibold">{selectedBooking.customerEmail}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QR Code */}
                            {selectedBooking.qrCode && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-3">Mã QR vé xe</h4>
                                    <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                                        <Image
                                            src={selectedBooking.qrCode}
                                            alt="QR Code"
                                            width={200}
                                            height={200}
                                            className="border-2 border-gray-300"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={() => {
                                        confirmPayment(selectedBooking.id);
                                    }}
                                    disabled={processingId === selectedBooking.id}
                                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                        processingId === selectedBooking.id
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                >
                                    {processingId === selectedBooking.id ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
