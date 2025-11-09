'use client';

import { useState } from 'react';
import { companyInfo } from '@/data/routes';

export default function LienHePage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!formData.name || !formData.email || !formData.message) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: '',
                });

                // Scroll to top để thấy thông báo thành công
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setError(result.message || 'Không thể gửi tin nhắn. Vui lòng thử lại sau.');
            }
        } catch (err) {
            console.error('Error submitting contact form:', err);
            setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua hotline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-16 bg-gradient-to-b from-sky-50 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Liên hệ với chúng tôi</h1>
                    <p className="text-lg text-gray-600">
                        Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến của bạn
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl max-w-3xl mx-auto">
                        <div className="flex items-start">
                            <div className="text-4xl mr-4">✅</div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-800 mb-2">Gửi tin nhắn thành công!</h3>
                                <p className="text-green-700">
                                    Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl max-w-3xl mx-auto">
                        <div className="flex items-start">
                            <div className="text-4xl mr-4">❌</div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form liên hệ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gửi tin nhắn</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        placeholder="0123456789"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    placeholder="Tiêu đề tin nhắn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    rows={6}
                                    placeholder="Nội dung tin nhắn của bạn..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                    loading
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-sky-500 text-white hover:bg-sky-600'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gửi...
                                    </span>
                                ) : (
                                    'Gửi tin nhắn'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Thông tin liên hệ</h2>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="text-3xl mr-4">📍</div>
                                    <div>
                                        <h3 className="font-semibold mb-1 text-gray-800">Địa chỉ</h3>
                                        <div className="text-gray-600 space-y-2 text-sm">
                                            {companyInfo.address.map((addr, index) => (
                                                <p key={index}>{addr}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-3xl mr-4">📞</div>
                                    <div>
                                        <h3 className="font-semibold mb-1 text-gray-800">Điện thoại</h3>
                                        <p className="text-gray-600 text-sm">
                                            Hotline: <a href={`tel:${companyInfo.phone}`} className="text-sky-600 hover:text-sky-700 font-medium">{companyInfo.phone}</a>
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Tổng đài: <a href={`tel:${companyInfo.phone}`} className="text-sky-600 hover:text-sky-700 font-medium">{companyInfo.phone}</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-3xl mr-4">📧</div>
                                    <div>
                                        <h3 className="font-semibold mb-1 text-gray-800">Email</h3>
                                        <p className="text-gray-600 text-sm">
                                            <a href={`mailto:${companyInfo.email}`} className="text-sky-600 hover:text-sky-700 font-medium">
                                                {companyInfo.email}
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-3xl mr-4">🕐</div>
                                    <div>
                                        <h3 className="font-semibold mb-1 text-gray-800">Giờ làm việc</h3>
                                        <p className="text-gray-600 text-sm">Thứ 2 - Chủ nhật: 3:30 - 22:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mạng xã hội */}
                        <div className="bg-sky-50 rounded-xl border border-sky-100 p-6">
                            <h3 className="font-semibold mb-4 text-gray-800">Theo dõi chúng tôi</h3>
                            <div>
                                <div className="flex space-x-4">
                                    {/* Facebook */}
                                    <a
                                        href="https://www.facebook.com/nhaxevocucphuong"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-blue-600 transition-colors"
                                        title="Facebook"
                                    >
                                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>

                                    {/* Zalo */}
                                    <a
                                        href="https://zalo.me/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-blue-500 transition-colors"
                                        title="Zalo"
                                    >
                                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.009.278 2.072.431 3.442.431 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm.5 14.969h-3.75V9.656h1.406v3.906H12.5v1.407zm3.75 0h-1.406v-3.75l-1.406 1.875-1.407-1.875v3.75H10.72V9.656h1.25l1.406 1.875 1.406-1.875h1.407v5.313z" />
                                        </svg>
                                    </a>

                                    {/* TikTok */}
                                    <a
                                        href="https://www.tiktok.com/@xevocucphuong"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-pink-600 transition-colors"
                                        title="TikTok"
                                    >
                                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
