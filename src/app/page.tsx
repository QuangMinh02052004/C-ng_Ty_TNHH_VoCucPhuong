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
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Tuyến đường phổ biến
            </h2>
            <p className="text-gray-600 text-lg">⭐ Được khách hàng tin tưởng lựa chọn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {routes.slice(0, 6).map((route, index) => (
              <div
                key={route.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 w-full max-w-sm mx-auto flex flex-col overflow-hidden border-2 border-transparent hover:border-blue-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hiệu ứng gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Badge hot */}
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce z-10">
                    🔥 HOT
                  </div>
                )}

                <div className="relative p-6">
                  <RouteArrow from={route.from} to={route.to} />

                  {/* Khung giờ hoạt động - Nổi bật phía trên */}
                  <div className="mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] rounded-xl shadow-lg">
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-2 text-gray-700">
                          <span className="text-2xl">🕐</span>
                          <span>Khung giờ hoạt động:</span>
                        </span>
                      </div>
                      <div className="mt-2 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-3 rounded-lg">
                        <p className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {getRouteTimeRange(route.id)}
                        </p>
                        <p className="text-center text-xs text-gray-600 mt-1">
                          ⏰ Xe chạy mỗi 30 phút
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="space-y-3 text-gray-600 flex-grow bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="font-semibold flex items-center gap-2">
                        <span className="text-xl">💰</span> Giá vé:
                      </span>
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {route.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="font-semibold flex items-center gap-2">
                        <span className="text-xl">⏱️</span> Thời gian:
                      </span>
                      <span className="font-bold text-gray-700">{route.duration}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="font-semibold flex items-center gap-2">
                        <span className="text-xl">🚌</span> Loại xe:
                      </span>
                      <span className="font-bold text-gray-700">{route.busType}</span>
                    </div>
                  </div>

                  {/* Button đặt vé */}
                  <Link
                    href={`/dat-ve?route=${route.id}`}
                    className="mt-6 block w-full relative overflow-hidden group/button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-shimmer"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                      <span>🎫</span>
                      <span>Đặt vé ngay</span>
                      <svg className="w-5 h-5 group-hover/button:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
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
