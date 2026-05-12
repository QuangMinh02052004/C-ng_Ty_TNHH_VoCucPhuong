'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { routes as fallbackRoutes } from '@/data/routes';
import { Route } from '@/types';
import SeatPicker from '@/components/SeatPicker';

function DatVeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const routeIdFromUrl = searchParams.get('route');
    const timeFromUrl = searchParams.get('time');

    const [formData, setFormData] = useState({
        routeId: '',
        customerName: '',
        phone: '',
        email: '',
        date: new Date().toISOString().split('T')[0], // Mặc định là ngày hôm nay
        departureTime: '',
        seats: 1,
        pickupMethod: 'Tại bến' as 'Tại bến' | 'Dọc đường',
        pickupStationId: '' as string,  // id của TH_PickupStations khi dọc đường
        pickupStationName: '' as string, // tên trạm cache hiển thị
    });
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [pickupStations, setPickupStations] = useState<Array<{ id: number; displayStt: string; name: string }>>([]);

    // Tổng số ghế hiển thị = số ghế khách đã pick trên sơ đồ
    useEffect(() => {
        setFormData(prev => ({ ...prev, seats: selectedSeats.length }));
    }, [selectedSeats]);

    const [routes, setRoutes] = useState<Route[]>(fallbackRoutes);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [popup, setPopup] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' });
    const [bookingEnabled, setBookingEnabled] = useState(true);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    // Load routes from API
    useEffect(() => {
        fetch('/api/routes')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data) && data.length > 0) setRoutes(data); })
            .catch(() => { /* fallback already set */ });
    }, []);

    // Load feature flags
    useEffect(() => {
        fetch('/api/settings', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (typeof data.bookingEnabled === 'boolean') setBookingEnabled(data.bookingEnabled);
                if (typeof data.maintenanceMessage === 'string') setMaintenanceMessage(data.maintenanceMessage);
            })
            .catch(() => { /* default = enabled */ })
            .finally(() => setSettingsLoaded(true));
    }, []);

    // Tự động điền tuyến đường và khung giờ khi có route và time trong URL
    useEffect(() => {
        if (routeIdFromUrl) {
            const route = routes.find(r => r.id === routeIdFromUrl);
            if (route) {
                setSelectedRoute(route);
                setFormData(prev => ({
                    ...prev,
                    routeId: routeIdFromUrl,
                    departureTime: timeFromUrl || prev.departureTime
                }));
            }
        }
    }, [routeIdFromUrl, timeFromUrl, routes]);

    // Tự động điền thông tin khách hàng khi đã đăng nhập
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                customerName: session.user.name || prev.customerName,
                email: session.user.email || prev.email,
                phone: session.user.phone || prev.phone,
            }));
        }
    }, [session]);

    // Lấy danh sách khung giờ từ route data (API)
    const getTimeSlots = () => {
        if (!selectedRoute) return [];
        return selectedRoute.departureTime || [];
    };

    // Xác định chiều tuyến: nếu xuất phát từ Long Khánh → đảo thứ tự trạm
    const pickupDirection: 'sg-lk' | 'lk-sg' = useMemo(() => {
        const from = (selectedRoute?.from || '').toLowerCase();
        return from.includes('long khánh') || from.includes('long khanh') ? 'lk-sg' : 'sg-lk';
    }, [selectedRoute]);

    // Fetch trạm đón khi chọn "Dọc đường"
    useEffect(() => {
        if (formData.pickupMethod !== 'Dọc đường' || !selectedRoute) {
            setPickupStations([]);
            return;
        }
        const TONGHOP_URL = process.env.NEXT_PUBLIC_TONGHOP_URL || 'https://vocucphuongmanage.vercel.app';
        fetch(`${TONGHOP_URL}/api/tong-hop/pickup-stations?direction=${pickupDirection}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setPickupStations(data); })
            .catch(() => setPickupStations([]));
    }, [formData.pickupMethod, pickupDirection, selectedRoute]);

    // Đổi tuyến → reset trạm đón đã chọn (vì thứ tự khác)
    useEffect(() => {
        setFormData(prev => ({ ...prev, pickupStationId: '', pickupStationName: '' }));
    }, [pickupDirection]);

    const handleRouteChange = (routeId: string) => {
        const route = routes.find(r => r.id === routeId);
        setSelectedRoute(route || null);
        setFormData({ ...formData, routeId, departureTime: '' });
    };

    // Kiểm tra xem giờ xuất bến có hợp lệ không (không được đặt vé trong vòng 1 giờ tới)
    const isTimeSlotAvailable = (time: string) => {
        if (!formData.date) return true;

        const selectedDate = new Date(formData.date);
        const today = new Date();

        // Reset giờ phút giây để so sánh chỉ ngày
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Nếu chọn ngày mai trở đi, cho phép tất cả các giờ
        if (selectedDate > today) {
            return true;
        }

        // Nếu chọn ngày hôm nay, kiểm tra giờ
        if (selectedDate.getTime() === today.getTime()) {
            const now = new Date();
            const [hours, minutes] = time.split(':').map(Number);

            // So sánh giờ và phút với thời gian hiện tại
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();

            // Nếu giờ xuất bến nhỏ hơn giờ hiện tại -> đã qua
            if (hours < currentHours) {
                return false;
            }

            // Nếu cùng giờ nhưng phút xuất bến nhỏ hơn hoặc bằng phút hiện tại -> đã qua
            if (hours === currentHours && minutes <= currentMinutes) {
                return false;
            }

            // Còn lại là chưa đến giờ -> có thể đặt
            return true;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate form
        if (!formData.routeId || !formData.customerName || !formData.phone || !formData.date || !formData.departureTime) {
            setError('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (selectedSeats.length === 0) {
            setError('Vui lòng chọn ít nhất 1 ghế trên sơ đồ!');
            return;
        }

        if (formData.pickupMethod === 'Dọc đường' && !formData.pickupStationId) {
            setError('Vui lòng chọn trạm đón dọc đường!');
            return;
        }

        if (!selectedRoute) {
            setError('Vui lòng chọn tuyến đường!');
            return;
        }

        // Kiểm tra giờ xuất bến đã qua chưa
        if (!isTimeSlotAvailable(formData.departureTime)) {
            setPopup({
                show: true,
                title: 'Không thể đặt vé',
                message: `Khung giờ ${formData.departureTime} ngày ${formData.date} đã qua. Vui lòng chọn khung giờ khác hoặc chọn ngày khác.`
            });
            return;
        }

        // Start loading
        setLoading(true);

        try {
            const requestBody = {
                routeId: formData.routeId,
                customerName: formData.customerName,
                customerPhone: formData.phone,
                customerEmail: formData.email || undefined,
                date: formData.date,
                departureTime: formData.departureTime,
                seats: selectedSeats.length,
                selectedSeats,
                pickupMethod: formData.pickupMethod,
                pickupAddress: formData.pickupMethod === 'Dọc đường' ? formData.pickupStationName : '',
                userId: session?.user?.id,
            };

            console.log('📤 Sending booking request:', requestBody);

            // Call API to create booking
            const response = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();

            console.log('📥 API Response:', {
                status: response.status,
                ok: response.ok,
                data: result
            });

            if (!response.ok || !result.success) {
                console.error('❌ Booking failed:', result);
                if (result.error === 'BOOKING_DISABLED') {
                    setBookingEnabled(false);
                    setMaintenanceMessage(result.message || maintenanceMessage);
                    return;
                }
                throw new Error(result.error || result.message || 'Đặt vé thất bại!');
            }

            // Save booking data to sessionStorage for success page
            const bookingData = {
                bookingCode: result.data.booking.bookingCode,
                customerName: formData.customerName,
                customerPhone: formData.phone,
                customerEmail: formData.email,
                route: `${selectedRoute.from} → ${selectedRoute.to}`,
                routeFrom: selectedRoute.from,
                routeTo: selectedRoute.to,
                date: formData.date,
                departureTime: formData.departureTime,
                seats: selectedSeats.length,
                selectedSeats,
                pickupMethod: formData.pickupMethod,
                pickupAddress: formData.pickupMethod === 'Dọc đường' ? formData.pickupStationName : '',
                totalPrice: result.data.booking.totalPrice,
                status: result.data.booking.status,
                qrCodes: result.data.qrCodes,
            };

            sessionStorage.setItem('lastBooking', JSON.stringify(bookingData));

            // Navigate to success page
            router.push('/dat-ve/thanh-cong');

        } catch (err: any) {
            console.error('Booking error:', err);
            setError(err.message || 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = session?.user?.role === 'ADMIN';

    // Trang bảo trì khi admin tắt đặt vé online — admin vẫn được vào đặt thử
    if (settingsLoaded && !bookingEnabled && !isAdmin) {
        return (
            <div className="min-h-[70vh] py-16 bg-gradient-to-b from-sky-50 to-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                            Hệ thống đặt vé đang bảo trì
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 whitespace-pre-line">
                            {maintenanceMessage ||
                                'Hệ thống đặt vé online đang trong quá trình hoàn thiện. Vui lòng liên hệ hotline để đặt vé.'}
                        </p>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left space-y-2">
                            <p className="font-semibold text-gray-800">Liên hệ đặt vé</p>
                            <p className="text-gray-700">
                                Hotline:{' '}
                                <a href="tel:02519999975" className="text-sky-600 font-bold hover:text-sky-700">
                                    02519 999 975
                                </a>
                            </p>
                            <p className="text-gray-700">
                                Email:{' '}
                                <a
                                    href="mailto:vocucphuong0018@gmail.com"
                                    className="text-sky-600 font-semibold hover:text-sky-700"
                                >
                                    vocucphuong0018@gmail.com
                                </a>
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition"
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 bg-gradient-to-b from-sky-50 to-white">
            {/* Popup thông báo */}
            {popup.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{popup.title}</h3>
                            <p className="text-gray-600">{popup.message}</p>
                        </div>
                        <button
                            onClick={() => {
                                setPopup({ show: false, title: '', message: '' });
                                setFormData(prev => ({ ...prev, departureTime: '' }));
                            }}
                            className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            Chọn giờ khác
                        </button>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Đặt vé trực tuyến</h1>
                        <p className="text-lg text-gray-600">
                            Điền thông tin dưới đây để đặt vé nhanh chóng
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-red-800 mb-1">Có lỗi xảy ra</h4>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                                    aria-label="Đóng"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Chọn tuyến đường */}
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                    Tuyến đường <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.routeId}
                                    onChange={(e) => handleRouteChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">-- Chọn tuyến đường --</option>
                                    {routes.map((route) => (
                                        <option key={route.id} value={route.id}>
                                            {route.from} → {route.to} ({route.price.toLocaleString('vi-VN')} đ)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Thông tin chi tiết tuyến */}
                            {selectedRoute && (
                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-lg mb-4 text-gray-900 border-b border-gray-200 pb-3">
                                        Thông tin tuyến đường
                                    </h3>
                                    <div className="space-y-3">
                                        {/* Khung giờ hoạt động */}
                                        <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                                            <p className="text-xs uppercase tracking-wider text-sky-700 font-semibold mb-2">Khung giờ hoạt động</p>
                                            <p className="text-center text-lg font-bold text-gray-900">
                                                {(() => {
                                                    const slots = getTimeSlots();
                                                    if (slots.length > 0) {
                                                        return `${slots[0]} - ${slots[slots.length - 1]}`;
                                                    }
                                                    return 'Vui lòng chọn tuyến';
                                                })()}
                                            </p>
                                            <p className="text-center text-sm text-gray-700 mt-1">
                                                Xe chạy mỗi 30 phút
                                            </p>
                                        </div>

                                        {/* Thông tin khác */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                                <span className="text-sm text-gray-700">Thời gian</span>
                                                <span className="font-semibold text-gray-900">{selectedRoute.duration}</span>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                                <span className="text-sm text-gray-700">Loại xe</span>
                                                <span className="font-semibold text-gray-900">{selectedRoute.busType}</span>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                                <span className="text-sm text-gray-700">Ghế trống</span>
                                                <span className="font-semibold text-green-700">{selectedRoute.availableSeats} chỗ</span>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                                <span className="text-sm text-gray-700">Giá vé</span>
                                                <span className="font-semibold text-sky-700">{selectedRoute.price.toLocaleString('vi-VN')} đ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Điểm đón */}
                            {selectedRoute && (
                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-lg mb-4 text-gray-900 border-b border-gray-200 pb-3">
                                        Điểm đón
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-800 mb-2">
                                                Cách đón <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.pickupMethod}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    pickupMethod: e.target.value as 'Tại bến' | 'Dọc đường',
                                                    pickupStationId: '',
                                                    pickupStationName: '',
                                                })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                            >
                                                <option value="Tại bến">Tại bến</option>
                                                <option value="Dọc đường">Dọc đường</option>
                                            </select>
                                        </div>
                                        {formData.pickupMethod === 'Dọc đường' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                                    Trạm đón <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.pickupStationId}
                                                    onChange={e => {
                                                        const id = e.target.value;
                                                        const st = pickupStations.find(s => String(s.id) === id);
                                                        setFormData({
                                                            ...formData,
                                                            pickupStationId: id,
                                                            pickupStationName: st ? `${st.displayStt} - ${st.name}` : '',
                                                        });
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                                >
                                                    <option value="">-- Chọn trạm đón --</option>
                                                    {pickupStations.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.displayStt} - {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Thứ tự trạm theo chiều {pickupDirection === 'lk-sg' ? 'Long Khánh → Sài Gòn' : 'Sài Gòn → Long Khánh'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Thông tin khách hàng */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        placeholder="0123456789"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                    Email <span className="text-gray-500 text-xs font-normal">(để nhận xác nhận vé)</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    placeholder="example@email.com"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Nhập email để nhận thông tin xác nhận vé và mã QR qua email
                                </p>
                            </div>

                            {/* Thời gian và số ghế */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Ngày đi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Giờ xuất bến <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.departureTime}
                                        onChange={(e) => {
                                            const time = e.target.value;
                                            if (time && !isTimeSlotAvailable(time)) {
                                                setPopup({
                                                    show: true,
                                                    title: 'Không thể đặt vé',
                                                    message: `Khung giờ ${time} đã qua. Vui lòng chọn khung giờ khác hoặc chọn ngày khác.`
                                                });
                                                return;
                                            }
                                            setFormData({ ...formData, departureTime: time });
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        required
                                        disabled={!selectedRoute}
                                    >
                                        <option value="">-- Chọn giờ --</option>
                                        {selectedRoute && getTimeSlots().map((time) => (
                                            <option
                                                key={time}
                                                value={time}
                                                disabled={!isTimeSlotAvailable(time)}
                                            >
                                                {time} {!isTimeSlotAvailable(time) && '(Đã qua)'}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.date && (
                                        <p className="text-gray-600 text-xs mt-1">
                                            Các khung giờ đã qua sẽ không thể đặt
                                        </p>
                                    )}
                                    {!selectedRoute && (
                                        <p className="text-orange-600 text-xs mt-1">
                                            Vui lòng chọn tuyến đường trước
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Số ghế đã chọn
                                    </label>
                                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                                        {selectedSeats.length === 0 ? (
                                            <span className="text-gray-400 text-sm">Chọn ghế trên sơ đồ bên dưới</span>
                                        ) : (
                                            <span className="font-semibold text-gray-800">
                                                {selectedSeats.length} ghế: {selectedSeats.slice().sort((a, b) => a - b).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sơ đồ ghế */}
                            {selectedRoute && formData.departureTime && formData.date && (
                                <SeatPicker
                                    date={formData.date}
                                    departureTime={formData.departureTime}
                                    routeName={`${selectedRoute.from} - ${selectedRoute.to}`}
                                    maxSeats={10}
                                    selectedSeats={selectedSeats}
                                    onChange={setSelectedSeats}
                                />
                            )}

                            {/* Tổng tiền (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                    Tổng tiền
                                </label>
                                <input
                                    type="text"
                                    value={selectedRoute ? `${(selectedRoute.price * formData.seats).toLocaleString('vi-VN')} đ` : '0 đ'}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sky-600 font-bold text-xl cursor-not-allowed"
                                />
                            </div>

                            {/* Tổng tiền */}
                            {selectedRoute && formData.seats > 0 && (
                                <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-700">Tổng tiền:</span>
                                        <span className="text-2xl font-bold text-sky-600">
                                            {(selectedRoute.price * formData.seats).toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type={formData.departureTime && !isTimeSlotAvailable(formData.departureTime) ? 'button' : 'submit'}
                                    disabled={formData.seats === 0 || loading}
                                    onClick={(e) => {
                                        if (formData.departureTime && !isTimeSlotAvailable(formData.departureTime)) {
                                            e.preventDefault();
                                            setPopup({
                                                show: true,
                                                title: 'Không thể đặt vé',
                                                message: `Khung giờ ${formData.departureTime} đã qua. Vui lòng chọn khung giờ khác hoặc chọn ngày khác.`
                                            });
                                        }
                                    }}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                                        formData.seats === 0 || loading || (formData.departureTime && !isTimeSlotAvailable(formData.departureTime))
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-sky-500 text-white hover:bg-sky-600'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : formData.departureTime && !isTimeSlotAvailable(formData.departureTime) ? (
                                        'Khung giờ đã qua'
                                    ) : (
                                        'Đặt vé ngay'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            routeId: '',
                                            customerName: '',
                                            phone: '',
                                            email: '',
                                            date: '',
                                            departureTime: '',
                                            seats: 1,
                                            pickupMethod: 'Tại bến',
                                            pickupStationId: '',
                                            pickupStationName: '',
                                        });
                                        setSelectedRoute(null);
                                    }}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Làm mới
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Thông tin hỗ trợ */}
                    <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-semibold mb-3 text-gray-900">Cần hỗ trợ?</h3>
                        <p className="text-gray-700 mb-2">
                            Hotline: <a href="tel:02519999975" className="text-sky-700 font-semibold hover:text-sky-800">02519 999 975</a>
                        </p>
                        <p className="text-gray-700">
                            Email: <a href="mailto:vocucphuong0018@gmail.com" className="text-sky-700 font-semibold hover:text-sky-800">
                                vocucphuong0018@gmail.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DatVePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-4 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
                    <p className="text-gray-700 font-medium">Đang tải...</p>
                </div>
            </div>
        }>
            <DatVeContent />
        </Suspense>
    );
}
