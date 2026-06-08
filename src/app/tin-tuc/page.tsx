// Trang danh sách tin tức
// Trang độc lập, không ảnh hưởng đến các trang khác
'use client';

import { useState, useMemo } from 'react';
import { posts } from '@/data/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

export default function TinTucPage() {
    const categories = Array.from(new Set(posts.map(post => post.category)));
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPosts = useMemo(() => {
        let list = posts;
        if (activeCategory) list = list.filter(p => p.category === activeCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.excerpt.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }
        return list;
    }, [activeCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-blue-800 text-white">
                <div className="container mx-auto px-4 py-16 md:py-20">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                            Tin tức & Hướng dẫn
                        </h1>
                        <p className="text-sky-100 text-lg md:text-xl">
                            Cập nhật thông tin mới nhất về dịch vụ xe khách Võ Cúc Phương
                        </p>

                        {/* Search bar */}
                        <div className="mt-8 max-w-xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm bài viết, hướng dẫn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-5 py-3.5 pl-12 rounded-full text-gray-800 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-300/50"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter pills */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur shadow-sm border-b border-slate-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                                activeCategory === null
                                    ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Tất cả ({posts.length})
                        </button>
                        {categories.map((category) => {
                            const count = posts.filter(p => p.category === category).length;
                            const isActive = activeCategory === category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                                        isActive
                                            ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {category} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Danh sách bài viết */}
            <div className="container mx-auto px-4 py-12">
                {filteredPosts.length > 0 ? (
                    <>
                        <p className="text-slate-500 text-sm mb-6 text-center">
                            Hiển thị {filteredPosts.length} bài viết
                            {activeCategory && ` trong chuyên mục "${activeCategory}"`}
                            {searchQuery && ` khớp "${searchQuery}"`}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {filteredPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 max-w-md mx-auto">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            Không tìm thấy bài viết
                        </h3>
                        <p className="text-slate-500">
                            Thử tìm với từ khoá khác hoặc bỏ bộ lọc chuyên mục
                        </p>
                        {(activeCategory || searchQuery) && (
                            <button
                                onClick={() => { setActiveCategory(null); setSearchQuery(''); }}
                                className="mt-4 text-sky-600 hover:text-sky-700 font-semibold"
                            >
                                Xem tất cả bài viết
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Section CTA */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white py-14 mt-8">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        Bạn cần hỗ trợ thêm?
                    </h2>
                    <p className="text-lg mb-8 text-sky-100">
                        Liên hệ với chúng tôi để được tư vấn chi tiết
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/lien-he"
                            className="bg-white text-sky-700 px-7 py-3.5 rounded-full font-semibold hover:bg-slate-100 transition shadow-lg"
                        >
                            Liên hệ ngay
                        </Link>
                        <Link
                            href="/dat-ve"
                            className="bg-amber-400 text-slate-900 px-7 py-3.5 rounded-full font-semibold hover:bg-amber-300 transition shadow-lg"
                        >
                            Đặt vé online
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
