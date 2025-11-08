import Link from 'next/link';
import { routes } from '@/data/routes';
import HeroCarousel from '@/components/HeroCarousel';
import RouteArrow from '@/components/RouteArrow';

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

export default function Home() {
  return (
    <div>
      <HeroCarousel />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-gray-600 text-lg">Cam kết mang đến trải nghiệm tốt nhất</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors duration-300 border border-sky-100">
              <div className="text-5xl mb-4">🚌</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Đội xe hiện đại</h3>
              <p className="text-gray-600 text-sm">
                Xe đời mới, tiện nghi đầy đủ, bảo dưỡng định kỳ
              </p>
            </div>
            <div className="text-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors duration-300 border border-sky-100">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Đúng giờ</h3>
              <p className="text-gray-600 text-sm">
                Cam kết xuất bến đúng giờ, tôn trọng thời gian của bạn
              </p>
            </div>
            <div className="text-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors duration-300 border border-sky-100">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">An toàn</h3>
              <p className="text-gray-600 text-sm">
                Lái xe chuyên nghiệp, bảo hiểm đầy đủ cho hành khách
              </p>
            </div>
            <div className="text-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors duration-300 border border-sky-100">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Giá cạnh tranh</h3>
              <p className="text-gray-600 text-sm">
                Giá vé hợp lý, nhiều ưu đãi hấp dẫn
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Tuyến đường phổ biến
            </h2>
            <p className="text-gray-600 text-lg">Được khách hàng tin tưởng lựa chọn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.slice(0, 6).map((route, index) => (
              <div
                key={route.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
              >
                {/* Hình ảnh xe */}
                <div className="relative h-48 bg-gradient-to-br from-sky-50 to-white overflow-hidden">
                  <img
                    src="/xe.png"
                    alt="Xe Võ Cúc Phương"
                    className="w-full h-full object-cover"
                  />
                  {index < 3 && (
                    <div className="absolute top-3 right-3 bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      HOT
                    </div>
                  )}
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
                  </div>

                  {/* Khung giờ hoạt động */}
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-4 mb-4 border border-sky-100">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Giờ đầu</p>
                        <p className="text-2xl font-bold text-sky-600">
                          {getRouteTimeSlots(route.id)[0]}
                        </p>
                      </div>
                      <div className="text-2xl text-sky-400">→</div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Giờ cuối</p>
                        <p className="text-2xl font-bold text-sky-600">
                          {getRouteTimeSlots(route.id)[getRouteTimeSlots(route.id).length - 1]}
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-600 mt-3">
                      🔄 Chuyến mới mỗi 30 phút ({getRouteTimeSlots(route.id).length} chuyến/ngày)
                    </p>
                  </div>

                  {/* Button đặt vé */}
                  <Link
                    href={`/dat-ve?route=${route.id}`}
                    className="block w-full bg-sky-500 hover:bg-sky-600 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
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
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3 rounded-lg shadow-sm transition-colors duration-200 group"
            >
              <span>Xem tất cả tuyến đường</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section >

      <section className="py-16 bg-gradient-to-br from-sky-500 to-blue-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng cho chuyến đi của bạn?</h2>
          <p className="text-lg mb-8 text-sky-50">Đặt vé trực tuyến ngay hôm nay để nhận ưu đãi đặc biệt</p>
          <Link
            href="/dat-ve"
            className="inline-block bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-sky-50 transition-colors shadow-md"
          >
            Đặt vé ngay
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Liên hệ với chúng tôi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">📞</div>
                <h3 className="font-semibold mb-2 text-gray-800">Hotline</h3>
                <a href="tel:02519999975" className="text-sky-600 hover:text-sky-700 font-medium">
                  02519 999 975
                </a>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">📧</div>
                <h3 className="font-semibold mb-2 text-gray-800">Email</h3>
                <a href="mailto:vocucphuong0018@gmail.com" className="text-sky-600 hover:text-sky-700 font-medium text-sm">
                  vocucphuong0018@gmail.com
                </a>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">📍</div>
                <h3 className="font-semibold mb-2 text-gray-800">Văn phòng</h3>
                <p className="text-gray-600 text-sm mb-2">Quận 5: 97i đường Nguyễn Duy Dương, phường 9</p>
                <p className="text-gray-600 text-sm">Hàng Xanh: 496B đường Điện Biên Phủ, phường 21, Bình Thạnh</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
}
