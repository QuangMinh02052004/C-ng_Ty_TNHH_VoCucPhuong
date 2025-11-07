// Component hiển thị card bài viết
// Component độc lập, dễ dàng tái sử dụng

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/data/posts';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Hình ảnh */}
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Badge category */}
                <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                    </span>
                </div>
            </div>

            {/* Nội dung */}
            <div className="p-5">
                {/* Thông tin meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                        📅 {new Date(post.date).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                        ✍️ {post.author}
                    </span>
                </div>

                {/* Tiêu đề */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                    <Link href={`/tin-tuc/${post.slug}`}>
                        {post.title}
                    </Link>
                </h3>

                {/* Mô tả ngắn */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Button đọc tiếp */}
                <Link
                    href={`/tin-tuc/${post.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                    Đọc tiếp
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </article>
    );
}
