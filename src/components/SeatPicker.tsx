'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const TONGHOP_URL = process.env.NEXT_PUBLIC_TONGHOP_URL || 'https://vocucphuongmanage.vercel.app';
const SEAT_COUNT = 28;
const POLL_MS = 4000;

interface Lock {
    id: number;
    seatNumber: number;
    lockedBy: string;
    expiresAt: string;
}
interface Booking {
    seatNumber: number;
    name?: string;
}
interface TimeSlot {
    id: number;
    time: string;
    date: string;
    route: string;
}

interface Props {
    date: string;          // YYYY-MM-DD (DatVe format)
    departureTime: string; // HH:MM
    routeName: string;     // canonical TongHop name: "Long Khánh - Sài Gòn (Cao tốc)"
    maxSeats: number;
    selectedSeats: number[];
    onChange: (seats: number[]) => void;
}

function formatDateDDMMYYYY(isoDate: string): string {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}-${m}-${y}`;
}

function getGuestId(): string {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('vcp-guest-id');
    if (!id) {
        id = `guest-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
        localStorage.setItem('vcp-guest-id', id);
    }
    return id;
}

function formatRemaining(ms: number): string {
    if (ms <= 0) return '0:00';
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SeatPicker({ date, departureTime, routeName, maxSeats, selectedSeats, onChange }: Props) {
    const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [locks, setLocks] = useState<Lock[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [now, setNow] = useState(Date.now());
    const guestId = useRef<string>('');

    const tongHopDate = formatDateDDMMYYYY(date);
    const ready = !!(tongHopDate && departureTime && routeName);

    useEffect(() => {
        guestId.current = getGuestId();
    }, []);

    // Tick mỗi giây cho countdown
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    // Fetch timeslot khớp date+route+time
    useEffect(() => {
        if (!ready) {
            setTimeSlot(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const url = `${TONGHOP_URL}/api/tong-hop/timeslots?date=${encodeURIComponent(tongHopDate)}&route=${encodeURIComponent(routeName)}`;
                const res = await fetch(url, { cache: 'no-store' });
                const data = await res.json();
                if (cancelled) return;
                const arr: TimeSlot[] = Array.isArray(data) ? data : [];
                const found = arr.find(s => s.time === departureTime);
                setTimeSlot(found || null);
            } catch (e) {
                if (!cancelled) setTimeSlot(null);
            }
        })();
        return () => { cancelled = true; };
    }, [tongHopDate, routeName, departureTime, ready]);

    // Polling bookings + locks
    const fetchState = useCallback(async () => {
        if (!ready || !timeSlot) return;
        try {
            const [bRes, lRes] = await Promise.all([
                fetch(`${TONGHOP_URL}/api/tong-hop/bookings?date=${encodeURIComponent(tongHopDate)}&route=${encodeURIComponent(routeName)}`, { cache: 'no-store' }),
                fetch(`${TONGHOP_URL}/api/tong-hop/seat-locks?date=${encodeURIComponent(tongHopDate)}&route=${encodeURIComponent(routeName)}`, { cache: 'no-store' }),
            ]);
            const [bData, lData] = await Promise.all([bRes.json(), lRes.json()]);
            const allBookings: Booking[] = Array.isArray(bData) ? bData : (bData.bookings || []);
            const filteredBookings = allBookings.filter((b: any) => b.timeSlotId === timeSlot.id && b.seatNumber > 0);
            const allLocks: Lock[] = Array.isArray(lData) ? lData : [];
            const filteredLocks = allLocks.filter((l: any) => l.timeSlotId === timeSlot.id);
            setBookings(filteredBookings);
            setLocks(filteredLocks);
        } catch (e) {
            // im lặng – polling lần sau retry
        }
    }, [ready, timeSlot, tongHopDate, routeName]);

    useEffect(() => {
        if (!ready || !timeSlot) return;
        fetchState();
        const t = setInterval(fetchState, POLL_MS);
        return () => clearInterval(t);
    }, [ready, timeSlot, fetchState]);

    // Reset selection khi đổi date/time/route
    useEffect(() => {
        onChange([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, departureTime, routeName]);

    const bookedSet = new Set(bookings.map(b => b.seatNumber));
    const lockByMe = new Map<number, Lock>();
    const lockByOther = new Map<number, Lock>();
    for (const l of locks) {
        if (l.lockedBy === guestId.current) lockByMe.set(l.seatNumber, l);
        else lockByOther.set(l.seatNumber, l);
    }

    const handleClick = async (num: number) => {
        if (busy) return;
        if (!timeSlot) {
            setError('Chưa sẵn sàng khung giờ. Vui lòng đợi 1 giây.');
            return;
        }
        if (bookedSet.has(num)) {
            setError(`Ghế ${num} đã có khách đặt.`);
            return;
        }
        if (lockByOther.has(num)) {
            setError(`Ghế ${num} đang có người khác giữ. Hãy chọn ghế khác.`);
            return;
        }

        setError(null);
        setBusy(true);
        try {
            if (selectedSeats.includes(num)) {
                // Bỏ chọn → DELETE lock (JSON body)
                await fetch(`${TONGHOP_URL}/api/tong-hop/seat-locks/by-seat`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        timeSlotId: timeSlot.id,
                        seatNumber: num,
                        date: tongHopDate,
                        route: routeName,
                        lockedBy: guestId.current,
                    }),
                });
                onChange(selectedSeats.filter(s => s !== num));
            } else {
                if (selectedSeats.length >= maxSeats) {
                    setError(`Bạn chỉ được chọn tối đa ${maxSeats} ghế.`);
                    return;
                }
                // Chọn → POST lock
                const res = await fetch(`${TONGHOP_URL}/api/tong-hop/seat-locks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        timeSlotId: timeSlot.id,
                        seatNumber: num,
                        lockedBy: guestId.current,
                        date: tongHopDate,
                        route: routeName,
                    }),
                });
                if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    setError(j.error || `Không khóa được ghế ${num}, có thể vừa bị người khác giữ.`);
                    return;
                }
                onChange([...selectedSeats, num]);
            }
            fetchState();
        } catch (e) {
            setError('Lỗi mạng khi giữ ghế. Vui lòng thử lại.');
        } finally {
            setBusy(false);
        }
    };

    if (!ready) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
                Chọn tuyến, ngày và giờ xuất bến để xem sơ đồ ghế.
            </div>
        );
    }

    if (!timeSlot) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
                Đang chuẩn bị sơ đồ ghế cho chuyến {departureTime}...
            </div>
        );
    }

    const renderSeat = (num: number) => {
        const isBooked = bookedSet.has(num);
        const myLock = lockByMe.get(num);
        const otherLock = lockByOther.get(num);
        const isSelected = selectedSeats.includes(num);

        let cls = 'border border-gray-300 bg-white text-gray-800 hover:border-sky-400 hover:bg-sky-50';
        if (isBooked) cls = 'border border-gray-300 bg-gray-300 text-gray-500 cursor-not-allowed';
        else if (otherLock) cls = 'border border-amber-300 bg-amber-100 text-amber-700 cursor-not-allowed';
        else if (isSelected) cls = 'border border-sky-500 bg-sky-500 text-white shadow-sm';

        const remaining = myLock ? new Date(myLock.expiresAt).getTime() - now : 0;

        return (
            <button
                key={num}
                type="button"
                onClick={() => handleClick(num)}
                disabled={isBooked || !!otherLock || busy}
                className={`relative w-12 h-12 md:w-14 md:h-14 rounded-md text-sm font-semibold transition-colors ${cls}`}
                title={
                    isBooked ? `Ghế ${num} - Đã đặt` :
                        otherLock ? `Ghế ${num} - Có người khác đang giữ` :
                            isSelected ? `Ghế ${num} - Đang giữ ${formatRemaining(remaining)}` :
                                `Ghế ${num} - Trống`
                }
            >
                {num}
                {isSelected && remaining > 0 && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-sky-700 text-white px-1 rounded">
                        {formatRemaining(remaining)}
                    </span>
                )}
            </button>
        );
    };

    const rows: number[][] = [];
    for (let r = 0; r < 7; r++) {
        rows.push([r * 4 + 1, r * 4 + 2, r * 4 + 3, r * 4 + 4]);
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
            <div className="flex flex-wrap items-baseline justify-between mb-4 gap-2">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Chọn ghế trên sơ đồ</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Ghế giữ 10 phút. Nếu không thanh toán trong thời gian này, ghế sẽ tự nhả cho khách khác.
                    </p>
                </div>
                <div className="text-sm text-gray-600">
                    Đã chọn <span className="font-semibold text-sky-600">{selectedSeats.length}</span> / {maxSeats}
                </div>
            </div>

            {/* Sơ đồ xe */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6">
                <div className="flex justify-end mb-3">
                    <div className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 bg-white">
                        Tài xế
                    </div>
                </div>
                <div className="flex flex-col gap-2 md:gap-3 items-center">
                    {rows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 md:gap-2">
                            {renderSeat(row[0])}
                            {renderSeat(row[1])}
                            <div className="w-4 md:w-6" />
                            {renderSeat(row[2])}
                            {renderSeat(row[3])}
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs text-gray-400 mt-4">Cuối xe</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 md:gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border border-gray-300 bg-white inline-block" />
                    <span className="text-gray-600">Trống</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border border-sky-500 bg-sky-500 inline-block" />
                    <span className="text-gray-600">Bạn đang chọn</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border border-amber-300 bg-amber-100 inline-block" />
                    <span className="text-gray-600">Người khác đang giữ</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border border-gray-300 bg-gray-300 inline-block" />
                    <span className="text-gray-600">Đã đặt</span>
                </div>
            </div>

            {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                </div>
            )}
        </div>
    );
}
