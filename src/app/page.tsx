import Link from 'next/link';
import { routes } from '@/data/routes';
import HeroCarousel from '@/components/HeroCarousel';
import RouteArrow from '@/components/RouteArrow';

// Helper function để lấy khung giờ theo tuyến
function getRouteTimeRange(routeId: string): string {
  switch (routeId) {
    case '5': // Sài Gòn → Xuân Lộc (Cao tốc)
      return '05:30 - 18:30';
    case '3': // Sài Gòn → Long Khánh (Cao tốc)
    case '4': // Sài Gòn → Long Khánh (Quốc lộ)
      return '05:30 - 20:00';
    case '6': // Sài Gòn → Xuân Lộc (Quốc lộ)
      return '05:30 - 17:00';
    case '7': // Xuân Lộc → Sài Gòn (Cao tốc)
    case '8': // Xuân Lộc → Sài Gòn (Quốc lộ)
      return '03:30 - 17:00';
    case '1': // Long Khánh → Sài Gòn (Cao tốc)
    case '2': // Long Khánh → Sài Gòn (Quốc lộ)
      return '03:30 - 18:00';
    default:
      return '05:30 - 20:00';
  }
}

export default function Home() {
  return (
    <div>
      <HeroCarousel />

      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-gray-600 text-lg">🌟 Cam kết mang đến trải nghiệm tốt nhất</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200">
              <div className="relative inline-block mb-6">
                <div className="text-7xl animate-float">🚌</div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">New</div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">Đội xe hiện đại</h3>
              <p className="text-gray-600 leading-relaxed">
                Xe đời mới, tiện nghi đầy đủ, bảo dưỡng định kỳ để đảm bảo an toàn tuyệt đối
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-semibold">
                ⭐ Chất lượng 5 sao
              </div>
            </div>
            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-200" style={{ animationDelay: '0.1s' }}>
              <div className="relative inline-block mb-6">
                <div className="text-7xl animate-float" style={{ animationDelay: '0.5s' }}>⏰</div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-green-600 transition-colors">Đúng giờ</h3>
              <p className="text-gray-600 leading-relaxed">
                Cam kết xuất bến đúng giờ, tôn trọng thời gian quý báu của khách hàng
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-green-50 rounded-full text-green-600 text-sm font-semibold">
                ✓ Đúng giờ 99.9%
              </div>
            </div>
            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-200" style={{ animationDelay: '0.2s' }}>
              <div className="relative inline-block mb-6">
                <div className="text-7xl animate-float" style={{ animationDelay: '1s' }}>🛡️</div>
                <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">An toàn</h3>
              <p className="text-gray-600 leading-relaxed">
                Lái xe chuyên nghiệp, bảo hiểm đầy đủ cho hành khách trên mọi hành trình
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-sm font-semibold">
                🏆 Chứng nhận an toàn
              </div>
            </div>
            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-200" style={{ animationDelay: '0.3s' }}>
              <div className="relative inline-block mb-6">
                <div className="text-7xl animate-float" style={{ animationDelay: '1.5s' }}>💰</div>
                <div className="absolute -top-1 -right-1 text-2xl animate-bounce">✨</div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-orange-600 transition-colors">Giá cạnh tranh</h3>
              <p className="text-gray-600 leading-relaxed">
                Giá vé hợp lý, nhiều ưu đãi hấp dẫn cho khách hàng thân thiết
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-orange-50 rounded-full text-orange-600 text-sm font-semibold">
                💝 Ưu đãi đến 20%
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 mb-3">
              Tuyến đường phổ biến
            </h2>
            <p className="text-gray-600 text-lg">Được khách hàng tin tưởng lựa chọn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {routes.slice(0, 6).map((route, index) => (
              <div
                key={route.id}
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-sm mx-auto flex flex-col overflow-hidden border border-gray-200"
              >
                {/* Badge hot */}
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                    HOT
                  </div>
                )}

                <div className="relative p-6">
                  {/* Điểm đi - Điểm đến đơn giản */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Điểm đi</p>
                        <p className="text-sm font-bold text-gray-800">{route.from}</p>
                      </div>
                    </div>

                    {/* Đường nét đứt với mũi tên */}
                    <div className="flex justify-center py-1">
                      <div className="flex flex-col items-center">
                        <div className="h-8 border-l-2 border-dashed border-blue-400"></div>
                        <svg className="w-5 h-5 text-blue-500 -mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Điểm đến</p>
                        <p className="text-sm font-bold text-gray-800">{route.to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Khung giờ hoạt động - Đơn giản */}
                  <div className="mb-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700 text-sm">
                        🕐 Khung giờ hoạt động:
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-center text-xl font-bold text-blue-600">
                        {getRouteTimeRange(route.id)}
                      </p>
                      <p className="text-center text-xs text-gray-500 mt-1">
                        Xe chạy mỗi 30 phút
                      </p>
                    </div>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">Giá vé:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {route.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">Thời gian:</span>
                      <span className="font-semibold text-gray-800">{route.duration}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">Loại xe:</span>
                      <span className="font-semibold text-gray-800">{route.busType}</span>
                    </div>
                  </div>

                  {/* Button đặt vé - Đơn giản */}
                  <Link
                    href={`/dat-ve?route=${route.id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Đặt vé ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/tuyen-duong"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
            >
              <span className="text-xl">🗺️</span>
              <span>Xem tất cả tuyến đường</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng cho chuyến đi của bạn?</h2>
          <p className="text-xl mb-8">Đặt vé trực tuyến ngay hôm nay để nhận ưu đãi đặc biệt</p>
          <Link
            href="/dat-ve"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Đặt vé ngay
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Liên hệ với chúng tôi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl mb-3">📞</div>
                <h3 className="font-semibold mb-2">Hotline</h3>
                <a href="tel: 02519.999.975" className="text-blue-600 hover:text-blue-700">
                  02519 999 975
                </a>
              </div>
              <div>
                <div className="text-4xl mb-3">📧</div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:
vocucphuong0018@gmail.com" className="text-blue-600 hover:text-blue-700">

                  vocucphuong0018@gmail.com
                </a>
              </div>
              <div>
                <div className="text-4xl mb-3">📍</div>
                <h3 className="font-semibold mb-2">Văn phòng</h3>
                <p className="text-gray-600">Quận 5: 97i đường Nguyễn Duy Dương, phường 9, quận 5, Thành phố Hồ Chí Minh</p>
                <p className="text-gray-600">Hàng Xanh: 496B đường Điện Biên Phủ, phường 21, quận Bình Thạnh, Thành phố Hồ Chí Minh</p>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
