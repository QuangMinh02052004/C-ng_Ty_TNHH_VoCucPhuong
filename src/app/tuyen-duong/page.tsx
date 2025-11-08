'use client';

import Link from 'next/link';
import { routes } from '@/data/routes';
import { useState } from 'react';


// Helper function để generate tất cả khung giờ
function generateTimeSlots(startTime: string, endTime: string): string[] {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
        const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        slots.push(timeString);

        // Tăng 30 phút
        currentMinute += 30;
        if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour += 1;
        }
    }

    return slots;
}

// Helper function để lấy khung giờ theo tuyến
function getRouteTimeSlots(routeId: string): string[] {
    switch (routeId) {
        case '5': // Sài Gòn → Xuân Lộc (Cao tốc)
            return generateTimeSlots('05:30', '18:30');
        case '3': // Sài Gòn → Long Khánh (Cao tốc)
        case '4': // Sài Gòn → Long Khánh (Quốc lộ)
            return generateTimeSlots('05:30', '20:00');
        case '6': // Sài Gòn → Xuân Lộc (Quốc lộ)
            return generateTimeSlots('05:30', '17:00');
        case '7': // Xuân Lộc → Sài Gòn (Cao tốc)
        case '8': // Xuân Lộc → Sài Gòn (Quốc lộ)
            return generateTimeSlots('03:30', '17:00');
        case '1': // Long Khánh → Sài Gòn (Cao tốc)
        case '2': // Long Khánh → Sài Gòn (Quốc lộ)
            return generateTimeSlots('03:30', '18:00');
        default:
            return generateTimeSlots('05:30', '20:00');
    }
}

export default function TuyenDuongPage() {
    const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: string }>({});

    const handleTimeSelect = (routeId: string, time: string) => {
        setSelectedTimes(prev => ({
            ...prev,
            [routeId]: prev[routeId] === time ? '' : time
        }));
    };

    return (
        <div className="py-16 bg-gradient-to-b from-sky-50 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Tuyến đường và Giá vé</h1>
                    <p className="text-lg text-gray-600">
                        Chúng tôi phục vụ nhiều tuyến đường liên tỉnh với lịch trình đa dạng
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routes.map((route) => (
                        <div key={route.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
                            {/* Hình ảnh xe */}
                            <div className="relative h-48 bg-gradient-to-br from-sky-50 to-white overflow-hidden">
                                <img
                                    src="/xe.png"
                                    alt="Xe Võ Cúc Phương"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-5">
                                {/* Điểm đi - Điểm đến */}
                                <div className="relative mb-6 pb-6 border-b border-gray-100">
                                    {/* Đường nét đứt dọc */}
                                    <div className="absolute left-[11px] top-6 bottom-6 border-l-2 border-dashed border-sky-300"></div>

                                    {/* Điểm đi */}
                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center bg-white z-10">
                                            <div className="w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
                                        </div>
                                        <p className="text-base font-semibold text-gray-800">{route.from}</p>
                                    </div>

                                    {/* Điểm đến */}
                                    <div className="flex items-center gap-3 relative">
                                        <div className="w-6 h-6 rounded-full border-2 border-sky-500 flex items-center justify-center bg-white z-10">
                                            <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>
                                        </div>
                                        <p className="text-base font-semibold text-gray-800">{route.to}</p>
                                    </div>
                                </div>

                                {/* Thông tin chi tiết */}
                                <div className="space-y-2.5 mb-5">
                                    {/* Giá vé */}
                                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-3">
                                        <span className="text-xl">💰</span>
                                        <span className="text-sky-700 font-medium text-sm">Giá vé</span>
                                        <span className="ml-auto font-bold text-gray-900">{route.price.toLocaleString('vi-VN')} đ</span>
                                    </div>

                                    {/* Thời gian */}
                                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-3">
                                        <span className="text-xl">⏱️</span>
                                        <span className="text-sky-700 font-medium text-sm">Thời gian</span>
                                        <span className="ml-auto font-semibold text-gray-900">{route.duration}</span>
                                    </div>

                                    {/* Loại xe */}
                                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-3">
                                        <span className="text-xl">🚌</span>
                                        <span className="text-sky-700 font-medium text-sm">Loại xe</span>
                                        <span className="ml-auto font-semibold text-gray-900">{route.busType}</span>
                                    </div>

                                    {/* Ghế trống */}
                                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-3">
                                        <span className="text-xl">💺</span>
                                        <span className="text-sky-700 font-medium text-sm">Ghế trống</span>
                                        <span className="ml-auto font-semibold text-green-600">{route.availableSeats} chỗ</span>
                                    </div>
                                </div>

                                {/* Khung giờ hoạt động - Cho phép chọn giờ */}
                                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 mb-4 border border-sky-100">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Chọn giờ xuất bến:</p>
                                    <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                        {getRouteTimeSlots(route.id).map((time, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleTimeSelect(route.id, time)}
                                                className={`px-2 py-2 rounded-md text-sm font-semibold transition-all ${selectedTimes[route.id] === time
                                                    ? 'bg-sky-500 text-white shadow-sm'
                                                    : 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-100'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-xs text-gray-600 mt-3">
                                        🔄 Chuyến mới mỗi 30 phút ({getRouteTimeSlots(route.id).length} chuyến/ngày)
                                    </p>
                                </div>

                                {/* Button đặt vé */}
                                <Link
                                    href={`/dat-ve?route=${route.id}${selectedTimes[route.id] ? `&time=${selectedTimes[route.id]}` : ''}`}
                                    className="block w-full bg-sky-500 hover:bg-sky-600 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
                                >
                                    Đặt vé ngay
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Lưu ý quan trọng</h2>
                    <ul className="space-y-3 max-w-2xl mx-auto">
                        <li className="flex items-start gap-3">
                            <span className="text-sky-500 text-xl flex-shrink-0">✓</span>
                            <span className="text-gray-700">Vui lòng có mặt tại bến xe trước giờ xuất bến 15 phút</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-sky-500 text-xl flex-shrink-0">✓</span>
                            <span className="text-gray-700">Mang theo CMND/CCCD để kiểm tra khi cần thiết</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-sky-500 text-xl flex-shrink-0">✓</span>
                            <span className="text-gray-700">Giá vé có thể thay đổi vào các dịp lễ, Tết</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-sky-500 text-xl flex-shrink-0">✓</span>
                            <span className="text-gray-700">Liên hệ hotline 02519 999 975 để biết thêm chi tiết</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
