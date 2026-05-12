'use client';

import { useEffect, useRef, useState } from 'react';

interface ScanResult {
    success?: boolean;
    booking?: {
        bookingCode: string;
        customerName: string;
        customerPhone: string;
        route: string;
        date: string;
        departureTime: string;
        seats: number;
        totalPrice: number;
        status: string;
        wasPaid: boolean;
        pickupMethod: string | null;
        pickupAddress: string | null;
    };
    error?: string;
    bookingCode?: string;
}

declare global {
    // Safari / Chrome BarcodeDetector
    interface Window { BarcodeDetector?: any; }
}

export default function DriverScanPage() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<any>(null);
    const scanningRef = useRef(false);
    const [supported, setSupported] = useState<boolean | null>(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [recentCodes, setRecentCodes] = useState<Set<string>>(new Set());

    // Init: kiểm tra BarcodeDetector
    useEffect(() => {
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            try {
                detectorRef.current = new window.BarcodeDetector!({ formats: ['qr_code'] });
                setSupported(true);
            } catch {
                setSupported(false);
            }
        } else {
            setSupported(false);
        }
    }, []);

    const stopCamera = () => {
        scanningRef.current = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraOn(false);
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraOn(true);
            scanningRef.current = true;
            scanLoop();
        } catch (e: any) {
            setError(e?.message || 'Không mở được camera');
        }
    };

    const scanLoop = async () => {
        if (!scanningRef.current || !videoRef.current || !detectorRef.current) return;
        try {
            const codes = await detectorRef.current.detect(videoRef.current);
            if (codes && codes.length > 0) {
                const raw = codes[0].rawValue as string;
                const code = extractBookingCode(raw);
                if (code && !recentCodes.has(code)) {
                    // Pause loop, gọi API
                    scanningRef.current = false;
                    setRecentCodes(prev => new Set(prev).add(code));
                    await doScan(code);
                    // Sau 2s, cho phép quét tiếp
                    setTimeout(() => {
                        scanningRef.current = true;
                        scanLoop();
                    }, 2000);
                    return;
                }
            }
        } catch {
            // ignore individual frame errors
        }
        requestAnimationFrame(scanLoop);
    };

    const extractBookingCode = (raw: string): string => {
        // QR có thể chứa URL hoặc plain text. Lấy phần code dạng VCP...
        const m = raw.match(/VCP\d+/i);
        if (m) return m[0].toUpperCase();
        return raw.trim();
    };

    const doScan = async (bookingCode: string) => {
        setScanning(true);
        setResult(null);
        setError(null);
        try {
            const res = await fetch('/api/driver/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingCode }),
            });
            const data = await res.json();
            if (!res.ok) {
                setResult({ error: data.error || 'Lỗi quét vé', bookingCode });
            } else {
                setResult(data);
            }
            // Rung điện thoại nếu hỗ trợ
            if ('vibrate' in navigator) {
                navigator.vibrate(data.success && data.booking?.wasPaid ? [100] : [50, 50, 50]);
            }
        } catch (e) {
            setError('Lỗi mạng khi quét vé');
        } finally {
            setScanning(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        doScan(manualCode.trim().toUpperCase());
        setManualCode('');
    };

    return (
        <div className="p-3 md:p-5">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                {/* Camera viewport */}
                <div className="relative bg-black aspect-square">
                    <video
                        ref={videoRef}
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraOn ? '' : 'opacity-30'}`}
                    />
                    {cameraOn && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-8 border-2 border-white/70 rounded-lg" />
                            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-sky-400 animate-pulse" />
                        </div>
                    )}
                    {!cameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                            Camera chưa bật
                        </div>
                    )}
                </div>

                <div className="p-3 grid grid-cols-2 gap-2">
                    {!cameraOn ? (
                        <button
                            type="button"
                            onClick={startCamera}
                            disabled={supported === false}
                            className="col-span-2 px-4 py-3 bg-sky-600 text-white rounded-lg font-semibold disabled:bg-gray-300"
                        >
                            {supported === false ? 'Trình duyệt không hỗ trợ quét QR' : 'Bật camera'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={stopCamera}
                            className="col-span-2 px-4 py-3 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg font-semibold"
                        >
                            Tắt camera
                        </button>
                    )}
                </div>
            </div>

            {/* Nhập mã thủ công */}
            <form onSubmit={handleManualSubmit} className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex gap-2">
                <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="Hoặc nhập mã vé thủ công (VCP...)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded text-gray-900 placeholder:text-gray-400"
                />
                <button
                    type="submit"
                    disabled={scanning || !manualCode.trim()}
                    className="px-4 py-2 bg-gray-800 text-white text-sm rounded disabled:bg-gray-400"
                >
                    Kiểm tra
                </button>
            </form>

            {/* Kết quả */}
            {scanning && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-center text-sm text-gray-600">
                    Đang kiểm tra vé...
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {result?.error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
                    <p className="text-xs uppercase tracking-wider text-red-700 font-semibold">Quét thất bại</p>
                    <p className="text-base font-bold text-red-900 mt-1">{result.error}</p>
                    {result.bookingCode && (
                        <p className="text-xs text-red-700 mt-1">Mã quét: {result.bookingCode}</p>
                    )}
                </div>
            )}

            {result?.success && result.booking && (
                <div
                    className={`rounded-lg p-4 mb-4 border-2 ${
                        result.booking.wasPaid
                            ? 'bg-green-50 border-green-400'
                            : 'bg-amber-50 border-amber-400'
                    }`}
                >
                    <p
                        className={`text-xs uppercase tracking-wider font-bold ${
                            result.booking.wasPaid ? 'text-green-800' : 'text-amber-800'
                        }`}
                    >
                        {result.booking.wasPaid ? '✓ Đã thanh toán — cho lên xe' : '⚠ Chưa thanh toán — thu tiền mặt'}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-2">{result.booking.bookingCode}</p>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                        <div className="col-span-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Khách</p>
                            <p className="font-semibold text-gray-900">{result.booking.customerName}</p>
                            <p className="text-gray-700">{result.booking.customerPhone}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Tuyến</p>
                            <p className="font-semibold text-gray-900">{result.booking.route}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Giờ</p>
                            <p className="font-semibold text-gray-900">{result.booking.departureTime}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Số ghế</p>
                            <p className="font-semibold text-gray-900">{result.booking.seats}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Điểm đón</p>
                            <p className="font-semibold text-gray-900">
                                {result.booking.pickupMethod === 'Dọc đường' && result.booking.pickupAddress
                                    ? `Dọc đường — ${result.booking.pickupAddress}`
                                    : 'Tại bến'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Tổng tiền</p>
                            <p className="text-lg font-bold text-sky-700">
                                {(result.booking.totalPrice || 0).toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setResult(null)}
                        className="mt-4 w-full py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium"
                    >
                        Quét vé tiếp theo
                    </button>
                </div>
            )}

            {supported === false && (
                <p className="text-xs text-gray-500 text-center mt-2">
                    Trình duyệt này không hỗ trợ BarcodeDetector. Vui lòng dùng Chrome trên Android hoặc Safari iOS mới, hoặc nhập mã thủ công.
                </p>
            )}
        </div>
    );
}
