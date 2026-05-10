import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';

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
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Đội xe hiện đại</h3>
              <p className="text-gray-600 text-sm">
                Xe đời mới, tiện nghi đầy đủ, bảo dưỡng định kỳ
              </p>
            </div>
            <div className="text-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors duration-300 border border-sky-100">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Đúng giờ</h3>
              <p className="text-gray-600 text-sm">
                Cam kết xuất bến đúng giờ, tôn trọng thời gian của bạn
              </p>
            </div>
            <div className="text-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors duration-300 border border-sky-100">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">An toàn</h3>
              <p className="text-gray-600 text-sm">
                Lái xe chuyên nghiệp, bảo hiểm đầy đủ cho hành khách
              </p>
            </div>
            <div className="text-center p-6 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors duration-300 border border-sky-100">
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
              Đặt vé chỉ với 3 bước
            </h2>
            <p className="text-gray-600 text-lg">Nhanh gọn, rõ ràng, không lằng nhằng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="relative bg-white rounded-xl border border-gray-200 p-7">
              <div className="absolute -top-4 left-7 w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-2">Chọn tuyến và giờ</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Chọn điểm đi, điểm đến, ngày khởi hành và khung giờ phù hợp.
                Mỗi tuyến có chuyến mới mỗi 30 phút từ sáng sớm đến tối.
              </p>
            </div>

            <div className="relative bg-white rounded-xl border border-gray-200 p-7">
              <div className="absolute -top-4 left-7 w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-2">Chọn ghế trên sơ đồ</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Xem sơ đồ ghế trực quan, chọn vị trí mình thích.
                Điền họ tên, số điện thoại và địa chỉ đón / trả.
              </p>
            </div>

            <div className="relative bg-white rounded-xl border border-gray-200 p-7">
              <div className="absolute -top-4 left-7 w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-2">Thanh toán và nhận vé</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Thanh toán qua chuyển khoản hoặc tại bến. Vé điện tử kèm
                mã QR được gửi qua email, chỉ cần xuất trình khi lên xe.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/dat-ve"
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold px-10 py-3 rounded-md transition-colors duration-200"
            >
              Bắt đầu đặt vé
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Hoặc xem trước{' '}
              <Link href="/tuyen-duong" className="text-sky-600 hover:text-sky-700 font-medium underline underline-offset-2">
                danh sách tuyến đường
              </Link>
            </p>
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
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Liên hệ với chúng tôi</h2>
              <p className="text-gray-600">Sẵn sàng hỗ trợ quý khách 24/7</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-xs uppercase tracking-wider text-sky-600 font-semibold mb-2">Hotline</p>
                <a href="tel:02519999975" className="block text-xl font-bold text-gray-900 hover:text-sky-700">
                  02519 999 975
                </a>
                <p className="text-sm text-gray-500 mt-1">Hỗ trợ đặt vé và tư vấn</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-xs uppercase tracking-wider text-sky-600 font-semibold mb-2">Email</p>
                <a href="mailto:vocucphuong0018@gmail.com" className="block text-base font-semibold text-gray-900 hover:text-sky-700 break-all">
                  vocucphuong0018@gmail.com
                </a>
                <p className="text-sm text-gray-500 mt-1">Phản hồi trong vòng 24 giờ</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-xs uppercase tracking-wider text-sky-600 font-semibold mb-2">Văn phòng</p>
                <p className="text-sm text-gray-800 font-medium mb-1">Quận 5</p>
                <p className="text-sm text-gray-600 mb-3">97i Nguyễn Duy Dương, P.9</p>
                <p className="text-sm text-gray-800 font-medium mb-1">Hàng Xanh</p>
                <p className="text-sm text-gray-600">496B Điện Biên Phủ, P.21, Bình Thạnh</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
}
