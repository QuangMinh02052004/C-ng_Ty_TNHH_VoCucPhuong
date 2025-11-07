'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const slides = [
    {
        id: 1,
        image: '/gioithieu.jpg', // Bạn sẽ thêm ảnh này
        title: 'Nhà Xe Võ Cúc Phương',
        description: 'Dịch vụ vận chuyển hành khách uy tín, an toàn và chuyên nghiệp'
    },
    {
        id: 2,
        image: '/hopdong.jpg', // Bạn sẽ thêm ảnh này
        title: 'Đội xe hiện đại',
        description: 'Phục vụ các tuyến liên tỉnh với đội xe hiện đại, lái xe giàu kinh nghiệm'
    },
    {
        id: 3,
        image: '/lienhe.jpg', // Bạn sẽ thêm ảnh này
        title: 'Chất lượng hàng đầu',
        description: 'Cam kết mang đến trải nghiệm di chuyển tốt nhất cho khách hàng'
    }
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    // Auto play
    useEffect(() => {
        if (!isAutoPlay) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Chuyển slide mỗi 5 giây

        return () => clearInterval(interval);
    }, [isAutoPlay]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAutoPlay(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAutoPlay(false);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlay(false);
    };

    return (
        <div>
            {/* Image Carousel */}
            <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gray-100">
                {/* Slides */}
                <div className="relative h-full">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-contain"
                                priority={index === 0}
                            />
                        </div>
                    ))}
                </div>

                {/* Previous Button */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white backdrop-blur-sm text-gray-800 p-3 rounded-full transition-all hover:scale-110 group shadow-lg"
                    aria-label="Previous slide"
                >
                    <svg
                        className="w-6 h-6 group-hover:-translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Next Button */}
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white backdrop-blur-sm text-gray-800 p-3 rounded-full transition-all hover:scale-110 group shadow-lg"
                    aria-label="Next slide"
                >
                    <svg
                        className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all rounded-full ${index === currentSlide
                                ? 'bg-blue-600 w-12 h-3'
                                : 'bg-gray-400 hover:bg-gray-600 w-3 h-3'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* Content Section Below Image */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
                        {slides[currentSlide].title}
                    </h1>
                    <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto animate-fade-in-delay">
                        {slides[currentSlide].description}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 animate-fade-in-delay-2">
                        <Link
                            href="/dat-ve"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                        >
                            Đặt vé ngay
                        </Link>
                        <Link
                            href="/tuyen-duong"
                            className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all border-2 border-white"
                        >
                            Xem tuyến đường
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
