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
        if (!confirm('Xác nhận đã nhận được thanh toán cho vé này?')) return;

        try {
            setProcessingId(bookingId);
            const response = await fetch('/api/admin/payments/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, method }),
            });
            const result = await response.json();

            if (result.success) {
                alert('Xác nhận thanh toán thành công');
                fetchPendingBookings();
                setSelectedBooking(null);
            } else {
                alert(`Lỗi: ${result.error || 'Không thể xác nhận thanh toán'}`);
            }
        } catch (err) {
            console.error('Error confirming payment:', err);
            alert('Có lỗi xảy ra khi xác nhận thanh toán');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (date: Date) => new Date(date).toLocaleDateString('vi-VN');
    const formatDateTime = (date: Date) => new Date(date).toLocaleString('vi-VN');

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Quản lý thanh toán</h1>
                <p className="text-sm text-gray-600 mt-0.5">Vé chờ thanh toán và xác nhận</p>
            </div>

            {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-600">Vé chờ thanh toán</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{pendingBookings.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-600">Tổng tiền chờ thu</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {pendingBookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString('vi-VN')} đ
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded p-3">
                    <p className="text-xs text-gray-600">Tổng số ghế</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {pendingBookings.reduce((sum, b) => sum + b.seats, 0)}
                    </p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-200">
                    <h2 className="text-sm font-semibold text-gray-900">Danh sách vé chờ thanh toán</h2>
                </div>

                {loading ? (
                    <div className="p-6 text-center text-sm text-gray-500">Đang tải...</div>
                ) : pendingBookings.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">Không có vé chờ thanh toán</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-left text-xs text-gray-700">
                                    <th className="px-3 py-2 font-medium">Mã vé</th>
                                    <th className="px-3 py-2 font-medium">Khách hàng</th>
                                    <th className="px-3 py-2 font-medium">Tuyến</th>
                                    <th className="px-3 py-2 font-medium">Ngày đi</th>
                                    <th className="px-3 py-2 font-medium">Ghế</th>
                                    <th className="px-3 py-2 font-medium">Tổng tiền</th>
                                    <th className="px-3 py-2 font-medium">Đặt lúc</th>
                                    <th className="px-3 py-2 font-medium text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingBookings.map((booking) => (
                                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-3 py-2 font-mono text-gray-900">{booking.bookingCode}</td>
                                        <td className="px-3 py-2">
                                            <p className="text-gray-900">{booking.customerName}</p>
                                            <p className="text-xs text-gray-500">{booking.customerPhone}</p>
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">
                                            {booking.route.from} → {booking.route.to}
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="text-gray-900">{formatDate(booking.date)}</p>
                                            <p className="text-xs text-gray-500">{booking.departureTime}</p>
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">{booking.seats}</td>
                                        <td className="px-3 py-2 text-gray-900">
                                            {booking.totalPrice.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                            {formatDateTime(booking.createdAt)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="px-2 py-1 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-100 mr-1"
                                            >
                                                Chi tiết
                                            </button>
                                            <button
                                                onClick={() => confirmPayment(booking.id)}
                                                disabled={processingId === booking.id}
                                                className="px-2 py-1 text-xs text-white bg-gray-900 rounded hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                {processingId === booking.id ? 'Đang xử lý...' : 'Xác nhận'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedBooking && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded shadow border border-gray-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-base font-semibold text-gray-900">Chi tiết vé</h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-700 mb-2">Thông tin đặt vé</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Mã vé</p>
                                        <p className="font-mono text-gray-900">{selectedBooking.bookingCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Trạng thái</p>
                                        <p className="text-gray-900">Chờ thanh toán</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tuyến đường</p>
                                        <p className="text-gray-900">{selectedBooking.route.from} → {selectedBooking.route.to}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Ngày đi</p>
                                        <p className="text-gray-900">{formatDate(selectedBooking.date)} - {selectedBooking.departureTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Số ghế</p>
                                        <p className="text-gray-900">{selectedBooking.seats}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tổng tiền</p>
                                        <p className="text-gray-900">{selectedBooking.totalPrice.toLocaleString('vi-VN')} đ</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-gray-700 mb-2">Thông tin khách hàng</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Họ tên</p>
                                        <p className="text-gray-900">{selectedBooking.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Số điện thoại</p>
                                        <p className="text-gray-900">{selectedBooking.customerPhone}</p>
                                    </div>
                                    {selectedBooking.customerEmail && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-gray-900">{selectedBooking.customerEmail}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedBooking.qrCode && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Mã QR vé xe</h4>
                                    <div className="flex justify-center p-3 bg-gray-50 border border-gray-200 rounded">
                                        <Image
                                            src={selectedBooking.qrCode}
                                            alt="QR Code"
                                            width={180}
                                            height={180}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={() => confirmPayment(selectedBooking.id)}
                                    disabled={processingId === selectedBooking.id}
                                    className="flex-1 px-3 py-1.5 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 disabled:opacity-50"
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
