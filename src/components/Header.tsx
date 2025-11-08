import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-sky-100">
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <Image
                            src="/logo.png"
                            alt="Logo Xe Võ Cúc Phương"
                            width={65}
                            height={65}
                            className="rounded-lg transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="flex flex-col">
                            <span className="text-xl lg:text-2xl font-semibold text-gray-800 whitespace-nowrap">
                                Xe Võ Cúc Phương
                            </span>
                            <span className="text-xs text-sky-600 whitespace-nowrap hidden lg:block">
                                Uy tín - An toàn - Chuyên nghiệp
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Menu */}
                    <ul className="hidden md:flex space-x-1 items-center">
                        <li>
                            <Link
                                href="/"
                                className="px-4 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 whitespace-nowrap font-medium"
                            >
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/tuyen-duong"
                                className="px-4 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 whitespace-nowrap font-medium"
                            >
                                Tuyến đường
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/tin-tuc"
                                className="px-4 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 whitespace-nowrap font-medium"
                            >
                                Tin tức
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/gioi-thieu"
                                className="px-4 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 whitespace-nowrap font-medium"
                            >
                                Giới thiệu
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dat-ve"
                                className="px-5 py-2.5 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-semibold whitespace-nowrap shadow-sm transition-all duration-200"
                            >
                                Đặt vé ngay
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/lien-he"
                                className="px-4 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 whitespace-nowrap font-medium"
                            >
                                Hỗ trợ
                            </Link>
                        </li>
                    </ul>

                    {/* Hotline Section */}
                    <div className="flex justify-end items-center space-x-3">
                        <a
                            href="tel:02519999975"
                            className="hidden lg:flex items-center space-x-2 bg-sky-50 hover:bg-sky-100 px-4 py-2.5 rounded-md transition-all duration-200 border border-sky-200 group"
                        >
                            <span className="text-xl">📞</span>
                            <div className="flex flex-col">
                                <span className="text-xs text-sky-600 font-medium">Hotline 24/7</span>
                                <span className="text-base font-semibold text-gray-800 group-hover:text-sky-600 transition-colors">02519 999 975</span>
                            </div>
                        </a>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden text-gray-700 hover:text-sky-600 hover:bg-sky-50 p-2.5 rounded-md transition-all">
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
