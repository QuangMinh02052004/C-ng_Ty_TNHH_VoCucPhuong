'use client'

import Image from 'next/image'
import { useState } from 'react'

interface RouteMapVisualizationProps {
  routeMapImage?: string
  thumbnailImage?: string
  from: string
  to: string
  distance?: string
  duration: string
}

export default function RouteMapVisualization({
  routeMapImage,
  thumbnailImage,
  from,
  to,
  distance,
  duration
}: RouteMapVisualizationProps) {
  const [imageError, setImageError] = useState(false)
  const [showFullMap, setShowFullMap] = useState(false)

  // Nếu có hình ảnh lộ trình thì hiển thị
  if (routeMapImage && !imageError) {
    return (
      <>
        <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl overflow-hidden border border-sky-100">
          <Image
            src={routeMapImage}
            alt={`Lộ trình ${from} - ${to}`}
            fill
            className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowFullMap(true)}
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Route Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                  <span className="font-bold text-lg">{from}</span>
                </div>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{to}</span>
                  <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse" />
                </div>
              </div>
              <button
                onClick={() => setShowFullMap(true)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              {distance && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {distance}
                </div>
              )}
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {duration}
              </div>
            </div>
          </div>
        </div>

        {/* Full Map Modal */}
        {showFullMap && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullMap(false)}
          >
            <div className="relative max-w-6xl w-full h-full max-h-[90vh]">
              <button
                onClick={() => setShowFullMap(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative w-full h-full">
                <Image
                  src={routeMapImage}
                  alt={`Lộ trình ${from} - ${to}`}
                  fill
                  className="object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Fallback: Hiển thị visualization đồ họa mặc định
  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 rounded-xl overflow-hidden border border-sky-100 p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route Visualization */}
      <div className="relative z-10 flex items-center justify-between h-full">
        {/* Điểm đi */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-ping" />
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Điểm đi</p>
            <p className="font-bold text-gray-900 text-lg mt-1">{from}</p>
          </div>
        </div>

        {/* Đường nối với animation */}
        <div className="flex-1 flex flex-col items-center px-8">
          <div className="relative w-full">
            {/* Animated route line */}
            <div className="relative h-1 bg-blue-200 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 animate-pulse" />
            </div>

            {/* Bus icon animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative animate-bounce">
                <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-blue-500">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Arrows */}
            <div className="flex justify-between mt-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-blue-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              ))}
            </div>
          </div>

          {/* Info badges */}
          <div className="flex gap-3 mt-6">
            {distance && (
              <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{distance}</span>
              </div>
            )}
            <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-sky-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{duration}</span>
            </div>
          </div>
        </div>

        {/* Điểm đến */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-600 to-sky-700 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-sky-400 rounded-full animate-ping" />
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Điểm đến</p>
            <p className="font-bold text-gray-900 text-lg mt-1">{to}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
