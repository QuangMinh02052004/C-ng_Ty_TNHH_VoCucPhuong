// Trang chi tiết bài viết
// Trang độc lập với route động [slug]

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, posts } from '@/data/posts';
import PostCard from '@/components/PostCard';
import '../blog-content.css';

export default async function TinTucDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    // Lấy params (Next.js 15 yêu cầu await)
    const { slug } = await params;

    // Lấy bài viết theo slug
    const post = getPostBySlug(slug);

    // Nếu không tìm thấy bài viết
    if (!post) {
        notFound();
    }

    // Lấy 3 bài viết liên quan (cùng category, khác id)
    const relatedPosts = posts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <Link href="/tin-tuc" className="hover:text-blue-600">
                            Tin tức
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">{post.title}</span>
                    </div>
                </div>
            </div>

            {/* Nội dung bài viết */}
            <article className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                                {post.category}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {new Date(post.date).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {post.title}
                        </h1>

                        <p className="text-xl text-gray-600 mb-4">
                            {post.excerpt}
                        </p>

                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>✍️ Tác giả: <strong>{post.author}</strong></span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.image && (
                        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="prose prose-lg max-w-none mb-8 blog-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Từ khóa:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA Box */}
                    <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <h3 className="text-xl font-bold text-blue-900 mb-3">
                            🎫 Đặt vé ngay hôm nay!
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Trải nghiệm dịch vụ xe khách chất lượng cao với Nhà Xe Võ Cúc Phương
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/dat-ve"
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Đặt vé online
                            </Link>
                            <Link
                                href="/lien-he"
                                className="bg-white text-blue-600 border border-blue-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Liên hệ tư vấn
                            </Link>
                        </div>
                    </div>
                </div>
            </article>

            {/* Bài viết liên quan */}
            {relatedPosts.length > 0 && (
                <section className="bg-white py-12">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
                            📚 Bài viết liên quan
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {relatedPosts.map((relatedPost) => (
                                <PostCard key={relatedPost.id} post={relatedPost} />
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link
                                href="/tin-tuc"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Xem tất cả tin tức →
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
