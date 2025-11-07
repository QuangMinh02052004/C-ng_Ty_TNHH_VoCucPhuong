import Link from 'next/link';
import { routes } from '@/data/routes';
import RouteArrow from '@/components/RouteArrow';

export default function TuyenDuongPage() {
    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Tuyến đường và Giá vé</h1>
                    <p className="text-lg text-gray-600">
                        Chúng tôi phục vụ nhiều tuyến đường liên tỉnh với lịch trình đa dạng
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routes.map((route) => (
                        <div key={route.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition w-full max-w-sm mx-auto flex flex-col">
                            <RouteArrow from={route.from} to={route.to} />

                            <div className="space-y-3 flex-grow">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">💰 Giá vé:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {route.price.toLocaleString('vi-VN')} đ
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">⏱️ Thời gian:</span>
                                    <span className="font-semibold">{route.duration}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">🚌 Loại xe:</span>
                                    <span className="font-semibold">{route.busType}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">💺 Ghế trống:</span>
                                    <span className="font-semibold text-green-600">{route.availableSeats} chỗ</span>
                                </div>

                                <div className="pt-3 border-t">
                                    <p className="text-sm text-gray-600 mb-2">🕐 Giờ xuất bến:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {route.departureTime.map((time, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                                            >
                                                {time}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/dat-ve?route=${route.id}`}
                                className="mt-6 block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Đặt vé ngay
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-blue-50 rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-4 text-center">Lưu ý quan trọng</h2>
                    <ul className="space-y-2 max-w-2xl mx-auto">
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">✓</span>
                            <span>Vui lòng có mặt tại bến xe trước giờ xuất bến 15 phút</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">✓</span>
                            <span>Mang theo CMND/CCCD để kiểm tra khi cần thiết</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">✓</span>
                            <span>Giá vé có thể thay đổi vào các dịp lễ, Tết</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">✓</span>
                            <span>Liên hệ hotline 0123 456 789 để biết thêm chi tiết</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
