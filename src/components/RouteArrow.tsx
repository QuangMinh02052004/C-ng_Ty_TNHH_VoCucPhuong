'use client';

interface RouteArrowProps {
    from: string;
    to: string;
}

export default function RouteArrow({ from, to }: RouteArrowProps) {
    return (
        <div className="relative mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex-1 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-300 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <div>
                                <p className="text-xs text-blue-600 font-medium mb-0.5">Điểm đi</p>
                                <p className="text-sm font-bold text-blue-900">{from}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mũi tên đồ họa với đường line dọc */}
            <div className="flex justify-center my-2">
                <div className="relative flex flex-col items-center">
                    {/* Đường line dọc với gradient */}
                    <div className="relative w-1 h-12 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 rounded-full overflow-hidden shadow-lg">
                        {/* Hiệu ứng ánh sáng chạy */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-60 animate-shimmer-vertical"></div>
                    </div>

                    {/* Mũi tên xuống */}
                    <div className="relative -mt-1">
                        <svg
                            className="w-8 h-8 text-green-500 animate-bounce-vertical drop-shadow-lg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                        </svg>
                        {/* Vòng tròn phát sáng */}
                        <div className="absolute inset-0 w-8 h-8 bg-green-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                    </div>

                </div>
            </div>

            {/* Điểm đến - End Point */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex-1 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-xs text-green-600 font-medium mb-0.5">Điểm đến</p>
                                <p className="text-sm font-bold text-green-900">{to}</p>
                            </div>
                            <div className="relative ml-auto">
                                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                                <div className="absolute -inset-1 border-2 border-green-400 rounded-full animate-ping-slow"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
