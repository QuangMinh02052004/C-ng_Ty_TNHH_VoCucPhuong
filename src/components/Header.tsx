import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-lg border-b-2 border-blue-500/30">
            <nav className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo Section - Premium */}
                    <Link href="/" className="flex items-center space-x-4 group">
                        <div className="relative">
                            {/* Glow effect behind logo */}
                            <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Image
                                src="/logo.png"
                                alt="Logo Xe Võ Cúc Phương"
                                width={60}
                                height={60}
                                className="rounded-xl shadow-xl relative z-10 ring-2 ring-white/30 group-hover:ring-white/60 transition-all duration-300 transform group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl lg:text-3xl font-bold whitespace-nowrap bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent group-hover:from-yellow-200 group-hover:via-white group-hover:to-yellow-200 transition-all duration-300">
                                Xe Võ Cúc Phương
                            </span>
                            <span className="text-xs text-blue-100 whitespace-nowrap hidden lg:block">
                                ⭐ Uy tín - An toàn - Chuyên nghiệp
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Menu - Professional */}
                    <ul className="hidden md:flex space-x-2 items-center">
                        <li>
                            <Link
                                href="/"
                                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 whitespace-nowrap font-medium hover:text-yellow-300 relative group"
                            >
                                <span className="relative z-10">🏠 Trang chủ</span>
                                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/tuyen-duong"
                                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 whitespace-nowrap font-medium hover:text-yellow-300 relative group"
                            >
                                <span className="relative z-10">🗺️ Tuyến đường</span>
                                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/gioi-thieu"
                                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 whitespace-nowrap font-medium hover:text-yellow-300 relative group"
                            >
                                <span className="relative z-10">ℹ️ Giới thiệu</span>
                                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dat-ve"
                                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                                🎫 Đặt vé ngay
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/lien-he"
                                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 whitespace-nowrap font-medium hover:text-yellow-300 relative group"
                            >
                                <span className="relative z-10">📞 Liên hệ với chúng tôi</span>
                                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                        </li>
                    </ul>

                    {/* Hotline Section - Premium */}
                    <div className="flex items-center space-x-3">
                        <a
                            href="tel:02519999975"
                            className="hidden lg:flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                        >
                            <span className="text-2xl animate-pulse">📞</span>
                            <div className="flex flex-col">
                                <span className="text-xs text-blue-100 font-medium">Hotline 24/7</span>
                                <span className="text-lg font-bold group-hover:text-yellow-300 transition-colors">02519 999 975</span>
                            </div>
                        </a>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden text-white bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}
