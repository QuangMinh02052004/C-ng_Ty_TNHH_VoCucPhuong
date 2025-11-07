import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50 h-20">
            <nav className="container mx-auto px-4 h-full">
                <div className="flex items-center justify-between h-full">
                    <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
                        <Image
                            src="/logo.png"
                            alt="Logo Xe Võ Cúc Phương"
                            width={50}
                            height={50}
                            className="rounded-lg flex-shrink-0"
                        />
                        <span className="text-2xl font-bold whitespace-nowrap">Xe Võ Cúc Phương</span>
                    </Link>

                    <ul className="hidden md:flex space-x-8 items-center">
                        <li>
                            <Link href="/" className="hover:text-blue-200 transition whitespace-nowrap">
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link href="/tuyen-duong" className="hover:text-blue-200 transition whitespace-nowrap">
                                Tuyến đường
                            </Link>
                        </li>
                        <li>
                            <Link href="/dat-ve" className="hover:text-blue-200 transition whitespace-nowrap">
                                Đặt vé
                            </Link>
                        </li>
                        <li>
                            <Link href="/gioi-thieu" className="hover:text-blue-200 transition whitespace-nowrap">
                                Giới thiệu
                            </Link>
                        </li>
                        <li>
                            <Link href="/lien-he" className="hover:text-blue-200 transition whitespace-nowrap">
                                Liên hệ
                            </Link>
                        </li>
                    </ul>

                    <div className="flex items-center space-x-4">
                        <a href="tel:02519999975" className="hidden sm:block hover:text-blue-200 transition whitespace-nowrap">
                            📞 02519 999 975
                        </a>
                        <button className="md:hidden text-white">
                            ☰
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}
