// Trang danh sách tin tức
// Trang độc lập, không ảnh hưởng đến các trang khác

import { posts } from '@/data/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export default function TinTucPage() {
    // Lấy các category duy nhất
    const categories = Array.from(new Set(posts.map(post => post.category)));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-blue-600 mb-3">
                            📰 Tin tức & Hướng dẫn
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Cập nhật thông tin mới nhất về dịch vụ xe khách
                        </p>
                    </div>

                    {/* Filter categories */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        <Link
                            href="/tin-tuc"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Tất cả
                        </Link>
                        {categories.map((category) => (
                            <button
                                key={category}
                                className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Danh sách bài viết */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>

                {/* Nếu không có bài viết */}
                {posts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            Chưa có bài viết nào. Vui lòng quay lại sau!
                        </p>
                    </div>
                )}
            </div>

            {/* Section CTA */}
            <div className="bg-blue-600 text-white py-12 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Bạn cần hỗ trợ thêm?
                    </h2>
                    <p className="text-lg mb-6 opacity-90">
                        Liên hệ với chúng tôi để được tư vấn chi tiết
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/lien-he"
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Liên hệ ngay
                        </Link>
                        <Link
                            href="/dat-ve"
                            className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
                        >
                            Đặt vé online
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
