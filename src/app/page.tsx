import Link from 'next/link';
import { routes } from '@/data/routes';

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Nhà Xe Võ Cúc Phương
            </h1>
            <p className="text-xl mb-8">
              Dịch vụ vận chuyển hành khách uy tín, an toàn và chuyên nghiệp.
              Phục vụ các tuyến liên tỉnh với đội xe hiện đại, lái xe giàu kinh nghiệm.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dat-ve"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Đặt vé ngay
              </Link>
              <Link
                href="/tuyen-duong"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition border border-white"
              >
                Xem tuyến đường
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🚌</div>
              <h3 className="text-xl font-semibold mb-2">Đội xe hiện đại</h3>
              <p className="text-gray-600">
                Xe đời mới, tiện nghi đầy đủ, bảo dưỡng định kỳ
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold mb-2">Đúng giờ</h3>
              <p className="text-gray-600">
                Cam kết xuất bến đúng giờ, tôn trọng thời gian khách hàng
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">An toàn</h3>
              <p className="text-gray-600">
                Lái xe chuyên nghiệp, bảo hiểm đầy đủ cho hành khách
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Giá cạnh tranh</h3>
              <p className="text-gray-600">
                Giá vé hợp lý, nhiều ưu đãi cho khách hàng thân thiết
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tuyến đường phổ biến</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.slice(0, 6).map((route) => (
              <div key={route.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition w-full max-w-sm mx-auto flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold min-h-[64px] flex items-center">{route.from} → {route.to}</h3>
                </div>
                <div className="space-y-2 text-gray-600 flex-grow">
                  <p className="flex items-center justify-between">
                    <span className="font-semibold">Giá vé:</span>
                    <span className="text-blue-600 font-bold">{route.price.toLocaleString('vi-VN')} đ</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="font-semibold">Thời gian:</span>
                    <span>{route.duration}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="font-semibold">Loại xe:</span>
                    <span>{route.busType}</span>
                  </p>
                </div>
                <Link
                  href={`/dat-ve?route=${route.id}`}
                  className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Đặt vé
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/tuyen-duong"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Xem tất cả tuyến đường →
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
