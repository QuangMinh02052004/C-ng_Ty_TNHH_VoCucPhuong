'use client';

import Link from 'next/link';
import { routes as fallbackRoutes } from '@/data/routes';
import { useState, useEffect, useMemo } from 'react';
import { Route } from '@/types';

function inferRouteType(r: Route): 'cao_toc' | 'quoc_lo' {
    if (r.routeType) return r.routeType;
    return /quốc\s*lộ/i.test(r.to) ? 'quoc_lo' : 'cao_toc';
}

function RouteCard({ route, selectedTime, onSelectTime }: {
    route: Route;
    selectedTime: string | undefined;
    onSelectTime: (time: string) => void;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
            <div className="relative h-40 bg-gradient-to-br from-sky-50 to-white overflow-hidden">
                <img src="/xe.png" alt="Xe Võ Cúc Phương" className="w-full h-full object-cover" />
            </div>

            <div className="p-5">
                <div className="relative mb-5 pb-5 border-b border-gray-100">
                    <div className="absolute left-[11px] top-6 bottom-6 border-l-2 border-dashed border-sky-300"></div>
                    <div className="flex items-center gap-3 mb-5 relative">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center bg-white z-10">
                            <div className="w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
                        </div>
                        <p className="text-base font-semibold text-gray-800">{route.from}</p>
                    </div>
                    <div className="flex items-center gap-3 relative">
                        <div className="w-6 h-6 rounded-full border-2 border-sky-500 flex items-center justify-center bg-white z-10">
                            <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>
                        </div>
                        <p className="text-base font-semibold text-gray-800">{route.to}</p>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-2.5">
                        <span className="text-sky-700 font-medium text-sm">Giá vé</span>
                        <span className="ml-auto font-bold text-gray-900">{route.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-2.5">
                        <span className="text-sky-700 font-medium text-sm">Thời gian</span>
                        <span className="ml-auto font-semibold text-gray-900">{route.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-2.5">
                        <span className="text-sky-700 font-medium text-sm">Loại xe</span>
                        <span className="ml-auto font-semibold text-gray-900">{route.busType}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-sky-50 rounded-lg p-2.5">
                        <span className="text-sky-700 font-medium text-sm">Ghế trống</span>
                        <span className="ml-auto font-semibold text-green-600">{route.availableSeats} chỗ</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-3 mb-4 border border-sky-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Chọn giờ xuất bến:</p>
                    <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
                        {route.departureTime.map((time, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelectTime(time)}
                                className={`px-2 py-1.5 rounded-md text-sm font-semibold transition-all ${selectedTime === time
                                    ? 'bg-sky-500 text-white shadow-sm'
                                    : 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-100'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-2">
                        Chuyến mới mỗi 30 phút ({route.departureTime.length} chuyến/ngày)
                    </p>
                </div>

                <Link
                    href={`/dat-ve?route=${route.id}${selectedTime ? `&time=${selectedTime}` : ''}`}
                    className="block w-full bg-sky-500 hover:bg-sky-600 text-white text-center py-2.5 px-6 rounded-lg font-semibold transition-colors duration-200"
                >
                    Đặt vé ngay
                </Link>
            </div>
        </div>
    );
}

export default function TuyenDuongPage() {
    const [routes, setRoutes] = useState<Route[]>(fallbackRoutes);
    const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetch('/api/routes')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data) && data.length > 0) setRoutes(data); })
            .catch(() => { /* fallback already set */ });
    }, []);

    const { caoToc, quocLo } = useMemo(() => {
        const cao: Route[] = [];
        const quoc: Route[] = [];
        for (const r of routes) {
            if (inferRouteType(r) === 'cao_toc') cao.push(r);
            else quoc.push(r);
        }
        return { caoToc: cao, quocLo: quoc };
    }, [routes]);

    const handleTimeSelect = (routeId: string, time: string) => {
        setSelectedTimes(prev => ({
            ...prev,
            [routeId]: prev[routeId] === time ? '' : time,
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

                <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-gray-300">
                    {/* Cột Cao tốc */}
                    <section className="lg:pr-8">
                        <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Cao tốc</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Đi nhanh, tiết kiệm thời gian</p>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{caoToc.length} tuyến</span>
                        </div>

                        {caoToc.length === 0 ? (
                            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
                                Chưa có tuyến cao tốc
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                                {caoToc.map((route) => (
                                    <RouteCard
                                        key={route.id}
                                        route={route}
                                        selectedTime={selectedTimes[route.id]}
                                        onSelectTime={(t) => handleTimeSelect(route.id, t)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Cột Quốc lộ */}
                    <section className="mt-10 lg:mt-0 lg:pl-8">
                        <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Quốc lộ</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Lộ trình truyền thống, ghé nhiều điểm</p>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{quocLo.length} tuyến</span>
                        </div>

                        {quocLo.length === 0 ? (
                            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
                                Chưa có tuyến quốc lộ
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
                                {quocLo.map((route) => (
                                    <RouteCard
                                        key={route.id}
                                        route={route}
                                        selectedTime={selectedTimes[route.id]}
                                        onSelectTime={(t) => handleTimeSelect(route.id, t)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Lưu ý quan trọng</h2>
                    <ul className="space-y-2.5 max-w-2xl mx-auto list-disc list-inside marker:text-sky-500">
                        <li className="text-gray-700">Vui lòng có mặt tại bến xe trước giờ xuất bến 15 phút</li>
                        <li className="text-gray-700">Mang theo CMND/CCCD để kiểm tra khi cần thiết</li>
                        <li className="text-gray-700">Giá vé có thể thay đổi vào các dịp lễ, Tết</li>
                        <li className="text-gray-700">Liên hệ hotline 02519 999 975 để biết thêm chi tiết</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
