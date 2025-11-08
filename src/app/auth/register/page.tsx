'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Đăng ký thất bại');
                return;
            }

            // Success - redirect to login
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            router.push('/auth/login');
        } catch (err) {
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🚌</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng ký tài khoản</h1>
                    <p className="text-gray-600">Xe Võ Cúc Phương</p>
                </div>

                {/* Register Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

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
                                disabled={loading}
                            />
                        </div>

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
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                className="h-4 w-4 mt-1 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
                                required
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                Tôi đồng ý với{' '}
                                <Link href="/terms" className="text-sky-600 hover:text-sky-700">
                                    Điều khoản dịch vụ
                                </Link>{' '}
                                và{' '}
                                <Link href="/privacy" className="text-sky-600 hover:text-sky-700">
                                    Chính sách bảo mật
                                </Link>
                            </label>
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
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Đã có tài khoản?{' '}
                            <Link href="/auth/login" className="text-sky-600 hover:text-sky-700 font-semibold">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
