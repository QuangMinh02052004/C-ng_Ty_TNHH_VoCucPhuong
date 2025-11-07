import { companyInfo } from '@/data/routes';

export default function GioiThieuPage() {
    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Về chúng tôi</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {companyInfo.name} - Đối tác tin cậy cho mọi chuyến đi của bạn
                    </p>
                </div>

                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <div className="text-5xl mb-4">🎂</div>
                        <h3 className="text-2xl font-bold mb-2">Thành lập</h3>
                        <p className="text-gray-600">Năm {companyInfo.founded}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                        <div className="text-5xl mb-4">🚌</div>
                        <h3 className="text-2xl font-bold mb-2">Đội xe</h3>
                        <p className="text-gray-600">Hơn 50 xe hiện đại</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6 text-center">
                        <div className="text-5xl mb-4">⭐</div>
                        <h3 className="text-2xl font-bold mb-2">Khách hàng</h3>
                        <p className="text-gray-600">Hơn 100,000 lượt khách/năm</p>
                    </div>
                </div>

                {/* Tầm nhìn và Sứ mệnh */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-4xl mb-4">🎯</div>
                        <h2 className="text-2xl font-bold mb-4">Tầm nhìn</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {companyInfo.vision}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-4xl mb-4">🚀</div>
                        <h2 className="text-2xl font-bold mb-4">Sứ mệnh</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {companyInfo.mission}
                        </p>
                    </div>
                </div>

                {/* Loại xe */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Đội xe của chúng tôi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {companyInfo.busTypes.map((busType, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition">
                                <div className="text-5xl mb-4">🚍</div>
                                <h3 className="text-xl font-semibold mb-2">{busType}</h3>
                                <p className="text-gray-600">
                                    Xe đời mới, tiện nghi đầy đủ
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dịch vụ */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Dịch vụ của chúng tôi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {companyInfo.services.map((service, index) => (
                            <div key={index} className="flex items-start bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <span className="text-blue-600 text-2xl mr-4">✓</span>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">{service}</h3>
                                    <p className="text-gray-600 text-sm">
                                        Chất lượng cao, giá cả hợp lý
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cam kết */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12">
                    <h2 className="text-3xl font-bold text-center mb-8">Cam kết của chúng tôi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-4xl mb-3">✅</div>
                            <h3 className="font-semibold mb-2">An toàn tuyệt đối</h3>
                            <p className="text-blue-100 text-sm">
                                Lái xe chuyên nghiệp, bảo hiểm đầy đủ
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">🕐</div>
                            <h3 className="font-semibold mb-2">Đúng giờ</h3>
                            <p className="text-blue-100 text-sm">
                                Xuất bến và đến nơi đúng lịch trình
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">💝</div>
                            <h3 className="font-semibold mb-2">Phục vụ tận tâm</h3>
                            <p className="text-blue-100 text-sm">
                                Nhân viên nhiệt tình, chu đáo
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">💯</div>
                            <h3 className="font-semibold mb-2">Giá cả hợp lý</h3>
                            <p className="text-blue-100 text-sm">
                                Minh bạch, không phát sinh chi phí
                            </p>
                        </div>
                    </div>
                </div>

                {/* Liên hệ */}
                <div className="mt-16 text-center">
                    <h2 className="text-3xl font-bold mb-4">Liên hệ với chúng tôi</h2>
                    <p className="text-gray-600 mb-6">
                        Để biết thêm thông tin chi tiết về dịch vụ của chúng tôi
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="tel:02519 999 975"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            📞 Gọi ngay
                        </a>
                        <a
                            href="/lien-he"
                            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            📧 Gửi tin nhắn
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
