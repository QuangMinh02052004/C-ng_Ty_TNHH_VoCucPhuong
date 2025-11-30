/**
 * Booking Repository
 * Các hàm query liên quan đến bookings
 */

import { query, queryOne, transaction, sql } from '../db';
import { Booking, BookingWithDetails, Payment } from '../db-types';

export class BookingRepository {
    /**
     * Tìm booking theo ID
     */
    static async findById(id: string): Promise<Booking | null> {
        return await queryOne<Booking>(
            'SELECT * FROM bookings WHERE id = @id',
            { id }
        );
    }

    /**
     * Tìm booking theo booking code
     */
    static async findByCode(bookingCode: string): Promise<Booking | null> {
        return await queryOne<Booking>(
            'SELECT * FROM bookings WHERE bookingCode = @bookingCode',
            { bookingCode }
        );
    }

    /**
     * Tìm booking với đầy đủ thông tin (JOIN route, payment, user)
     */
    static async findByCodeWithDetails(bookingCode: string): Promise<BookingWithDetails | null> {
        const result = await queryOne<any>(
            `SELECT
                b.*,
                r.id as route_id, r.[from] as route_from, r.[to] as route_to, r.price as route_price,
                r.duration as route_duration, r.busType as route_busType, r.distance as route_distance,
                p.id as payment_id, p.amount as payment_amount, p.method as payment_method,
                p.status as payment_status, p.transactionId as payment_transactionId, p.paidAt as payment_paidAt
            FROM bookings b
            LEFT JOIN routes r ON b.routeId = r.id
            LEFT JOIN payments p ON b.id = p.bookingId
            WHERE b.bookingCode = @bookingCode`,
            { bookingCode }
        );

        if (!result) return null;

        // Transform flat result to nested object
        const booking: BookingWithDetails = {
            id: result.id,
            bookingCode: result.bookingCode,
            userId: result.userId,
            customerName: result.customerName,
            customerPhone: result.customerPhone,
            customerEmail: result.customerEmail,
            routeId: result.routeId,
            scheduleId: result.scheduleId,
            date: result.date,
            departureTime: result.departureTime,
            seats: result.seats,
            totalPrice: result.totalPrice,
            status: result.status,
            qrCode: result.qrCode,
            ticketUrl: result.ticketUrl,
            checkedIn: result.checkedIn,
            checkedInAt: result.checkedInAt,
            checkedInBy: result.checkedInBy,
            notes: result.notes,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };

        if (result.route_id) {
            booking.route = {
                id: result.route_id,
                from: result.route_from,
                to: result.route_to,
                price: result.route_price,
                duration: result.route_duration,
                busType: result.route_busType,
                distance: result.route_distance,
            } as any;
        }

        if (result.payment_id) {
            booking.payment = {
                id: result.payment_id,
                bookingId: result.id,
                amount: result.payment_amount,
                method: result.payment_method,
                status: result.payment_status,
                transactionId: result.payment_transactionId,
                paidAt: result.payment_paidAt,
            } as any;
        }

        return booking;
    }

    /**
     * Tìm booking với đầy đủ thông tin bao gồm schedule và bus (dùng cho QR code view)
     */
    static async findByCodeWithFullDetails(bookingCode: string): Promise<any | null> {
        const result = await queryOne<any>(
            `SELECT
                b.*,
                r.id as route_id, r.[from] as route_from, r.[to] as route_to, r.price as route_price,
                r.duration as route_duration, r.busType as route_busType, r.distance as route_distance,
                s.id as schedule_id, s.date as schedule_date, s.departureTime as schedule_departureTime,
                bus.id as bus_id, bus.licensePlate as bus_licensePlate, bus.busType as bus_busType,
                p.id as payment_id, p.amount as payment_amount, p.method as payment_method,
                p.status as payment_status, p.transactionId as payment_transactionId, p.paidAt as payment_paidAt
            FROM bookings b
            LEFT JOIN routes r ON b.routeId = r.id
            LEFT JOIN schedules s ON b.scheduleId = s.id
            LEFT JOIN buses bus ON s.busId = bus.id
            LEFT JOIN payments p ON b.id = p.bookingId
            WHERE b.bookingCode = @bookingCode`,
            { bookingCode }
        );

        if (!result) return null;

        return {
            id: result.id,
            bookingCode: result.bookingCode,
            userId: result.userId,
            customerName: result.customerName,
            customerPhone: result.customerPhone,
            customerEmail: result.customerEmail,
            routeId: result.routeId,
            scheduleId: result.scheduleId,
            date: result.date,
            departureTime: result.departureTime,
            seats: result.seats,
            totalPrice: result.totalPrice,
            status: result.status,
            qrCode: result.qrCode,
            ticketUrl: result.ticketUrl,
            checkedIn: result.checkedIn,
            checkedInAt: result.checkedInAt,
            checkedInBy: result.checkedInBy,
            notes: result.notes,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            route: result.route_id ? {
                from: result.route_from,
                to: result.route_to,
                duration: result.route_duration,
                busType: result.route_busType,
                distance: result.route_distance,
                price: result.route_price,
            } : null,
            schedule: result.schedule_id ? {
                date: result.schedule_date,
                departureTime: result.schedule_departureTime,
                bus: result.bus_id ? {
                    licensePlate: result.bus_licensePlate,
                    busType: result.bus_busType,
                } : null,
            } : null,
            payment: result.payment_id ? {
                method: result.payment_method,
                status: result.payment_status,
                paidAt: result.payment_paidAt,
            } : null,
        };
    }

    /**
     * Tìm booking với route và user (dùng cho check-in)
     */
    static async findByCodeWithRouteAndUser(bookingCode: string): Promise<any | null> {
        const result = await queryOne<any>(
            `SELECT
                b.*,
                r.id as route_id, r.[from] as route_from, r.[to] as route_to,
                u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM bookings b
            LEFT JOIN routes r ON b.routeId = r.id
            LEFT JOIN users u ON b.userId = u.id
            WHERE b.bookingCode = @bookingCode`,
            { bookingCode }
        );

        if (!result) return null;

        return {
            id: result.id,
            bookingCode: result.bookingCode,
            userId: result.userId,
            customerName: result.customerName,
            customerPhone: result.customerPhone,
            customerEmail: result.customerEmail,
            routeId: result.routeId,
            scheduleId: result.scheduleId,
            date: result.date,
            departureTime: result.departureTime,
            seats: result.seats,
            totalPrice: result.totalPrice,
            status: result.status,
            qrCode: result.qrCode,
            ticketUrl: result.ticketUrl,
            checkedIn: result.checkedIn,
            checkedInAt: result.checkedInAt,
            checkedInBy: result.checkedInBy,
            notes: result.notes,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            route: result.route_id ? {
                id: result.route_id,
                from: result.route_from,
                to: result.route_to,
            } : null,
            user: result.user_id ? {
                id: result.user_id,
                name: result.user_name,
                email: result.user_email,
                phone: result.user_phone,
            } : null,
        };
    }

    /**
     * Tìm bookings theo user ID
     */
    static async findByUserId(userId: string): Promise<Booking[]> {
        return await query<Booking>(
            'SELECT * FROM bookings WHERE userId = @userId ORDER BY createdAt DESC',
            { userId }
        );
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

        // Sử dụng transaction để đảm bảo atomic
        await transaction(async (tx) => {
            const request = new sql.Request(tx);

            // Insert booking
            await request
                .input('id', sql.NVarChar, bookingId)
                .input('bookingCode', sql.NVarChar, data.booking.bookingCode)
                .input('userId', sql.NVarChar, data.booking.userId || null)
                .input('customerName', sql.NVarChar, data.booking.customerName)
                .input('customerPhone', sql.NVarChar, data.booking.customerPhone)
                .input('customerEmail', sql.NVarChar, data.booking.customerEmail || null)
                .input('routeId', sql.NVarChar, data.booking.routeId)
                .input('scheduleId', sql.NVarChar, data.booking.scheduleId || null)
                .input('date', sql.DateTime2, data.booking.date)
                .input('departureTime', sql.NVarChar, data.booking.departureTime)
                .input('seats', sql.Int, data.booking.seats)
                .input('totalPrice', sql.Int, data.booking.totalPrice)
                .input('status', sql.NVarChar, data.booking.status)
                .input('qrCode', sql.NVarChar(sql.MAX), data.booking.qrCode || null)
                .input('ticketUrl', sql.NVarChar, data.booking.ticketUrl || null)
                .input('checkedIn', sql.Bit, data.booking.checkedIn)
                .input('notes', sql.NVarChar(sql.MAX), data.booking.notes || null)
                .input('createdAt', sql.DateTime2, now)
                .input('updatedAt', sql.DateTime2, now)
                .query(`
                    INSERT INTO bookings (
                        id, bookingCode, userId, customerName, customerPhone, customerEmail,
                        routeId, scheduleId, date, departureTime, seats, totalPrice, status,
                        qrCode, ticketUrl, checkedIn, notes, createdAt, updatedAt
                    ) VALUES (
                        @id, @bookingCode, @userId, @customerName, @customerPhone, @customerEmail,
                        @routeId, @scheduleId, @date, @departureTime, @seats, @totalPrice, @status,
                        @qrCode, @ticketUrl, @checkedIn, @notes, @createdAt, @updatedAt
                    )
                `);

            // Insert payment
            await request
                .input('paymentId', sql.NVarChar, paymentId)
                .input('bookingId', sql.NVarChar, bookingId)
                .input('amount', sql.Int, data.payment.amount)
                .input('method', sql.NVarChar, data.payment.method)
                .input('paymentStatus', sql.NVarChar, data.payment.status)
                .input('transactionId', sql.NVarChar, data.payment.transactionId || null)
                .input('paidAt', sql.DateTime2, data.payment.paidAt || null)
                .input('metadata', sql.NVarChar(sql.MAX), data.payment.metadata || null)
                .query(`
                    INSERT INTO payments (
                        id, bookingId, amount, method, status, transactionId, paidAt, metadata, createdAt, updatedAt
                    ) VALUES (
                        @paymentId, @bookingId, @amount, @method, @paymentStatus, @transactionId, @paidAt, @metadata, @createdAt, @updatedAt
                    )
                `);
        });

        const booking = await this.findById(bookingId);
        const payment = await PaymentRepository.findByBookingId(bookingId);

        return { booking: booking!, payment: payment! };
    }

    /**
     * Cập nhật booking status
     */
    static async updateStatus(id: string, status: string): Promise<Booking | null> {
        await query(
            'UPDATE bookings SET status = @status, updatedAt = @updatedAt WHERE id = @id',
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
             SET checkedIn = 1, checkedInAt = @checkedInAt, checkedInBy = @checkedInBy, updatedAt = @updatedAt
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
        const params: Record<string, any> = {};

        if (options?.status) {
            sqlQuery += ' WHERE status = @status';
            params.status = options.status;
        }

        sqlQuery += ' ORDER BY createdAt DESC';

        if (options?.limit) {
            sqlQuery += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
            params.limit = options.limit;
            params.offset = options.offset || 0;
        }

        return await query<Booking>(sqlQuery, params);
    }

    /**
     * Tìm tất cả bookings với details (JOIN route, user)
     */
    static async findAllWithDetails(options?: {
        status?: string;
        userId?: string;
    }): Promise<any[]> {
        let sqlQuery = `
            SELECT
                b.*,
                r.id as route_id, r.[from] as route_from, r.[to] as route_to, r.busType as route_busType,
                u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM bookings b
            LEFT JOIN routes r ON b.routeId = r.id
            LEFT JOIN users u ON b.userId = u.id
        `;
        const params: Record<string, any> = {};
        const conditions: string[] = [];

        if (options?.status) {
            conditions.push('b.status = @status');
            params.status = options.status;
        }

        if (options?.userId) {
            conditions.push('b.userId = @userId');
            params.userId = options.userId;
        }

        if (conditions.length > 0) {
            sqlQuery += ' WHERE ' + conditions.join(' AND ');
        }

        sqlQuery += ' ORDER BY b.createdAt DESC';

        const results = await query<any>(sqlQuery, params);

        // Transform flat results to nested objects
        return results.map((result: any) => ({
            id: result.id,
            bookingCode: result.bookingCode,
            userId: result.userId,
            customerName: result.customerName,
            customerPhone: result.customerPhone,
            customerEmail: result.customerEmail,
            routeId: result.routeId,
            scheduleId: result.scheduleId,
            date: result.date,
            departureTime: result.departureTime,
            seats: result.seats,
            totalPrice: result.totalPrice,
            status: result.status,
            qrCode: result.qrCode,
            ticketUrl: result.ticketUrl,
            checkedIn: result.checkedIn,
            checkedInAt: result.checkedInAt,
            checkedInBy: result.checkedInBy,
            notes: result.notes,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            route: result.route_id ? {
                id: result.route_id,
                from: result.route_from,
                to: result.route_to,
                busType: result.route_busType,
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
     * Cập nhật booking
     */
    static async update(
        id: string,
        data: Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<Booking | null> {
        const updates: string[] = [];
        const params: Record<string, any> = { id, updatedAt: new Date() };

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                updates.push(`${key} = @${key}`);
                params[key] = value;
            }
        });

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push('updatedAt = @updatedAt');

        await query(
            `UPDATE bookings SET ${updates.join(', ')} WHERE id = @id`,
            params
        );

        return this.findById(id);
    }

    /**
     * Đếm số lượng bookings
     */
    static async count(status?: string): Promise<number> {
        let sqlQuery = 'SELECT COUNT(*) as total FROM bookings';
        const params: Record<string, any> = {};

        if (status) {
            sqlQuery += ' WHERE status = @status';
            params.status = status;
        }

        const result = await queryOne<{ total: number }>(sqlQuery, params);
        return result?.total || 0;
    }

    /**
     * Tính tổng doanh thu
     */
    static async totalRevenue(statuses: string[]): Promise<number> {
        const placeholders = statuses.map((_, i) => `@status${i}`).join(', ');
        const params: Record<string, any> = {};

        statuses.forEach((status, i) => {
            params[`status${i}`] = status;
        });

        const result = await queryOne<{ total: number }>(
            `SELECT ISNULL(SUM(totalPrice), 0) as total FROM bookings WHERE status IN (${placeholders})`,
            params
        );

        return result?.total || 0;
    }
}

/**
 * Payment Repository
 */
export class PaymentRepository {
    static async findByBookingId(bookingId: string): Promise<Payment | null> {
        return await queryOne<Payment>(
            'SELECT * FROM payments WHERE bookingId = @bookingId',
            { bookingId }
        );
    }

    static async updateStatus(
        bookingId: string,
        status: string,
        transactionId?: string
    ): Promise<Payment | null> {
        const params: Record<string, any> = {
            bookingId,
            status,
            updatedAt: new Date(),
        };

        let sqlQuery = 'UPDATE payments SET status = @status, updatedAt = @updatedAt';

        if (transactionId) {
            sqlQuery += ', transactionId = @transactionId, paidAt = @paidAt';
            params.transactionId = transactionId;
            params.paidAt = new Date();
        }

        sqlQuery += ' WHERE bookingId = @bookingId';

        await query(sqlQuery, params);

        return this.findByBookingId(bookingId);
    }

    static async findById(id: string): Promise<Payment | null> {
        return await queryOne<Payment>(
            'SELECT * FROM payments WHERE id = @id',
            { id }
        );
    }

    static async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
        const id = crypto.randomUUID();
        const now = new Date();

        const metadata = typeof data.metadata === 'object' ? JSON.stringify(data.metadata) : data.metadata;

        await query(
            `INSERT INTO payments (id, bookingId, amount, method, status, transactionId, paidAt, metadata, createdAt, updatedAt)
             VALUES (@id, @bookingId, @amount, @method, @status, @transactionId, @paidAt, @metadata, @createdAt, @updatedAt)`,
            {
                id,
                bookingId: data.bookingId,
                amount: data.amount,
                method: data.method,
                status: data.status,
                transactionId: data.transactionId || null,
                paidAt: data.paidAt || null,
                metadata: metadata || null,
                createdAt: now,
                updatedAt: now,
            }
        );

        return (await this.findById(id))!;
    }

    static async update(
        id: string,
        data: Partial<Omit<Payment, 'id' | 'bookingId' | 'createdAt' | 'updatedAt'>>
    ): Promise<Payment | null> {
        const updates: string[] = [];
        const params: Record<string, any> = { id, updatedAt: new Date() };

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                if (key === 'metadata' && typeof value === 'object') {
                    params[key] = JSON.stringify(value);
                } else {
                    params[key] = value;
                }
                updates.push(`${key} = @${key}`);
            }
        });

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push('updatedAt = @updatedAt');

        await query(
            `UPDATE payments SET ${updates.join(', ')} WHERE id = @id`,
            params
        );

        return this.findById(id);
    }
}
