/**
 * Database Types
 * TypeScript types cho các bảng trong database
 */

// Enums
export type UserRole = 'USER' | 'STAFF' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'QRCODE' | 'VNPAY' | 'MOMO';

// User
export interface User {
    id: string;
    email: string;
    emailVerified?: Date | null;
    password?: string | null;
    name: string;
    phone?: string | null;
    avatar?: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

// Account (OAuth)
export interface Account {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
}

// Session
export interface Session {
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
}

// Route
export interface Route {
    id: string;
    from: string;
    to: string;
    price: number;
    duration: string;
    busType: string;
    distance?: string | null;
    description?: string | null;
    routeMapImage?: string | null;
    thumbnailImage?: string | null;
    images?: string | null; // JSON string
    fromLat?: number | null;
    fromLng?: number | null;
    toLat?: number | null;
    toLng?: number | null;
    operatingStart: string;
    operatingEnd: string;
    intervalMinutes: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Bus
export interface Bus {
    id: string;
    licensePlate: string;
    busType: string;
    totalSeats: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schedule
export interface Schedule {
    id: string;
    routeId: string;
    busId: string;
    date: Date;
    departureTime: string;
    availableSeats: number;
    totalSeats: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

// Booking
export interface Booking {
    id: string;
    bookingCode: string;
    userId?: string | null;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    routeId: string;
    scheduleId?: string | null;
    date: Date;
    departureTime: string;
    seats: number;
    totalPrice: number;
    status: BookingStatus;
    qrCode?: string | null;
    ticketUrl?: string | null;
    checkedIn: boolean;
    checkedInAt?: Date | null;
    checkedInBy?: string | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Payment
export interface Payment {
    id: string;
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string | null;
    paidAt?: Date | null;
    metadata?: string | null; // JSON string
    createdAt: Date;
    updatedAt: Date;
}

// Helper types cho JOIN queries
export interface BookingWithDetails extends Booking {
    route?: Route;
    schedule?: Schedule;
    user?: User;
    payment?: Payment;
}

export interface ScheduleWithDetails extends Schedule {
    route?: Route;
    bus?: Bus;
}
