'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BookingData {
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    route: string;
    routeFrom: string;
    routeTo: string;
    date: string;
    departureTime: string;
    seats: number;
    totalPrice: number;
    status: string;
    qrCodes?: {
        ticket: string;
        payment: string;
    };
}

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [paymentChecked, setPaymentChecked] = useState(false);

    useEffect(() => {
        // Lấy dữ liệu từ sessionStorage (đã được lưu khi đặt vé thành công)
        const bookingDataString = sessionStorage.getItem('lastBooking');

        if (bookingDataString) {
            try {
                const data = JSON.parse(bookingDataString);
                setBookingData(data);
            } catch (error) {
                console.error('Error parsing booking data:', error);
            }
        }

        setLoading(false);
    }, []);

    // Auto-check payment status every 5 seconds
    useEffect(() => {
        if (!bookingData || bookingData.status === 'PAID') return;

        const checkPaymentStatus = async () => {
            try {
                const response = await fetch(`/api/bookings/check-status?bookingCode=${bookingData.bookingCode}`);

                if (response.ok) {
                    const data = await response.json();

                    if (data.status === 'PAID') {
                        // Update booking data
                        const updatedBooking = {
                            ...bookingData,
                            status: 'PAID'
                        };
                        setBookingData(updatedBooking);
                        sessionStorage.setItem('lastBooking', JSON.stringify(updatedBooking));

                        // Show success notification
                        setPaymentChecked(true);
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        };

        // Check immediately
        checkPaymentStatus();

        // Then check every 5 seconds
        const interval = setInterval(checkPaymentStatus, 5000);

        return () => clearInterval(interval);
    }, [bookingData]);

    const handleManualCheck = async () => {
        if (!bookingData) return;

        setCheckingPayment(true);
        try {
            const response = await fetch(`/api/bookings/check-status?bookingCode=${bookingData.bookingCode}`);

            if (response.ok) {
                const data = await response.json();

                if (data.status === 'PAID') {
                    const updatedBooking = {
                        ...bookingData,
                        status: 'PAID'
                    };
                    setBookingData(updatedBooking);
                    sessionStorage.setItem('lastBooking', JSON.stringify(updatedBooking));
                    setPaymentChecked(true);
                } else {
                    alert('Chưa nhận được thanh toán. Vui lòng thử lại sau!');
                }
            }
        } catch (error) {
            console.error('Error checking payment:', error);
            alert('Lỗi khi kiểm tra thanh toán');
        } finally {
            setCheckingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🎫</div>
                    <p className="text-gray-600">Đang tải thông tin vé...</p>
                </div>
            </div>
        );
    }

    if (!bookingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thông tin đặt vé</h1>
                    <p className="text-gray-600 mb-6">
                        Vui lòng kiểm tra lại hoặc đặt vé mới
                    </p>
                    <Link
                        href="/dat-ve"
                        className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold"
                    >
                        Đặt vé ngay
                    </Link>
                </div>
            </div>
        );
    }

    // Helper function to format route type
    const getRouteType = (routeName: string) => {
        if (routeName.includes('Cao tốc')) return 'CT';
        if (routeName.includes('Quốc lộ')) return 'QL';
        return '';
    };

    return (
        <>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-ticket, #printable-ticket * {
                        visibility: visible;
                    }
                    #printable-ticket {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 10px;
                        box-sizing: border-box;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 8mm;
                    }
                    /* Tối ưu font size để fit 1 trang */
                    #printable-ticket h1 {
                        font-size: 18px !important;
                        margin-bottom: 4px !important;
                    }
                    #printable-ticket h2 {
                        font-size: 22px !important;
                        margin-bottom: 6px !important;
                    }
                    #printable-ticket h3 {
                        font-size: 14px !important;
                        margin-bottom: 8px !important;
                    }
                    #printable-ticket p {
                        font-size: 11px !important;
                        margin-bottom: 2px !important;
                    }
                    #printable-ticket .text-xs {
                        font-size: 9px !important;
                    }
                    #printable-ticket .text-sm {
                        font-size: 10px !important;
                    }
                    #printable-ticket .mb-6 {
                        margin-bottom: 12px !important;
                    }
                    #printable-ticket .mb-4 {
                        margin-bottom: 8px !important;
                    }
                    #printable-ticket .gap-4 {
                        gap: 8px !important;
                    }
                    #printable-ticket .p-4 {
                        padding: 8px !important;
                    }
                    #printable-ticket .pb-4 {
                        padding-bottom: 8px !important;
                    }
                    #printable-ticket .pt-4 {
                        padding-top: 8px !important;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Success Header - Hide when printing */}
                    <div className="text-center mb-8 no-print">
                        <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                            <div className="text-6xl">✅</div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                            Đặt vé thành công!
                        </h1>
                        <p className="text-lg text-gray-600">
                            Mã đặt vé của bạn: <span className="font-bold text-sky-600">{bookingData.bookingCode}</span>
                        </p>
                    </div>

                    {/* Printable Ticket */}
                    <div id="printable-ticket" className="bg-white p-8 mb-6 border-2 border-gray-300" style={{ maxWidth: '210mm' }}>
                        {/* Company Header */}
                        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                CÔNG TY TNHH VÕ CÚC PHƯƠNG
                            </h1>
                            <p className="text-sm text-gray-600">
                                Hotline: 02519 999 975 | Email: vocucphuong0018@gmail.com
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Long Khánh: 18 Nguyễn Du, Xuân An | Quận 5: 97i Nguyễn Duy Dương, P.9 | Hàng Xanh: 496B Điện Biên Phủ, P.21
                            </p>
                        </div>

                        {/* Ticket Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-sky-600 mb-2">VÉ XE KHÁCH</h2>
                            <p className="text-lg font-semibold text-gray-700">
                                Mã vé: {bookingData.bookingCode}
                            </p>
                        </div>

                        {/* Route Info */}
                        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Điểm đi</p>
                                    <p className="text-xl font-bold text-gray-900">{bookingData.routeFrom}</p>
                                </div>
                                <div className="text-3xl text-sky-500">→</div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Điểm đến</p>
                                    <p className="text-xl font-bold text-gray-900">{bookingData.routeTo}</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-sky-200">
                                <span className="inline-block px-3 py-1 bg-sky-600 text-white text-sm font-semibold rounded">
                                    Tuyến: {getRouteType(bookingData.route)}
                                </span>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
                                THÔNG TIN KHÁCH HÀNG
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Họ và tên:</p>
                                    <p className="font-semibold text-gray-900">{bookingData.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Số điện thoại:</p>
                                    <p className="font-semibold text-gray-900">{bookingData.customerPhone}</p>
                                </div>
                                {bookingData.customerEmail && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500">Email:</p>
                                        <p className="font-semibold text-gray-900">{bookingData.customerEmail}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">
                                CHI TIẾT CHUYẾN ĐI
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Ngày đi:</p>
                                    <p className="font-semibold text-gray-900">{bookingData.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Giờ xuất bến:</p>
                                    <p className="font-semibold text-gray-900">{bookingData.departureTime}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Số ghế:</p>
                                    <p className="font-semibold text-gray-900">{bookingData.seats} ghế</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Ngày đặt vé:</p>
                                    <p className="font-semibold text-gray-900">{new Date().toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-700">TỔNG TIỀN:</span>
                                <span className="text-2xl font-bold text-sky-600">
                                    {bookingData.totalPrice.toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                        </div>

                        {/* QR Code */}
                        {bookingData.qrCodes && (
                            <div className="mb-6 text-center border-t border-gray-300 pt-4">
                                <p className="text-sm text-gray-600 mb-2">Mã QR vé xe</p>
                                <Image
                                    src={bookingData.qrCodes.ticket}
                                    alt="QR Code vé xe"
                                    width={150}
                                    height={150}
                                    className="mx-auto border-2 border-gray-300 filter grayscale contrast-200"
                                />
                            </div>
                        )}

                        {/* Footer Notes */}
                        <div className="border-t-2 border-gray-300 pt-4 mt-6">
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">LƯU Ý:</h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Vui lòng có mặt tại bến <strong>trước 15 phút</strong> so với giờ xuất bến</li>
                                <li>• Mang theo CMND/CCCD khi lên xe</li>
                                <li>• Xuất trình mã QR vé cho nhân viên khi lên xe</li>
                                <li>• Liên hệ hotline <strong>02519 999 975</strong> nếu cần hỗ trợ</li>
                            </ul>
                        </div>

                        {/* Print timestamp */}
                        <div className="text-center text-xs text-gray-400 mt-4">
                            In lúc: {new Date().toLocaleString('vi-VN')}
                        </div>
                    </div>

                    {/* Booking Info Card - Hide when printing */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6 no-print">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">📋</span>
                            Thông tin đặt vé
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                <span className="text-2xl">🚌</span>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Tuyến đường</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {bookingData.routeFrom} → {bookingData.routeTo}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">👤</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Họ và tên</p>
                                        <p className="font-semibold text-gray-800">{bookingData.customerName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">📞</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Số điện thoại</p>
                                        <p className="font-semibold text-gray-800">{bookingData.customerPhone}</p>
                                    </div>
                                </div>

                                {bookingData.customerEmail && (
                                    <div className="flex items-start gap-4">
                                        <span className="text-2xl">📧</span>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-semibold text-gray-800">{bookingData.customerEmail}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">📅</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Ngày đi</p>
                                        <p className="font-semibold text-gray-800">{bookingData.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">🕐</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Giờ xuất bến</p>
                                        <p className="font-semibold text-gray-800">{bookingData.departureTime}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">💺</span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Số ghế</p>
                                        <p className="font-semibold text-gray-800">{bookingData.seats} ghế</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-700">Tổng tiền:</span>
                                    <span className="text-2xl font-bold text-sky-600">
                                        {bookingData.totalPrice.toLocaleString('vi-VN')} đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Codes - Hide when printing */}
                    {bookingData.qrCodes && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 no-print">
                            {/* Ticket QR */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-xl">🎫</span>
                                    Mã QR vé xe
                                </h3>
                                <div className="flex justify-center mb-4 bg-gray-50 p-6 rounded-lg">
                                    {bookingData.qrCodes.ticket && (
                                        <div className="mb-6 text-center border-t border-gray-300 pt-4">
                                            <p className="text-sm text-gray-600 mb-2">Mã QR vé xe</p>
                                            <Image
                                                src={bookingData.qrCodes.ticket}
                                                alt="QR Code vé xe"
                                                width={150}
                                                height={150}
                                                className="mx-auto border-2 border-gray-300 filter grayscale contrast-200"
                                            />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 text-center">
                                    Vui lòng xuất trình mã này khi lên xe
                                </p>
                            </div>

                                    {/* Payment QR */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-xl">💳</span>
                                    Mã QR thanh toán
                                </h3>

                                {/* Payment Status Badge */}
                                {bookingData.status === 'PAID' ? (
                                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 font-semibold flex items-center justify-center gap-2">
                                            <span className="text-2xl">✅</span>
                                            Đã thanh toán
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-yellow-800 font-semibold flex items-center justify-center gap-2">
                                            <span className="text-2xl">⏳</span>
                                            Chờ thanh toán
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-center mb-4 bg-gray-50 p-6 rounded-lg">
                                    {bookingData.qrCodes.payment && (
                                        <Image
                                            src={bookingData.qrCodes.payment}
                                            alt="QR Code thanh toán"
                                            width={200}
                                            height={200}
                                            className="border-4 border-white shadow-md"
                                        />
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 text-center mb-2">
                                    Quét mã QR để thanh toán
                                </p>
                                <p className="text-xs text-gray-500 text-center mb-4">
                                    (VNPay / MoMo / Chuyển khoản ngân hàng)
                                </p>

                                {/* Manual check button */}
                                {bookingData.status !== 'PAID' && (
                                    <button
                                        onClick={handleManualCheck}
                                        disabled={checkingPayment}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {checkingPayment ? 'Đang kiểm tra...' : '🔄 Kiểm tra thanh toán'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Status Info */}
                    {bookingData.status !== 'PAID' && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6 no-print">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="text-xl">💳</span>
                                Thanh toán
                            </h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-600">•</span>
                                    <span>Quét mã QR bên trên để thanh toán</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-600">•</span>
                                    <span><strong>Hệ thống tự động kiểm tra</strong> thanh toán mỗi 5 giây</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-600">•</span>
                                    <span>Sau khi chuyển tiền, bạn sẽ nhận được <strong>thông báo ngay lập tức</strong></span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-600">•</span>
                                    <span>Hoặc nhấn nút <strong>"🔄 Kiểm tra thanh toán"</strong> để kiểm tra thủ công</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Important Notes - Hide when printing */}
                    <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6 no-print">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            Lưu ý quan trọng
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600 font-bold">•</span>
                                <span>Vui lòng có mặt tại bến <strong>trước 15 phút</strong> so với giờ xuất bến</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600 font-bold">•</span>
                                <span>Mang theo <strong>CMND/CCCD</strong> khi lên xe</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600 font-bold">•</span>
                                <span>Xuất trình <strong>mã QR vé</strong> cho nhân viên khi lên xe</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600 font-bold">•</span>
                                <span>Chúng tôi đã gửi thông tin vé qua <strong>Email và SMS</strong> (nếu có)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-sky-600 font-bold">•</span>
                                <span>Liên hệ hotline <strong>02519 999 975</strong> nếu cần hỗ trợ</span>
                            </li>
                        </ul>
                    </div>

                    {/* Actions - Hide when printing */}
                    <div className="flex flex-col md:flex-row gap-4 no-print">
                        <Link
                            href="/"
                            className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                        >
                            ← Về trang chủ
                        </Link>
                        <Link
                            href="/dat-ve"
                            className="flex-1 text-center px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold"
                        >
                            Đặt vé khác
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                        >
                            🖨️ In vé
                        </button>
                    </div>

                    {/* Support Info - Hide when printing */}
                    <div className="mt-8 text-center text-sm text-gray-600 no-print">
                        <p className="mb-2">Cần hỗ trợ? Liên hệ với chúng tôi:</p>
                        <p>
                            📞 Hotline: <a href="tel:02519999975" className="text-sky-600 font-semibold hover:text-sky-700">02519 999 975</a>
                            {' | '}
                            📧 Email: <a href="mailto:vocucphuong0018@gmail.com" className="text-sky-600 font-semibold hover:text-sky-700">vocucphuong0018@gmail.com</a>
                        </p>
                    </div>

                    {/* Payment Success Notification */}
                    {paymentChecked && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
                                <div className="text-center">
                                    <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                                        <div className="text-6xl animate-bounce">🎉</div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Thanh toán thành công!
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Chúng tôi đã nhận được thanh toán của bạn. Vé xe đã được xác nhận!
                                    </p>
                                    <button
                                        onClick={() => setPaymentChecked(false)}
                                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scale-in {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }

                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
