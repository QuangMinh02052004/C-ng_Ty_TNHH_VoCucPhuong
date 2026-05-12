'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface CurrentTrip {
    id: number;
    startedAt: string;
    completedAt?: string | null;
    vehiclePlate: string | null;
    passengerCount: number;
    paidOnline: number;
    expectedCash: number;
    totalAmount: number;
}

interface ScanResult {
    success?: boolean;
    duplicate?: boolean;
    booking?: {
        bookingCode: string;
        customerName: string;
        customerPhone: string;
        route: string;
        departureTime: string;
        seats: number;
        totalPrice: number;
        wasPaid: boolean;
        pickupMethod: string | null;
        pickupAddress: string | null;
    };
    error?: string;
    bookingCode?: string;
}

declare global {
    interface Window { BarcodeDetector?: any; }
}

function formatTime(iso: string): string {
    try { return new Date(iso).toLocaleString('vi-VN', { hour12: false }); }
    catch { return iso; }
}

function formatVND(n: number): string {
    return (n || 0).toLocaleString('vi-VN') + ' đ';
}

export default function DriverScanPage() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<any>(null);
    const scanningRef = useRef(false);

    const [supported, setSupported] = useState<boolean | null>(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [recentCodes, setRecentCodes] = useState<Set<string>>(new Set());

    const [trip, setTrip] = useState<CurrentTrip | null>(null);
    const [tripLoading, setTripLoading] = useState(false);
    const [tripActing, setTripActing] = useState(false);
    const [completedSummary, setCompletedSummary] = useState<CurrentTrip | null>(null);

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

    // Load current trip
    const loadCurrentTrip = useCallback(async () => {
        setTripLoading(true);
        try {
            const res = await fetch('/api/driver/trips/current', { cache: 'no-store' });
            const data = await res.json();
            setTrip(data.trip || null);
        } catch { /* ignore */ }
        finally { setTripLoading(false); }
    }, []);

    useEffect(() => { loadCurrentTrip(); }, [loadCurrentTrip]);

    const stopCamera = () => {
        scanningRef.current = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraOn(false);
    };

    useEffect(() => () => stopCamera(), []);

    const startCamera = async () => {
        setCameraError(null);
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
            setCameraError(e?.message || 'Không mở được camera');
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
                    scanningRef.current = false;
                    setRecentCodes(prev => new Set(prev).add(code));
                    await doScan(code);
                    setTimeout(() => {
                        scanningRef.current = true;
                        scanLoop();
                    }, 2000);
                    return;
                }
            }
        } catch { /* ignore */ }
        requestAnimationFrame(scanLoop);
    };

    const extractBookingCode = (raw: string): string => {
        const m = raw.match(/VCP\d+/i);
        if (m) return m[0].toUpperCase();
        return raw.trim();
    };

    const doScan = async (bookingCode: string) => {
        setScanning(true);
        setResult(null);
        try {
            const res = await fetch('/api/driver/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingCode }),
            });
            const data = await res.json();
            if (!res.ok) {
                setResult({ error: data.error || 'Lỗi quét vé', bookingCode });
                if (data.code === 'NO_OPEN_TRIP') {
                    // load lại trạng thái trip
                    loadCurrentTrip();
                }
            } else {
                setResult(data);
                loadCurrentTrip(); // refresh totals
            }
            if ('vibrate' in navigator) {
                navigator.vibrate(data.success && data.booking?.wasPaid ? [100] : [50, 50, 50]);
            }
        } catch {
            setResult({ error: 'Lỗi mạng khi quét vé', bookingCode });
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

    const handleStartTrip = async () => {
        setTripActing(true);
        try {
            const res = await fetch('/api/driver/trips/start', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Không bắt đầu được chuyến');
                return;
            }
            await loadCurrentTrip();
            setRecentCodes(new Set()); // reset cache khi bắt đầu chuyến mới
        } finally {
            setTripActing(false);
        }
    };

    const handleCompleteTrip = async () => {
        if (!confirm('Hoàn thành chuyến này? Sau khi kết thúc sẽ không quét thêm vé được.')) return;
        setTripActing(true);
        try {
            stopCamera();
            const res = await fetch('/api/driver/trips/complete', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Không kết thúc được chuyến');
                return;
            }
            setCompletedSummary(data.trip);
            setTrip(null);
            setResult(null);
        } finally {
            setTripActing(false);
        }
    };

    return (
        <div className="p-3 md:p-5 space-y-4">
            {/* Trạng thái chuyến */}
            {tripLoading ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
                    Đang tải...
                </div>
            ) : !trip ? (
                // Chưa có chuyến đang mở
                <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
                    <p className="text-sm text-gray-600 mb-3">Chưa có chuyến đang chạy</p>
                    <button
                        onClick={handleStartTrip}
                        disabled={tripActing}
                        className="w-full px-4 py-3 bg-sky-600 text-white text-base font-semibold rounded-lg hover:bg-sky-700 disabled:bg-sky-400"
                    >
                        {tripActing ? 'Đang xử lý...' : 'Bắt đầu chuyến'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        Bấm trước khi bắt đầu đón khách. Khi tới nơi, bấm &quot;Hoàn thành chuyến&quot; để tổng kết.
                    </p>
                </div>
            ) : (
                // Đang trong chuyến
                <div className="bg-white border-2 border-sky-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-sky-700 font-bold">CHUYẾN ĐANG CHẠY</p>
                            <p className="text-xs text-gray-600">
                                Bắt đầu: {formatTime(trip.startedAt)}
                            </p>
                        </div>
                        <button
                            onClick={handleCompleteTrip}
                            disabled={tripActing}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded hover:bg-emerald-700 disabled:bg-emerald-400 shrink-0"
                        >
                            Hoàn thành chuyến
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 rounded p-2">
                            <p className="text-[10px] text-gray-500 uppercase">Khách</p>
                            <p className="text-base font-bold text-gray-900">{trip.passengerCount}</p>
                        </div>
                        <div className="bg-green-50 rounded p-2">
                            <p className="text-[10px] text-green-700 uppercase">Đã TT</p>
                            <p className="text-sm font-bold text-green-800">{formatVND(trip.paidOnline)}</p>
                        </div>
                        <div className="bg-amber-50 rounded p-2">
                            <p className="text-[10px] text-amber-700 uppercase">Tiền mặt</p>
                            <p className="text-sm font-bold text-amber-800">{formatVND(trip.expectedCash)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Camera viewport (chỉ hiện khi có chuyến đang mở) */}
            {trip && (
                <>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                        <div className="p-3">
                            {!cameraOn ? (
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    disabled={supported === false}
                                    className="w-full px-4 py-3 bg-sky-600 text-white rounded-lg font-semibold disabled:bg-gray-300"
                                >
                                    {supported === false ? 'Trình duyệt không hỗ trợ quét QR' : 'Bật camera'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={stopCamera}
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg font-semibold"
                                >
                                    Tắt camera
                                </button>
                            )}
                            {cameraError && (
                                <p className="text-xs text-red-600 mt-2">{cameraError}</p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleManualSubmit} className="bg-white border border-gray-200 rounded-lg p-3 flex gap-2">
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
                </>
            )}

            {scanning && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-600">
                    Đang kiểm tra vé...
                </div>
            )}

            {result?.error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wider text-red-700 font-semibold">Quét thất bại</p>
                    <p className="text-base font-bold text-red-900 mt-1">{result.error}</p>
                    {result.bookingCode && (
                        <p className="text-xs text-red-700 mt-1">Mã quét: {result.bookingCode}</p>
                    )}
                </div>
            )}

            {result?.success && result.booking && (
                <div
                    className={`rounded-lg p-4 border-2 ${
                        result.duplicate
                            ? 'bg-blue-50 border-blue-300'
                            : result.booking.wasPaid
                                ? 'bg-green-50 border-green-400'
                                : 'bg-amber-50 border-amber-400'
                    }`}
                >
                    <p className={`text-xs uppercase tracking-wider font-bold ${
                        result.duplicate ? 'text-blue-800'
                            : result.booking.wasPaid ? 'text-green-800' : 'text-amber-800'
                    }`}>
                        {result.duplicate
                            ? 'Vé đã quét trong chuyến này (không cộng đôi)'
                            : result.booking.wasPaid
                                ? 'Đã thanh toán — cho lên xe'
                                : 'Chưa thanh toán — thu tiền mặt'}
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
                            <p className="text-lg font-bold text-sky-700">{formatVND(result.booking.totalPrice)}</p>
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

            {/* Modal tổng kết chuyến đã hoàn thành */}
            {completedSummary && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-5 py-4 border-b border-gray-200 bg-emerald-50">
                            <p className="text-xs uppercase tracking-wider text-emerald-700 font-bold">Chuyến đã hoàn thành</p>
                            <p className="text-sm text-gray-700 mt-1">
                                {formatTime(completedSummary.startedAt)} → {completedSummary.completedAt ? formatTime(completedSummary.completedAt) : 'Bây giờ'}
                            </p>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Tổng khách</span>
                                <span className="text-xl font-bold text-gray-900">{completedSummary.passengerCount}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Đã thanh toán online</span>
                                <span className="text-lg font-bold text-green-700">{formatVND(completedSummary.paidOnline)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Tiền mặt cần thu</span>
                                <span className="text-lg font-bold text-amber-700">{formatVND(completedSummary.expectedCash)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                                <span className="text-sm font-semibold text-gray-800">Tổng doanh thu</span>
                                <span className="text-xl font-bold text-sky-700">{formatVND(completedSummary.totalAmount)}</span>
                            </div>
                        </div>
                        <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setCompletedSummary(null)}
                                className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded hover:bg-sky-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {supported === false && trip && (
                <p className="text-xs text-gray-500 text-center">
                    Trình duyệt không hỗ trợ camera QR. Dùng Chrome (Android) hoặc Safari (iOS) mới, hoặc nhập mã thủ công.
                </p>
            )}
        </div>
    );
}
