// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Generate unique booking code
 * Format: VCPYYYYMMDDXXXX (NO hyphens for bank transfer compatibility)
 * VCP = Võ Cúc Phương
 * Example: VCP202511106100
 */
export function generateBookingCode(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

    return `VCP${year}${month}${day}${random}`;
}

/**
 * Format date to Vietnamese format
 */
export function formatDateVN(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
    return `${amount.toLocaleString('vi-VN')} đ`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate Vietnamese phone number
 */
export function isValidPhone(phone: string): boolean {
    // Vietnamese phone: 10-11 digits, start with 0
    const re = /^0\d{9,10}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return cleaned;
}

/**
 * Calculate time difference in minutes
 */
export function getMinutesDifference(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);

    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;

    return Math.abs(minutes2 - minutes1);
}

/**
 * Add minutes to time
 */
export function addMinutesToTime(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    let totalMinutes = h * 60 + m + minutes;

    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Generate time slots between start and end time
 */
export function generateTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number = 30
): string[] {
    const slots: string[] = [];
    let currentTime = startTime;

    while (true) {
        slots.push(currentTime);

        if (currentTime === endTime) break;

        currentTime = addMinutesToTime(currentTime, intervalMinutes);

        // Prevent infinite loop
        if (slots.length > 100) break;
    }

    return slots;
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < now;
}

/**
 * Check if datetime is in the past
 */
export function isPastDateTime(date: Date | string, time: string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const [hours, minutes] = time.split(':').map(Number);

    d.setHours(hours, minutes, 0, 0);

    return d < new Date();
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sanitize string (remove special characters)
 */
export function sanitizeString(str: string): string {
    return str.replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Hash password (for bcrypt)
 */
export async function hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
}

/**
 * Create slug from Vietnamese string
 */
export function createSlug(str: string): string {
    str = str.toLowerCase();

    // Remove accents
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Replace đ
    str = str.replace(/đ/g, 'd');

    // Remove special characters
    str = str.replace(/[^a-z0-9\s-]/g, '');

    // Replace spaces with -
    str = str.replace(/\s+/g, '-');

    // Remove consecutive -
    str = str.replace(/-+/g, '-');

    // Trim -
    str = str.replace(/^-+|-+$/g, '');

    return str;
}
