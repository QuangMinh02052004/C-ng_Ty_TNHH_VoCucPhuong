'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
    const { data: session, status } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
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
                    <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
                        <Image
                            src="/logo.png"
                            alt="Logo Xe Võ Cúc Phương"
                            width={65}
                            height={65}
                            className="rounded-lg transition-transform duration-200 group-hover:scale-105 w-10 h-10 sm:w-12 sm:h-12 lg:w-[65px] lg:h-[65px] landscape-logo"
                        />
                        <div className="flex flex-col">
                            <span className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-800 landscape-title">
                                Xe Võ Cúc Phương
                            </span>
                            <span className="text-xs text-sky-600 whitespace-nowrap hidden lg:block landscape-hidden">
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
                        <div className="relative md:hidden" ref={mobileMenuRef}>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-700 hover:text-sky-600 hover:bg-sky-50 p-2.5 rounded-md transition-all"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {mobileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                    {/* Navigation Links */}
                                    <div className="px-2 py-2 border-b border-gray-100">
                                        <Link
                                            href="/"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 transition-colors"
                                        >
                                            <span className="text-lg">🏠</span>
                                            <span className="text-gray-700 font-medium">Trang chủ</span>
                                        </Link>
                                        <Link
                                            href="/dat-ve"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors"
                                        >
                                            <span className="text-lg">🎫</span>
                                            <span className="text-sky-600 font-semibold">Đặt vé ngay</span>
                                        </Link>
                                        <Link
                                            href="/tuyen-duong"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 transition-colors"
                                        >
                                            <span className="text-lg">🛤️</span>
                                            <span className="text-gray-700 font-medium">Tuyến đường</span>
                                        </Link>
                                        <Link
                                            href="/tin-tuc"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 transition-colors"
                                        >
                                            <span className="text-lg">📰</span>
                                            <span className="text-gray-700 font-medium">Tin tức</span>
                                        </Link>
                                        <Link
                                            href="/gioi-thieu"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 transition-colors"
                                        >
                                            <span className="text-lg">ℹ️</span>
                                            <span className="text-gray-700 font-medium">Giới thiệu</span>
                                        </Link>
                                        <Link
                                            href="/lien-he"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 transition-colors"
                                        >
                                            <span className="text-lg">📞</span>
                                            <span className="text-gray-700 font-medium">Hỗ trợ</span>
                                        </Link>
                                    </div>

                                    {/* User Section */}
                                    <div className="px-2 py-2">
                                        {session ? (
                                            <>
                                                {/* User Info */}
                                                <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold">
                                                            {session.user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {session.user.role === 'ADMIN' ? 'Quản trị' : session.user.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link
                                                    href="/profile"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 transition-colors"
                                                >
                                                    <span className="text-lg">👤</span>
                                                    <span className="text-gray-700 font-medium">Tài khoản của tôi</span>
                                                </Link>
                                                <Link
                                                    href="/my-bookings"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sky-50 transition-colors"
                                                >
                                                    <span className="text-lg">🎫</span>
                                                    <span className="text-gray-700 font-medium">Vé của tôi</span>
                                                </Link>

                                                {(session.user.role === 'ADMIN' || session.user.role === 'STAFF') && (
                                                    <Link
                                                        href="/admin"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        <span className="text-lg">⚙️</span>
                                                        <span className="text-red-600 font-semibold">Quản trị</span>
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setMobileMenuOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                                                >
                                                    <span className="text-lg">🚪</span>
                                                    <span className="text-red-600 font-medium">Đăng xuất</span>
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col gap-2 px-2">
                                                <Link
                                                    href="/auth/login"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-sky-500 text-sky-600 font-semibold hover:bg-sky-50 transition-colors"
                                                >
                                                    Đăng nhập
                                                </Link>
                                                <Link
                                                    href="/auth/register"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900 transition-colors"
                                                >
                                                    Đăng ký
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hotline */}
                                    <div className="px-4 py-3 border-t border-gray-100 mt-2">
                                        <a
                                            href="tel:02519999975"
                                            className="flex items-center gap-3 text-sky-600"
                                        >
                                            <span className="text-xl">📞</span>
                                            <div>
                                                <p className="text-xs text-gray-500">Hotline 24/7</p>
                                                <p className="font-semibold">02519 999 975</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
