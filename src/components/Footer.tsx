import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-16">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Thông tin công ty */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Xe Võ Cúc Phương</h3>
                        <p className="text-gray-400 mb-2">
                            Dịch vụ vận chuyển hành khách uy tín, an toàn và chuyên nghiệp.
                        </p>
                        <p className="text-gray-400">
                            Phục vụ từ năm 2011
                        </p>
                    </div>

                    {/* Liên kết nhanh */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Liên kết</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link href="/tuyen-duong" className="hover:text-white transition">
                                    Tuyến đường
                                </Link>
                            </li>
                            <li>
                                <Link href="/dat-ve" className="hover:text-white transition">
                                    Đặt vé online
                                </Link>
                            </li>
                            <li>
                                <Link href="/gioi-thieu" className="hover:text-white transition">
                                    Về chúng tôi
                                </Link>
                            </li>
                            <li>
                                <Link href="/lien-he" className="hover:text-white transition">
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Liên hệ */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>📍 Văn phòng Quận 5: 97i đường Nguyễn Duy Dương, phường 9, quận 5</li>
                            <li>📍 Văn phòng Hàng Xanh: 496B đường Điện Biên Phủ, phường 21, quận Bình Thạnh</li>

                            <li>📞 02519 999 975</li>
                            <li>📧 vocucphuong0018@gmail.com</li>
                        </ul>
                    </div>

                    {/* Theo dõi */}
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
                                href="https://zalo.me/2438438727175449001"
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

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 Nhà Xe Võ Cúc Phương. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
