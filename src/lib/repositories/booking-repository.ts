/**
 * Booking Repository
 * Các hàm query liên quan đến bookings (PostgreSQL)
 */

import { query, queryOne, queryWithValues, transaction } from '../db';
import { Booking, BookingWithDetails, Payment, BookingStatus, PaymentMethod, PaymentStatus } from '../db-types';

// Helper function để map từ DB row (snake_case) sang Booking object (camelCase)
function mapRowToBooking(row: Record<string, unknown>): Booking {
    return {
        id: row.id as string,
        bookingCode: row.booking_code as string,
        userId: row.user_id as string | null,
        customerName: row.customer_name as string,
        customerPhone: row.customer_phone as string,
        customerEmail: row.customer_email as string | null,
        routeId: row.route_id as string,
        scheduleId: row.schedule_id as string | null,
        date: row.date as Date,
        departureTime: row.departure_time as string,
        seats: row.seats as number,
        totalPrice: row.total_price as number,
        status: row.status as BookingStatus,
        qrCode: row.qr_code as string | null,
        ticketUrl: row.ticket_url as string | null,
        checkedIn: row.checked_in as boolean,
        checkedInAt: row.checked_in_at as Date | null,
        checkedInBy: row.checked_in_by as string | null,
        notes: row.notes as string | null,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    };
}

export class BookingRepository {
    /**
     * Tìm booking theo ID
     */
    static async findById(id: string): Promise<Booking | null> {
        const result = await queryOne<Record<string, unknown>>(
            'SELECT * FROM bookings WHERE id = @id',
            { id }
        );
        return result ? mapRowToBooking(result) : null;
    }

    /**
     * Tìm booking theo booking code
     */
    static async findByCode(bookingCode: string): Promise<Booking | null> {
        const result = await queryOne<Record<string, unknown>>(
            'SELECT * FROM bookings WHERE booking_code = @bookingCode',
            { bookingCode }
        );
        return result ? mapRowToBooking(result) : null;
    }

    /**
     * Tìm booking với đầy đủ thông tin (JOIN route, payment, user)
     */
    static async findByCodeWithDetails(bookingCode: string): Promise<BookingWithDetails | null> {
        const result = await queryOne<Record<string, unknown>>(
            `SELECT
                b.*,
                r.id as route_id, r.origin as route_from, r.destination as route_to, r.price as route_price,
                r.duration as route_duration, r.bus_type as route_bus_type, r.distance as route_distance,
                p.id as payment_id, p.amount as payment_amount, p.method as payment_method,
                p.status as payment_status, p.transaction_id as payment_transaction_id, p.paid_at as payment_paid_at
            FROM bookings b
            LEFT JOIN routes r ON b.route_id = r.id
            LEFT JOIN payments p ON b.id = p.booking_id
            WHERE b.booking_code = @bookingCode`,
            { bookingCode }
        );

        if (!result) return null;

        const booking: BookingWithDetails = {
            id: result.id as string,
            bookingCode: result.booking_code as string,
            userId: result.user_id as string,
            customerName: result.customer_name as string,
            customerPhone: result.customer_phone as string,
            customerEmail: result.customer_email as string,
            routeId: result.route_id as string,
            scheduleId: result.schedule_id as string,
            date: result.date as Date,
            departureTime: result.departure_time as string,
            seats: result.seats as number,
            totalPrice: result.total_price as number,
            status: result.status as BookingStatus,
            qrCode: result.qr_code as string,
            ticketUrl: result.ticket_url as string,
            checkedIn: result.checked_in as boolean,
            checkedInAt: result.checked_in_at as Date,
            checkedInBy: result.checked_in_by as string,
            notes: result.notes as string,
            createdAt: result.created_at as Date,
            updatedAt: result.updated_at as Date,
        };

        if (result.route_id) {
            booking.route = {
                id: result.route_id as string,
                from: result.route_from as string,
                to: result.route_to as string,
                price: result.route_price as number,
                duration: result.route_duration as string,
                busType: result.route_bus_type as string,
                distance: result.route_distance as string,
            } as unknown as typeof booking.route;
        }

        if (result.payment_id) {
            booking.payment = {
                id: result.payment_id as string,
                bookingId: result.id as string,
                amount: result.payment_amount as number,
                method: result.payment_method as string,
                status: result.payment_status as string,
                transactionId: result.payment_transaction_id as string,
                paidAt: result.payment_paid_at as Date,
            } as unknown as typeof booking.payment;
        }

        return booking;
    }

    /**
     * Tìm bookings theo user ID
     */
    static async findByUserId(userId: string): Promise<Booking[]> {
        const results = await query<Record<string, unknown>>(
            'SELECT * FROM bookings WHERE user_id = @userId ORDER BY created_at DESC',
            { userId }
        );
        return results.map(mapRowToBooking);
    }

    /**
     * Tạo booking mới với payment
     */
    static async createWithPayment(data: {
        booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>;
        payment: Omit<Payment, 'id' | 'bookingId' | 'createdAt' | 'updatedAt'>;
    }): Promise<{ booking: Booking; payment: Payment }> {
        const bookingId = crypto.randomUUID();
        const paymentId = crypto.randomUUID();
        const now = new Date();

        // Insert booking
        await queryWithValues(
            `INSERT INTO bookings (
                id, booking_code, user_id, customer_name, customer_phone, customer_email,
                route_id, schedule_id, date, departure_time, seats, total_price, status,
                qr_code, ticket_url, checked_in, notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
            [
                bookingId,
                data.booking.bookingCode,
                data.booking.userId || null,
                data.booking.customerName,
                data.booking.customerPhone,
                data.booking.customerEmail || null,
                data.booking.routeId,
                data.booking.scheduleId || null,
                data.booking.date,
                data.booking.departureTime,
                data.booking.seats,
                data.booking.totalPrice,
                data.booking.status,
                data.booking.qrCode || null,
                data.booking.ticketUrl || null,
                data.booking.checkedIn,
                data.booking.notes || null,
                now,
                now,
            ]
        );

        // Insert payment
        await queryWithValues(
            `INSERT INTO payments (
                id, booking_id, amount, method, status, transaction_id, paid_at, metadata, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                paymentId,
                bookingId,
                data.payment.amount,
                data.payment.method,
                data.payment.status,
                data.payment.transactionId || null,
                data.payment.paidAt || null,
                data.payment.metadata || null,
                now,
                now,
            ]
        );

        const booking = await this.findById(bookingId);
        const payment = await PaymentRepository.findByBookingId(bookingId);

        return { booking: booking!, payment: payment! };
    }

    /**
     * Cập nhật booking status
     */
    static async updateStatus(id: string, status: string): Promise<Booking | null> {
        await query(
            'UPDATE bookings SET status = @status, updated_at = @updatedAt WHERE id = @id',
            { id, status, updatedAt: new Date() }
        );

        return this.findById(id);
    }

    /**
     * Cập nhật check-in
     */
    static async checkIn(
        id: string,
        checkedInBy: string
    ): Promise<Booking | null> {
        await query(
            `UPDATE bookings
             SET checked_in = true, checked_in_at = @checkedInAt, checked_in_by = @checkedInBy, updated_at = @updatedAt
             WHERE id = @id`,
            {
                id,
                checkedInAt: new Date(),
                checkedInBy,
                updatedAt: new Date(),
            }
        );

        return this.findById(id);
    }

    /**
     * Tìm tất cả bookings (với phân trang)
     */
    static async findAll(options?: {
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<Booking[]> {
        let sqlQuery = 'SELECT * FROM bookings';
        const params: Record<string, unknown> = {};

        if (options?.status) {
            sqlQuery += ' WHERE status = @status';
            params.status = options.status;
        }

        sqlQuery += ' ORDER BY created_at DESC';

        if (options?.limit) {
            sqlQuery += ' LIMIT @limit OFFSET @offset';
            params.limit = options.limit;
            params.offset = options.offset || 0;
        }

        const results = await query<Record<string, unknown>>(sqlQuery, params);
        return results.map(mapRowToBooking);
    }

    /**
     * Tìm tất cả bookings với details
     */
    static async findAllWithDetails(options?: {
        status?: string;
        userId?: string;
    }): Promise<unknown[]> {
        let sqlQuery = `
            SELECT
                b.*,
                r.id as route_id, r.origin as route_from, r.destination as route_to, r.bus_type as route_bus_type,
                u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM bookings b
            LEFT JOIN routes r ON b.route_id = r.id
            LEFT JOIN users u ON b.user_id = u.id
        `;
        const params: Record<string, unknown> = {};
        const conditions: string[] = [];

        if (options?.status) {
            conditions.push('b.status = @status');
            params.status = options.status;
        }

        if (options?.userId) {
            conditions.push('b.user_id = @userId');
            params.userId = options.userId;
        }

        if (conditions.length > 0) {
            sqlQuery += ' WHERE ' + conditions.join(' AND ');
        }

        sqlQuery += ' ORDER BY b.created_at DESC';

        const results = await query<Record<string, unknown>>(sqlQuery, params);

        return results.map((result) => ({
            id: result.id,
            bookingCode: result.booking_code,
            userId: result.user_id,
            customerName: result.customer_name,
            customerPhone: result.customer_phone,
            customerEmail: result.customer_email,
            routeId: result.route_id,
            scheduleId: result.schedule_id,
            date: result.date,
            departureTime: result.departure_time,
            seats: result.seats,
            totalPrice: result.total_price,
            status: result.status,
            qrCode: result.qr_code,
            ticketUrl: result.ticket_url,
            checkedIn: result.checked_in,
            checkedInAt: result.checked_in_at,
            checkedInBy: result.checked_in_by,
            notes: result.notes,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
            route: result.route_id ? {
                id: result.route_id,
                from: result.route_from,
                to: result.route_to,
                busType: result.route_bus_type,
            } : null,
            user: result.user_id ? {
                id: result.user_id,
                name: result.user_name,
                email: result.user_email,
                phone: result.user_phone,
            } : null,
        }));
    }

    /**
     * Đếm số lượng bookings
     */
    static async count(status?: string): Promise<number> {
        let sqlQuery = 'SELECT COUNT(*) as total FROM bookings';
        const params: Record<string, unknown> = {};

        if (status) {
            sqlQuery += ' WHERE status = @status';
            params.status = status;
        }

        const result = await queryOne<{ total: string }>(sqlQuery, params);
        return parseInt(result?.total || '0', 10);
    }

    /**
     * Tính tổng doanh thu
     */
    static async totalRevenue(statuses: string[]): Promise<number> {
        const placeholders = statuses.map((_, i) => `$${i + 1}`).join(', ');
        const result = await queryWithValues<{ total: string }>(
            `SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status IN (${placeholders})`,
            statuses
        );
        return parseInt(result[0]?.total || '0', 10);
    }
}

// Helper function để map từ DB row (snake_case) sang Payment object (camelCase)
function mapRowToPayment(row: Record<string, unknown>): Payment {
    return {
        id: row.id as string,
        bookingId: row.booking_id as string,
        amount: row.amount as number,
        method: row.method as PaymentMethod,
        status: row.status as PaymentStatus,
        transactionId: row.transaction_id as string | null,
        paidAt: row.paid_at as Date | null,
        metadata: row.metadata as string | null,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    };
}

/**
 * Payment Repository
 */
export class PaymentRepository {
    static async findByBookingId(bookingId: string): Promise<Payment | null> {
        const result = await queryOne<Record<string, unknown>>(
            'SELECT * FROM payments WHERE booking_id = @bookingId',
            { bookingId }
        );
        return result ? mapRowToPayment(result) : null;
    }

    static async updateStatus(
        bookingId: string,
        status: string,
        transactionId?: string
    ): Promise<Payment | null> {
        const params: Record<string, unknown> = {
            bookingId,
            status,
            updatedAt: new Date(),
        };

        let sqlQuery = 'UPDATE payments SET status = @status, updated_at = @updatedAt';

        if (transactionId) {
            sqlQuery += ', transaction_id = @transactionId, paid_at = @paidAt';
            params.transactionId = transactionId;
            params.paidAt = new Date();
        }

        sqlQuery += ' WHERE booking_id = @bookingId';

        await query(sqlQuery, params);

        return this.findByBookingId(bookingId);
    }

    static async findById(id: string): Promise<Payment | null> {
        const result = await queryOne<Record<string, unknown>>(
            'SELECT * FROM payments WHERE id = @id',
            { id }
        );
        return result ? mapRowToPayment(result) : null;
    }

    static async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
        const id = crypto.randomUUID();
        const now = new Date();

        const metadata = typeof data.metadata === 'object' ? JSON.stringify(data.metadata) : data.metadata;

        await queryWithValues(
            `INSERT INTO payments (id, booking_id, amount, method, status, transaction_id, paid_at, metadata, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                id,
                data.bookingId,
                data.amount,
                data.method,
                data.status,
                data.transactionId || null,
                data.paidAt || null,
                metadata || null,
                now,
                now,
            ]
        );

        return (await this.findById(id))!;
    }

    static async update(
        id: string,
        data: Partial<Omit<Payment, 'id' | 'bookingId' | 'createdAt' | 'updatedAt'>>
    ): Promise<Payment | null> {
        const updates: string[] = [];
        const params: Record<string, unknown> = { id, updatedAt: new Date() };

        const columnMap: Record<string, string> = {
            transactionId: 'transaction_id',
            paidAt: 'paid_at',
        };

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                const columnName = columnMap[key] || key;
                if (key === 'metadata' && typeof value === 'object') {
                    params[key] = JSON.stringify(value);
                } else {
                    params[key] = value;
                }
                updates.push(`${columnName} = @${key}`);
            }
        });

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push('updated_at = @updatedAt');

        await query(
            `UPDATE payments SET ${updates.join(', ')} WHERE id = @id`,
            params
        );

        return this.findById(id);
    }
}
