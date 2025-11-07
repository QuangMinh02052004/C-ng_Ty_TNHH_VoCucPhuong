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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        alert(`Cảm ơn bạn đã liên hệ!\n\nChúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.\n\nThông tin liên hệ:\nHọ tên: ${formData.name}\nEmail: ${formData.email}\nSố điện thoại: ${formData.phone}\nTiêu đề: ${formData.subject}\n\nTrân trọng!`);

        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        });
    };

    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
                    <p className="text-lg text-gray-600">
                        Chúng tôi luôn sẵn sàng hỗ trợ và lắng nghe ý kiến của bạn
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form liên hệ */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0123456789"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tiêu đề tin nhắn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={6}
                                    placeholder="Nội dung tin nhắn của bạn..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Gửi tin nhắn
                            </button>
                        </form>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                            <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="text-3xl mr-4">📍</div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Địa chỉ</h3>
                                        <div className="text-gray-600 space-y-2">
                                            {companyInfo.address.map((addr, index) => (
                                                <p key={index}>{addr}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-3xl mr-4">📞</div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Điện thoại</h3>
                                        <p className="text-gray-600">
                                            Hotline: <a href={`tel:${companyInfo.phone}`} className="text-blue-600 hover:text-blue-700">{companyInfo.phone}</a>
                                        </p>
                                        <p className="text-gray-600">
                                            Tổng đài: <a href={`tel:${companyInfo.phone}`} className="text-blue-600 hover:text-blue-700">{companyInfo.phone}</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-3xl mr-4">📧</div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <p className="text-gray-600">
                                            <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:text-blue-700">
                                                {companyInfo.email}
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="text-3xl mr-4">🕐</div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Giờ làm việc</h3>
                                        <p className="text-gray-600">Thứ 2 - Chủ nhật: 5:00 - 22:00</p>
                                        <p className="text-gray-600">Hỗ trợ 24/7 qua hotline</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bản đồ */}
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="font-semibold mb-4">Vị trí văn phòng</h3>
                            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                                <p className="text-gray-500">
                                    🗺️ Bản đồ Google Maps<br />
                                    <span className="text-sm">(Tích hợp sau)</span>
                                </p>
                            </div>
                        </div>

                        {/* Mạng xã hội */}
                        <div className="bg-blue-50 rounded-lg p-6 mt-6">
                            <h3 className="font-semibold mb-4">Theo dõi chúng tôi</h3>
                            <div>
                                <h3 className="text-xl font-bold mb-4">Theo dõi chúng tôi</h3>
                                <div className="flex space-x-4">
                                    {/* Facebook */}
                                    <a
                                        href="https://www.facebook.com/nhaxevocucphuong"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-blue-500 transition"
                                        title="Facebook"
                                    >
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>

                                    {/* Zalo */}
                                    <a
                                        href="https://zalo.me/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-blue-400 transition"
                                        title="Zalo"
                                    >
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.009.278 2.072.431 3.442.431 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm.5 14.969h-3.75V9.656h1.406v3.906H12.5v1.407zm3.75 0h-1.406v-3.75l-1.406 1.875-1.407-1.875v3.75H10.72V9.656h1.25l1.406 1.875 1.406-1.875h1.407v5.313z" />
                                        </svg>
                                    </a>

                                    {/* TikTok */}
                                    <a
                                        href="https://www.tiktok.com/@xevocucphuong"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-pink-500 transition"
                                        title="TikTok"
                                    >
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
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
