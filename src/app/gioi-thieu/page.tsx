import { companyInfo } from '@/data/routes';

export default function GioiThieuPage() {
    return (
        <div className="py-16 bg-gradient-to-b from-sky-50 to-white">
            <div className="container mx-auto px-4">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Về chúng tôi</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        {companyInfo.name} - Đối tác tin cậy cho mọi chuyến đi của bạn
                    </p>
                </div>

                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-8 text-center">
                        
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">Thành lập</h3>
                        <p className="text-gray-600">Năm {companyInfo.founded}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-8 text-center">
                        
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">Đội xe</h3>
                        <p className="text-gray-600">Hơn 50 xe hiện đại</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-8 text-center">
                        
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">Khách hàng</h3>
                        <p className="text-gray-600">Hơn 100,000 lượt khách/năm</p>
                    </div>
                </div>

                {/* Tầm nhìn và Sứ mệnh */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            
                            <h2 className="text-2xl font-semibold text-gray-800">Tầm nhìn</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            {companyInfo.vision}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            
                            <h2 className="text-2xl font-semibold text-gray-800">Sứ mệnh</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            {companyInfo.mission}
                        </p>
                    </div>
                </div>

                {/* Dịch vụ */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Dịch vụ của chúng tôi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {companyInfo.services.map((service, index) => (
                            <div key={index} className="flex items-start bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <span className="text-sky-500 text-2xl mr-4 flex-shrink-0">✓</span>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1 text-gray-800">{service}</h3>
                                    <p className="text-gray-600 text-sm">
                                        Chất lượng cao, giá cả hợp lý
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cam kết */}
                <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-8 md:p-12 mb-12">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Cam kết của chúng tôi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-sky-50 rounded-lg p-6 text-center border border-sky-100">
                            
                            <h3 className="font-semibold mb-2 text-gray-800">An toàn tuyệt đối</h3>
                            <p className="text-gray-600 text-sm">
                                Lái xe chuyên nghiệp, bảo hiểm đầy đủ
                            </p>
                        </div>
                        <div className="bg-sky-50 rounded-lg p-6 text-center border border-sky-100">
                            
                            <h3 className="font-semibold mb-2 text-gray-800">Đúng giờ</h3>
                            <p className="text-gray-600 text-sm">
                                Xuất bến và đến nơi đúng lịch trình
                            </p>
                        </div>
                        <div className="bg-sky-50 rounded-lg p-6 text-center border border-sky-100">
                            
                            <h3 className="font-semibold mb-2 text-gray-800">Phục vụ tận tâm</h3>
                            <p className="text-gray-600 text-sm">
                                Nhân viên nhiệt tình, chu đáo
                            </p>
                        </div>
                        <div className="bg-sky-50 rounded-lg p-6 text-center border border-sky-100">
                            
                            <h3 className="font-semibold mb-2 text-gray-800">Giá cả hợp lý</h3>
                            <p className="text-gray-600 text-sm">
                                Minh bạch, không phát sinh chi phí
                            </p>
                        </div>
                    </div>
                </div>

                {/* Liên hệ */}
                <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">Liên hệ với chúng tôi</h2>
                    <p className="text-gray-600 mb-6">
                        Để biết thêm thông tin chi tiết về dịch vụ của chúng tôi
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="tel:02519999975"
                            className="bg-sky-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
                        >
                            Gọi ngay
                        </a>
                        <a
                            href="/lien-he"
                            className="bg-white text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors border border-gray-300"
                        >
                            Gửi tin nhắn
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
