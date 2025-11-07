'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { routes } from '@/data/routes';

export default function DatVePage() {
    const searchParams = useSearchParams();
    const routeIdFromUrl = searchParams.get('route');
    const timeFromUrl = searchParams.get('time');

    const [formData, setFormData] = useState({
        routeId: '',
        customerName: '',
        phone: '',
        email: '',
        date: '',
        departureTime: '',
        seats: 1,
    });

    const [selectedRoute, setSelectedRoute] = useState<typeof routes[0] | null>(null);

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
    }, [routeIdFromUrl, timeFromUrl]);

    // Lấy danh sách khung giờ theo tuyến đường
    const getTimeSlots = () => {
        if (!selectedRoute) return [];

        const routeId = selectedRoute.id;
        let startHour = 5;
        let startMinute = 30;
        let endHour = 20;
        let endMinute = 0;

        // Cấu hình khung giờ theo từng tuyến
        switch (routeId) {
            case '5': // Sài Gòn → Xuân Lộc (Cao tốc): 5h30 - 18h30
                startHour = 5;
                startMinute = 30;
                endHour = 18;
                endMinute = 30;
                break;
            case '3': // Sài Gòn → Long Khánh (Cao tốc): 5h30 - 20h
            case '4': // Sài Gòn → Long Khánh (Quốc lộ): 5h30 - 20h
                startHour = 5;
                startMinute = 30;
                endHour = 20;
                endMinute = 0;
                break;
            case '6': // Sài Gòn → Xuân Lộc (Quốc lộ): 5h30 - 17h
                startHour = 5;
                startMinute = 30;
                endHour = 17;
                endMinute = 0;
                break;
            case '7': // Xuân Lộc → Sài Gòn (Cao tốc): 3h30 - 17h
            case '8': // Xuân Lộc → Sài Gòn (Quốc lộ): 3h30 - 17h
                startHour = 3;
                startMinute = 30;
                endHour = 17;
                endMinute = 0;
                break;
            case '1': // Long Khánh → Sài Gòn (Cao tốc): 3h30 - 18h
            case '2': // Long Khánh → Sài Gòn (Quốc lộ): 3h30 - 18h
                startHour = 3;
                startMinute = 30;
                endHour = 18;
                endMinute = 0;
                break;
            default:
                startHour = 5;
                startMinute = 30;
                endHour = 20;
                endMinute = 0;
        }

        // Tạo danh sách khung giờ (mỗi 30 phút)
        const timeSlots: string[] = [];
        let currentHour = startHour;
        let currentMinute = startMinute;

        while (
            currentHour < endHour ||
            (currentHour === endHour && currentMinute <= endMinute)
        ) {
            const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            timeSlots.push(timeString);

            // Tăng 30 phút
            currentMinute += 30;
            if (currentMinute >= 60) {
                currentMinute = 0;
                currentHour += 1;
            }
        }

        return timeSlots;
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.routeId || !formData.customerName || !formData.phone || !formData.date || !formData.departureTime) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (formData.seats <= 0) {
            alert('Vui lòng chọn ít nhất 1 ghế để đặt vé!');
            return;
        }

        const totalPrice = selectedRoute ? selectedRoute.price * formData.seats : 0;

        alert(`Đặt vé thành công!\n\nThông tin đặt vé:\n` +
            `Tuyến: ${selectedRoute?.from} → ${selectedRoute?.to}\n` +
            `Họ tên: ${formData.customerName}\n` +
            `Số điện thoại: ${formData.phone}\n` +
            `Ngày đi: ${formData.date}\n` +
            `Giờ xuất bến: ${formData.departureTime}\n` +
            `Số ghế: ${formData.seats}\n` +
            `Tổng tiền: ${totalPrice.toLocaleString('vi-VN')} đ\n\n` +
            `Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất!`
        );

        // Reset form
        setFormData({
            routeId: '',
            customerName: '',
            phone: '',
            email: '',
            date: '',
            departureTime: '',
            seats: 1,
        });
        setSelectedRoute(null);
    };

    return (
        <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4">Đặt vé trực tuyến</h1>
                        <p className="text-lg text-gray-600">
                            Điền thông tin dưới đây để đặt vé nhanh chóng
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Chọn tuyến đường */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tuyến đường <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.routeId}
                                    onChange={(e) => handleRouteChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 rounded-xl border-2 border-blue-200">
                                    <h3 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
                                        <span className="text-2xl">ℹ️</span>
                                        Thông tin tuyến đường
                                    </h3>
                                    <div className="space-y-3">
                                        {/* Khung giờ hoạt động */}
                                        <div className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-md">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-2xl">🕐</span>
                                                <span className="font-bold text-blue-800">Khung giờ hoạt động:</span>
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
                                                <p className="text-center text-lg font-bold text-gray-800">
                                                    {(() => {
                                                        const slots = getTimeSlots();
                                                        if (slots.length > 0) {
                                                            return `${slots[0]} - ${slots[slots.length - 1]}`;
                                                        }
                                                        return 'Vui lòng chọn tuyến';
                                                    })()}
                                                </p>
                                                <p className="text-center text-sm text-gray-600 mt-1">
                                                    ⏰ Xe chạy mỗi 30 phút
                                                </p>
                                            </div>
                                        </div>

                                        {/* Thông tin khác */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold flex items-center gap-2">
                                                        <span className="text-xl">⏱️</span>
                                                        Thời gian:
                                                    </span>
                                                    <span className="font-bold text-gray-700">{selectedRoute.duration}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold flex items-center gap-2">
                                                        <span className="text-xl">🚌</span>
                                                        Loại xe:
                                                    </span>
                                                    <span className="font-bold text-gray-700">{selectedRoute.busType}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold flex items-center gap-2">
                                                        <span className="text-xl">💺</span>
                                                        Ghế trống:
                                                    </span>
                                                    <span className="font-bold text-green-600">{selectedRoute.availableSeats} chỗ</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold flex items-center gap-2">
                                                        <span className="text-xl">💰</span>
                                                        Giá vé:
                                                    </span>
                                                    <span className="font-bold text-blue-600">{selectedRoute.price.toLocaleString('vi-VN')} đ</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Thông tin khách hàng */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0123456789"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="example@email.com"
                                />
                            </div>

                            {/* Thời gian và số ghế */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Ngày đi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Giờ xuất bến <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.departureTime}
                                        onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                {time} {!isTimeSlotAvailable(time) && '(Không khả dụng)'}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.date && (
                                        <p className="text-gray-500 text-xs mt-1">
                                            ⏰ Các khung giờ đã qua sẽ không thể đặt
                                        </p>
                                    )}
                                    {!selectedRoute && (
                                        <p className="text-orange-500 text-xs mt-1">
                                            ℹ️ Vui lòng chọn tuyến đường trước
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Số ghế <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.seats}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Nếu xóa hết hoặc nhập rỗng, set về 0
                                            if (value === '' || value === null) {
                                                setFormData({ ...formData, seats: 0 });
                                            } else {
                                                setFormData({ ...formData, seats: parseInt(value) || 0 });
                                            }
                                        }}
                                        onFocus={(e) => {
                                            // Khi focus vào input, nếu giá trị là 0 thì select hết để dễ nhập
                                            if (formData.seats === 0) {
                                                e.target.select();
                                            }
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        max="10"
                                        required
                                    />
                                    {formData.seats === 0 && (
                                        <p className="text-red-500 text-sm mt-1">
                                            ⚠️ Vui lòng chọn ít nhất 1 ghế
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Tổng tiền (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tổng tiền
                                </label>
                                <input
                                    type="text"
                                    value={selectedRoute ? `${(selectedRoute.price * formData.seats).toLocaleString('vi-VN')} đ` : '0 đ'}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-green-600 font-bold text-xl cursor-not-allowed"
                                />
                            </div>

                            {/* Tổng tiền */}
                            {selectedRoute && formData.seats > 0 && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">Tổng tiền:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {(selectedRoute.price * formData.seats).toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={formData.seats === 0}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition ${formData.seats === 0
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    Đặt vé ngay
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
                    <div className="mt-8 bg-blue-50 rounded-lg p-6">
                        <h3 className="font-semibold mb-3">📞 Cần hỗ trợ?</h3>
                        <p className="text-gray-600 mb-2">
                            Liên hệ hotline: <a href="tel:02519 999 975" className="text-blue-600 font-semibold">02519 999 975</a>
                        </p>
                        <p className="text-gray-600">
                            Email: <a href="mailto:
vocucphuong0018@gmail.com" className="text-blue-600 font-semibold">
                                vocucphuong0018@gmail.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
