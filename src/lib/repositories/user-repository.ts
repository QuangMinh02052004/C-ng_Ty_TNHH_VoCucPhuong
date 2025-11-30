/**
 * User Repository
 * Các hàm query liên quan đến users
 */

import { query, queryOne, sql } from '../db';
import { User, Account, Session } from '../db-types';

export class UserRepository {
    /**
     * Tìm user theo email
     */
    static async findByEmail(email: string): Promise<User | null> {
        return await queryOne<User>(
            'SELECT * FROM users WHERE email = @email',
            { email }
        );
    }

    /**
     * Tìm user theo ID
     */
    static async findById(id: string): Promise<User | null> {
        return await queryOne<User>(
            'SELECT * FROM users WHERE id = @id',
            { id }
        );
    }

    /**
     * Tạo user mới
     */
    static async create(data: {
        email: string;
        password?: string;
        name: string;
        phone?: string;
        role?: string;
    }): Promise<User> {
        const id = crypto.randomUUID();
        const now = new Date();

        await query(
            `INSERT INTO users (id, email, password, name, phone, role, createdAt, updatedAt)
             VALUES (@id, @email, @password, @name, @phone, @role, @createdAt, @updatedAt)`,
            {
                id,
                email: data.email,
                password: data.password || null,
                name: data.name,
                phone: data.phone || null,
                role: data.role || 'USER',
                createdAt: now,
                updatedAt: now,
            }
        );

        return (await this.findById(id))!;
    }

    /**
     * Cập nhật user
     */
    static async update(
        id: string,
        data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<User | null> {
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
            `UPDATE users SET ${updates.join(', ')} WHERE id = @id`,
            params
        );

        return this.findById(id);
    }

    /**
     * Xóa user
     */
    static async delete(id: string): Promise<boolean> {
        const result = await query(
            'DELETE FROM users WHERE id = @id',
            { id }
        );
        return true;
    }

    /**
     * Tìm tất cả users (với phân trang)
     */
    static async findAll(options?: {
        limit?: number;
        offset?: number;
        role?: string;
    }): Promise<User[]> {
        let sql = 'SELECT * FROM users';
        const params: Record<string, any> = {};

        if (options?.role) {
            sql += ' WHERE role = @role';
            params.role = options.role;
        }

        sql += ' ORDER BY createdAt DESC';

        if (options?.limit) {
            sql += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
            params.limit = options.limit;
            params.offset = options.offset || 0;
        }

        return await query<User>(sql, params);
    }

    /**
     * Đếm số lượng users
     */
    static async count(role?: string): Promise<number> {
        let sql = 'SELECT COUNT(*) as total FROM users';
        const params: Record<string, any> = {};

        if (role) {
            sql += ' WHERE role = @role';
            params.role = role;
        }

        const result = await queryOne<{ total: number }>(sql, params);
        return result?.total || 0;
    }

    /**
     * Tìm tất cả users với số lượng bookings
     */
    static async findAllWithBookingCount(): Promise<any[]> {
        const results = await query<any>(
            `SELECT
                u.*,
                COUNT(b.id) as bookingCount
            FROM users u
            LEFT JOIN bookings b ON u.id = b.userId
            GROUP BY u.id, u.email, u.password, u.name, u.phone, u.role, u.emailVerified, u.image, u.createdAt, u.updatedAt
            ORDER BY u.createdAt DESC`,
            {}
        );

        return results.map((result: any) => ({
            id: result.id,
            email: result.email,
            name: result.name,
            phone: result.phone,
            role: result.role,
            emailVerified: result.emailVerified,
            createdAt: result.createdAt,
            _count: {
                bookings: result.bookingCount || 0,
            },
        }));
    }

    /**
     * Tìm user với số lượng bookings
     */
    static async findByIdWithBookingCount(id: string): Promise<any | null> {
        const result = await queryOne<any>(
            `SELECT
                u.*,
                COUNT(b.id) as bookingCount
            FROM users u
            LEFT JOIN bookings b ON u.id = b.userId
            WHERE u.id = @id
            GROUP BY u.id, u.email, u.password, u.name, u.phone, u.role, u.emailVerified, u.image, u.createdAt, u.updatedAt`,
            { id }
        );

        if (!result) return null;

        return {
            id: result.id,
            email: result.email,
            name: result.name,
            phone: result.phone,
            role: result.role,
            emailVerified: result.emailVerified,
            createdAt: result.createdAt,
            _count: {
                bookings: result.bookingCount || 0,
            },
        };
    }
}

/**
 * Account Repository (cho OAuth/Social Login)
 */
export class AccountRepository {
    static async findByProviderAccountId(
        provider: string,
        providerAccountId: string
    ): Promise<Account | null> {
        return await queryOne<Account>(
            'SELECT * FROM accounts WHERE provider = @provider AND providerAccountId = @providerAccountId',
            { provider, providerAccountId }
        );
    }

    static async create(data: Omit<Account, 'id'>): Promise<Account> {
        const id = crypto.randomUUID();

        await query(
            `INSERT INTO accounts (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
             VALUES (@id, @userId, @type, @provider, @providerAccountId, @refresh_token, @access_token, @expires_at, @token_type, @scope, @id_token, @session_state)`,
            { id, ...data }
        );

        return { id, ...data };
    }
}

/**
 * Session Repository
 */
export class SessionRepository {
    static async findBySessionToken(sessionToken: string): Promise<Session | null> {
        return await queryOne<Session>(
            'SELECT * FROM sessions WHERE sessionToken = @sessionToken',
            { sessionToken }
        );
    }

    static async create(data: Omit<Session, 'id'>): Promise<Session> {
        const id = crypto.randomUUID();

        await query(
            `INSERT INTO sessions (id, sessionToken, userId, expires)
             VALUES (@id, @sessionToken, @userId, @expires)`,
            { id, ...data }
        );

        return { id, ...data };
    }

    static async update(sessionToken: string, expires: Date): Promise<Session | null> {
        await query(
            'UPDATE sessions SET expires = @expires WHERE sessionToken = @sessionToken',
            { sessionToken, expires }
        );

        return this.findBySessionToken(sessionToken);
    }

    static async delete(sessionToken: string): Promise<void> {
        await query(
            'DELETE FROM sessions WHERE sessionToken = @sessionToken',
            { sessionToken }
        );
    }

    static async deleteExpired(): Promise<void> {
        await query('DELETE FROM sessions WHERE expires < GETDATE()', {});
    }
}
