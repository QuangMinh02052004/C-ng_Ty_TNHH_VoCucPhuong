'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
    const { data: session, status } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

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

                    {/* Right Section */}
                    <div className="flex justify-end items-center space-x-3">
                        {/* Hotline */}
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

                        {/* User Menu / Login Button */}
                        {status === 'loading' ? (
                            <div className="hidden md:block px-4 py-2">
                                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : session ? (
                            <div className="relative hidden md:block" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-sky-50 transition-all duration-200 border border-gray-200"
                                >
                                    <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold">
                                        {session.user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
                                        <p className="text-xs text-gray-500">{session.user.role === 'ADMIN' ? 'Quản trị' : session.user.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}</p>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-gray-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                        <Link
                                            href="/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-sky-50 transition-colors"
                                        >
                                            <span className="text-lg">👤</span>
                                            <span className="text-gray-700">Tài khoản của tôi</span>
                                        </Link>

                                        <Link
                                            href="/my-bookings"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-sky-50 transition-colors"
                                        >
                                            <span className="text-lg">🎫</span>
                                            <span className="text-gray-700">Vé của tôi</span>
                                        </Link>

                                        {(session.user.role === 'ADMIN' || session.user.role === 'STAFF') && (
                                            <>
                                                <div className="border-t border-gray-200 my-2"></div>
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors"
                                                >
                                                    <span className="text-lg">⚙️</span>
                                                    <span className="text-red-600 font-semibold">Quản trị</span>
                                                </Link>
                                            </>
                                        )}

                                        <div className="border-t border-gray-200 my-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left"
                                        >
                                            <span className="text-lg">🚪</span>
                                            <span className="text-red-600">Đăng xuất</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    href="/auth/login"
                                    className="px-4 py-2 rounded-md text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200 font-medium"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-900 text-white font-semibold transition-all duration-200"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}

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
