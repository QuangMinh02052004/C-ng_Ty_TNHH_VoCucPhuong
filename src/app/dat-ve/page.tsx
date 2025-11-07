'use client';

import { useState } from 'react';
import { routes } from '@/data/routes';

export default function DatVePage() {
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
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Thông tin tuyến đường:</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">Thời gian:</span>
                                            <span className="ml-2 font-medium">{selectedRoute.duration}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Loại xe:</span>
                                            <span className="ml-2 font-medium">{selectedRoute.busType}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Ghế trống:</span>
                                            <span className="ml-2 font-medium text-green-600">{selectedRoute.availableSeats} chỗ</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Giá vé:</span>
                                            <span className="ml-2 font-medium text-blue-600">{selectedRoute.price.toLocaleString('vi-VN')} đ</span>
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
                                    >
                                        <option value="">-- Chọn giờ --</option>
                                        <option value="05:30" disabled={!isTimeSlotAvailable('05:30')}>05:30 {!isTimeSlotAvailable('05:30') && '(Không khả dụng)'}</option>
                                        <option value="06:00" disabled={!isTimeSlotAvailable('06:00')}>06:00 {!isTimeSlotAvailable('06:00') && '(Không khả dụng)'}</option>
                                        <option value="06:30" disabled={!isTimeSlotAvailable('06:30')}>06:30 {!isTimeSlotAvailable('06:30') && '(Không khả dụng)'}</option>
                                        <option value="07:00" disabled={!isTimeSlotAvailable('07:00')}>07:00 {!isTimeSlotAvailable('07:00') && '(Không khả dụng)'}</option>
                                        <option value="07:30" disabled={!isTimeSlotAvailable('07:30')}>07:30 {!isTimeSlotAvailable('07:30') && '(Không khả dụng)'}</option>
                                        <option value="08:00" disabled={!isTimeSlotAvailable('08:00')}>08:00 {!isTimeSlotAvailable('08:00') && '(Không khả dụng)'}</option>
                                        <option value="08:30" disabled={!isTimeSlotAvailable('08:30')}>08:30 {!isTimeSlotAvailable('08:30') && '(Không khả dụng)'}</option>
                                        <option value="09:00" disabled={!isTimeSlotAvailable('09:00')}>09:00 {!isTimeSlotAvailable('09:00') && '(Không khả dụng)'}</option>
                                        <option value="09:30" disabled={!isTimeSlotAvailable('09:30')}>09:30 {!isTimeSlotAvailable('09:30') && '(Không khả dụng)'}</option>
                                        <option value="10:00" disabled={!isTimeSlotAvailable('10:00')}>10:00 {!isTimeSlotAvailable('10:00') && '(Không khả dụng)'}</option>
                                        <option value="10:30" disabled={!isTimeSlotAvailable('10:30')}>10:30 {!isTimeSlotAvailable('10:30') && '(Không khả dụng)'}</option>
                                        <option value="11:00" disabled={!isTimeSlotAvailable('11:00')}>11:00 {!isTimeSlotAvailable('11:00') && '(Không khả dụng)'}</option>
                                        <option value="11:30" disabled={!isTimeSlotAvailable('11:30')}>11:30 {!isTimeSlotAvailable('11:30') && '(Không khả dụng)'}</option>
                                        <option value="12:00" disabled={!isTimeSlotAvailable('12:00')}>12:00 {!isTimeSlotAvailable('12:00') && '(Không khả dụng)'}</option>
                                        <option value="12:30" disabled={!isTimeSlotAvailable('12:30')}>12:30 {!isTimeSlotAvailable('12:30') && '(Không khả dụng)'}</option>
                                        <option value="13:00" disabled={!isTimeSlotAvailable('13:00')}>13:00 {!isTimeSlotAvailable('13:00') && '(Không khả dụng)'}</option>
                                        <option value="13:30" disabled={!isTimeSlotAvailable('13:30')}>13:30 {!isTimeSlotAvailable('13:30') && '(Không khả dụng)'}</option>
                                        <option value="14:00" disabled={!isTimeSlotAvailable('14:00')}>14:00 {!isTimeSlotAvailable('14:00') && '(Không khả dụng)'}</option>
                                        <option value="14:30" disabled={!isTimeSlotAvailable('14:30')}>14:30 {!isTimeSlotAvailable('14:30') && '(Không khả dụng)'}</option>
                                        <option value="15:00" disabled={!isTimeSlotAvailable('15:00')}>15:00 {!isTimeSlotAvailable('15:00') && '(Không khả dụng)'}</option>
                                        <option value="15:30" disabled={!isTimeSlotAvailable('15:30')}>15:30 {!isTimeSlotAvailable('15:30') && '(Không khả dụng)'}</option>
                                        <option value="16:00" disabled={!isTimeSlotAvailable('16:00')}>16:00 {!isTimeSlotAvailable('16:00') && '(Không khả dụng)'}</option>
                                        <option value="16:30" disabled={!isTimeSlotAvailable('16:30')}>16:30 {!isTimeSlotAvailable('16:30') && '(Không khả dụng)'}</option>
                                        <option value="17:00" disabled={!isTimeSlotAvailable('17:00')}>17:00 {!isTimeSlotAvailable('17:00') && '(Không khả dụng)'}</option>
                                        <option value="17:30" disabled={!isTimeSlotAvailable('17:30')}>17:30 {!isTimeSlotAvailable('17:30') && '(Không khả dụng)'}</option>
                                        <option value="18:00" disabled={!isTimeSlotAvailable('18:00')}>18:00 {!isTimeSlotAvailable('18:00') && '(Không khả dụng)'}</option>
                                        <option value="18:30" disabled={!isTimeSlotAvailable('18:30')}>18:30 {!isTimeSlotAvailable('18:30') && '(Không khả dụng)'}</option>
                                        <option value="19:00" disabled={!isTimeSlotAvailable('19:00')}>19:00 {!isTimeSlotAvailable('19:00') && '(Không khả dụng)'}</option>
                                        <option value="19:30" disabled={!isTimeSlotAvailable('19:30')}>19:30 {!isTimeSlotAvailable('19:30') && '(Không khả dụng)'}</option>
                                        <option value="20:00" disabled={!isTimeSlotAvailable('20:00')}>20:00 {!isTimeSlotAvailable('20:00') && '(Không khả dụng)'}</option>
                                    </select>
                                    {formData.date && (
                                        <p className="text-gray-500 text-xs mt-1">
                                            ⏰ Các khung giờ đã qua sẽ không thể đặt
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
