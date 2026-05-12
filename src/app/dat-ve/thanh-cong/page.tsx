'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
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
    selectedSeats?: number[];
    pickupMethod?: 'Tại bến' | 'Dọc đường';
    pickupAddress?: string;
    totalPrice: number;
    status: string;
    qrCodes?: {
        ticket: string;
        payment: string;
    };
}

function formatDateVN(d: string): string {
    if (!d) return '';
    // YYYY-MM-DD → DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
        const [y, m, day] = d.split('T')[0].split('-');
        return `${day}/${m}/${y}`;
    }
    return d;
}

function getRouteType(routeName: string): string {
    if (routeName?.includes('Cao tốc')) return 'Cao tốc';
    if (routeName?.includes('Quốc lộ')) return 'Quốc lộ';
    return '';
}

function cleanCity(name: string): string {
    return (name || '').replace(/\s*\([^)]+\)\s*$/, '').trim();
}

function BookingSuccessContent() {
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
        if (!bookingData) return;
        if (bookingData.status === 'PAID') return;

        const checkPaymentStatus = async () => {
            try {
                const response = await fetch(`/api/bookings/check-status?bookingCode=${bookingData.bookingCode}`);

                if (response.ok) {
                    const data = await response.json();

                    if (data.status === 'PAID' && bookingData.status !== 'PAID') {
                        // Update booking data
                        const updatedBooking = {
                            ...bookingData,
                            status: 'PAID'
                        };
                        setBookingData(updatedBooking);
                        sessionStorage.setItem('lastBooking', JSON.stringify(updatedBooking));

                        // Show success notification
                        setPaymentChecked(true);

                        // Play success sound (optional)
                        try {
                            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiToIFWa+7OKXSAwPUKXh8LhrJAU2ldnyxnkpBSp8zPLaizsIEWS56+mjUBELTKXh8LdnHgY7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8LhnHgU7ktjyy3oqBSh4zPLaizsIFGS56+mjUBELTKXh8Lhn');
                            audio.play().catch(() => {});
                        } catch (e) {
                            // Ignore audio errors
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        };

        // Check immediately
        checkPaymentStatus();

        // Then check every 3 seconds (faster check)
        const interval = setInterval(checkPaymentStatus, 3000);

        return () => clearInterval(interval);
    }, [bookingData?.bookingCode]);

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

    const [downloading, setDownloading] = useState(false);

    const handleDownloadImage = async () => {
        if (!bookingData) return;
        setDownloading(true);
        try {
            const el = document.getElementById('printable-ticket');
            if (!el) return;
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(el, {
                backgroundColor: '#ffffff',
                scale: 2, // chất lượng cao hơn để xem trên điện thoại sắc nét
                useCORS: true,
                logging: false,
            });
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Ve-${bookingData.bookingCode}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, 'image/png');
        } catch (e) {
            console.error('[Download ticket]', e);
            alert('Không tải được vé. Vui lòng thử lại hoặc dùng nút In vé.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-4 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
                    <p className="text-gray-700 font-medium">Đang tải thông tin vé...</p>
                </div>
            </div>
        );
    }

    if (!bookingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thông tin đặt vé</h1>
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

    return (
        <>
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-ticket, #printable-ticket * { visibility: visible; }
                    #printable-ticket {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 10px;
                        box-sizing: border-box;
                    }
                    .no-print { display: none !important; }
                    @page { size: A4; margin: 10mm; }
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-6 md:py-12">
                <div className="container mx-auto px-3 md:px-4 max-w-2xl">
                    {/* Header — mobile compact */}
                    <div className="text-center mb-5 md:mb-8 no-print">
                        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-100 mb-3">
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                            Đặt vé thành công
                        </h1>
                        <p className="text-sm md:text-base text-gray-600">
                            Mã đặt vé: <span className="font-bold text-sky-700 select-all">{bookingData.bookingCode}</span>
                        </p>
                    </div>

                    {/* Trạng thái thanh toán */}
                    <div className={`no-print mb-4 rounded-lg px-4 py-2.5 text-sm font-medium border ${
                        bookingData.status === 'PAID'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                        {bookingData.status === 'PAID'
                            ? 'Đã thanh toán thành công'
                            : 'Đang chờ thanh toán — quý khách có thể thanh toán tại bến trước giờ xuất phát'}
                    </div>

                    {/* MAIN TICKET CARD */}
                    <div
                        id="printable-ticket"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5"
                    >
                        {/* Brand strip */}
                        <div className="px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-sky-600 to-sky-700 text-white text-center">
                            <p className="text-sm md:text-base font-bold tracking-wide">VÉ XE KHÁCH</p>
                            <p className="text-xs text-sky-100 mt-0.5">CÔNG TY TNHH VÕ CÚC PHƯƠNG</p>
                        </div>

                        {/* QR — mobile first, lớn rõ */}
                        {bookingData.qrCodes?.ticket && (
                            <div className="px-5 pt-6 pb-4 text-center border-b border-dashed border-gray-200">
                                <Image
                                    src={bookingData.qrCodes.ticket}
                                    alt="QR vé xe"
                                    width={200}
                                    height={200}
                                    className="mx-auto rounded-md"
                                />
                                <p className="text-xs text-gray-500 mt-3">
                                    Xuất trình mã QR này khi lên xe
                                </p>
                            </div>
                        )}

                        {/* Tuyến đường — to và rõ */}
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-[10px] uppercase tracking-widest text-sky-700 font-semibold mb-2">Tuyến đường</p>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500">Điểm đi</p>
                                    <p className="text-base md:text-lg font-bold text-gray-900 truncate">{cleanCity(bookingData.routeFrom)}</p>
                                </div>
                                <div className="text-sky-500 text-xl shrink-0">→</div>
                                <div className="flex-1 min-w-0 text-right">
                                    <p className="text-xs text-gray-500">Điểm đến</p>
                                    <p className="text-base md:text-lg font-bold text-gray-900 truncate">{cleanCity(bookingData.routeTo)}</p>
                                </div>
                            </div>
                            {getRouteType(bookingData.route) && (
                                <span className="inline-block mt-3 px-2.5 py-0.5 bg-sky-100 text-sky-800 text-xs font-semibold rounded">
                                    {getRouteType(bookingData.route)}
                                </span>
                            )}
                        </div>

                        {/* Điểm đón — feature mới */}
                        <div className="px-5 py-4 border-b border-gray-100 bg-sky-50/50">
                            <p className="text-[10px] uppercase tracking-widest text-sky-700 font-semibold mb-1">Điểm đón</p>
                            {bookingData.pickupMethod === 'Dọc đường' && bookingData.pickupAddress ? (
                                <>
                                    <p className="text-base font-bold text-gray-900">Đón dọc đường</p>
                                    <p className="text-sm text-gray-700 mt-0.5">{bookingData.pickupAddress}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-base font-bold text-gray-900">Đón tại bến</p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        Có mặt tại bến xe trước giờ xuất phát ít nhất 15 phút
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Chi tiết chuyến đi — 2 cột mobile */}
                        <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Ngày đi</p>
                                <p className="text-sm md:text-base font-semibold text-gray-900 mt-0.5">{formatDateVN(bookingData.date)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Giờ xuất bến</p>
                                <p className="text-sm md:text-base font-semibold text-gray-900 mt-0.5">{bookingData.departureTime}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Số ghế</p>
                                {bookingData.selectedSeats && bookingData.selectedSeats.length > 0 ? (
                                    <p className="text-sm md:text-base font-semibold text-gray-900 mt-0.5">
                                        {bookingData.selectedSeats.length} ghế:{' '}
                                        <span className="text-sky-700">
                                            {[...bookingData.selectedSeats].sort((a, b) => a - b).join(', ')}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-sm md:text-base font-semibold text-gray-900 mt-0.5">{bookingData.seats} ghế</p>
                                )}
                            </div>
                        </div>

                        {/* Khách hàng */}
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Khách hàng</p>
                            <p className="text-sm md:text-base font-semibold text-gray-900">{bookingData.customerName}</p>
                            <p className="text-sm text-gray-700">{bookingData.customerPhone}</p>
                            {bookingData.customerEmail && (
                                <p className="text-sm text-gray-600 break-all">{bookingData.customerEmail}</p>
                            )}
                        </div>

                        {/* Tổng tiền */}
                        <div className="px-5 py-4 bg-sky-50 flex items-center justify-between">
                            <span className="text-sm md:text-base font-semibold text-gray-800">Tổng tiền</span>
                            <span className="text-xl md:text-2xl font-bold text-sky-700">
                                {(bookingData.totalPrice || 0).toLocaleString('vi-VN')} đ
                            </span>
                        </div>

                        {/* Footer in vé */}
                        <div className="px-5 py-3 text-center text-[10px] text-gray-400 border-t border-gray-100">
                            Hotline 02519 999 975 · vocucphuong0018@gmail.com
                        </div>
                    </div>

                    {/* Action buttons — mobile stacked */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5 no-print">
                        <button
                            onClick={handleDownloadImage}
                            disabled={downloading}
                            className="px-4 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:bg-sky-400 transition-colors text-sm"
                        >
                            {downloading ? 'Đang tạo ảnh...' : 'Tải vé (PNG)'}
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                        >
                            In vé
                        </button>
                        <Link
                            href="/dat-ve"
                            className="text-center px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                        >
                            Đặt vé khác
                        </Link>
                    </div>

                    {/* Lưu ý */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 no-print">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Lưu ý quan trọng</p>
                        <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside marker:text-amber-600">
                            <li>Có mặt tại điểm đón <strong>trước 15 phút</strong> so với giờ xuất bến</li>
                            <li>Mang theo <strong>CMND/CCCD</strong> khi lên xe</li>
                            <li>Xuất trình <strong>mã QR vé</strong> cho nhân viên</li>
                            {bookingData.customerEmail && (
                                <li>Thông tin vé đã được gửi qua email</li>
                            )}
                        </ul>
                    </div>

                    {/* Hỗ trợ */}
                    <div className="text-center text-xs md:text-sm text-gray-600 no-print">
                        Cần hỗ trợ?{' '}
                        <a href="tel:02519999975" className="text-sky-700 font-semibold hover:text-sky-800">
                            02519 999 975
                        </a>
                    </div>

                    {/* Về trang chủ */}
                    <div className="text-center mt-4 no-print">
                        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
                            Về trang chủ
                        </Link>
                    </div>

                    {/* Payment Success Notification */}
                    {paymentChecked && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in no-print"
                            onClick={() => setPaymentChecked(false)}
                        >
                            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h3>
                                    <p className="text-gray-600 text-sm mb-6">Vé xe đã được xác nhận</p>
                                    <button
                                        onClick={() => setPaymentChecked(false)}
                                        className="w-full px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
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
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-scale-in { animation: scale-in 0.3s ease-out; }
            `}</style>
        </>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-4 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
                    <p className="text-gray-700 font-medium">Đang tải thông tin vé...</p>
                </div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    );
}
