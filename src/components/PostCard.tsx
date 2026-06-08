// Component hiển thị card bài viết
// Component độc lập, dễ dàng tái sử dụng

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/data/posts';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const dateStr = new Date(post.date).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    return (
        <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col">
            {/* Hình ảnh */}
            <Link href={`/tin-tuc/${post.slug}`} className="block relative h-52 overflow-hidden bg-slate-100">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur text-sky-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        {post.category}
                    </span>
                </div>
            </Link>

            {/* Nội dung */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span>{dateStr}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="font-medium">{post.author}</span>
                </div>

                {/* Tiêu đề */}
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-snug">
                    <Link href={`/tin-tuc/${post.slug}`} className="hover:text-sky-600 transition-colors">
                        {post.title}
                    </Link>
                </h3>

                {/* Mô tả */}
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md text-xs font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <Link
                    href={`/tin-tuc/${post.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-semibold text-sm group/btn"
                >
                    Đọc tiếp
                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </article>
    );
}
