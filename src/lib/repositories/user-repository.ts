/**
 * User Repository
 * Các hàm query liên quan đến users (PostgreSQL)
 */

import { query, queryOne } from '../db';
import { User, Account, Session, UserRole } from '../db-types';

// Helper function để map từ DB row (snake_case) sang User object (camelCase)
function mapRowToUser(row: Record<string, unknown>): User {
    return {
        id: row.id as string,
        email: row.email as string,
        emailVerified: row.email_verified as Date | null,
        password: row.password as string | null,
        name: row.name as string,
        phone: row.phone as string | null,
        avatar: row.avatar as string | null,
        role: row.role as UserRole,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    };
}

export class UserRepository {
    /**
     * Tìm user theo email
     */
    static async findByEmail(email: string): Promise<User | null> {
        const result = await queryOne<Record<string, unknown>>(
            'SELECT * FROM users WHERE email = @email',
            { email }
        );
        return result ? mapRowToUser(result) : null;
    }

    /**
     * Tìm user theo ID
     */
    static async findById(id: string): Promise<User | null> {
        const result = await queryOne<Record<string, unknown>>(
            'SELECT * FROM users WHERE id = @id',
            { id }
        );
        return result ? mapRowToUser(result) : null;
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
            `INSERT INTO users (id, email, password, name, phone, role, created_at, updated_at)
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
        data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<User | null> {
        const updates: string[] = [];
        const params: Record<string, unknown> = { id, updatedAt: new Date() };

        // Map camelCase to snake_case
        const columnMap: Record<string, string> = {
            emailVerified: 'email_verified',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        };

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                const columnName = columnMap[key] || key;
                updates.push(`${columnName} = @${key}`);
                params[key] = value;
            }
        });

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push('updated_at = @updatedAt');

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
        await query(
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
        const params: Record<string, unknown> = {};

        if (options?.role) {
            sql += ' WHERE role = @role';
            params.role = options.role;
        }

        sql += ' ORDER BY created_at DESC';

        if (options?.limit) {
            sql += ' LIMIT @limit OFFSET @offset';
            params.limit = options.limit;
            params.offset = options.offset || 0;
        }

        const results = await query<Record<string, unknown>>(sql, params);
        return results.map(mapRowToUser);
    }

    /**
     * Đếm số lượng users
     */
    static async count(role?: string): Promise<number> {
        let sql = 'SELECT COUNT(*) as total FROM users';
        const params: Record<string, unknown> = {};

        if (role) {
            sql += ' WHERE role = @role';
            params.role = role;
        }

        const result = await queryOne<{ total: string }>(sql, params);
        return parseInt(result?.total || '0', 10);
    }

    /**
     * Tìm tất cả users với số lượng bookings
     */
    static async findAllWithBookingCount(): Promise<unknown[]> {
        const results = await query<Record<string, unknown>>(
            `SELECT
                u.*,
                COUNT(b.id) as booking_count
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC`,
            {}
        );

        return results.map((result) => ({
            id: result.id,
            email: result.email,
            name: result.name,
            phone: result.phone,
            role: result.role,
            emailVerified: result.email_verified,
            createdAt: result.created_at,
            _count: {
                bookings: parseInt(String(result.booking_count || '0'), 10),
            },
        }));
    }

    /**
     * Tìm user với số lượng bookings
     */
    static async findByIdWithBookingCount(id: string): Promise<unknown | null> {
        const result = await queryOne<Record<string, unknown>>(
            `SELECT
                u.*,
                COUNT(b.id) as booking_count
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            WHERE u.id = @id
            GROUP BY u.id`,
            { id }
        );

        if (!result) return null;

        return {
            id: result.id,
            email: result.email,
            name: result.name,
            phone: result.phone,
            role: result.role,
            emailVerified: result.email_verified,
            createdAt: result.created_at,
            _count: {
                bookings: parseInt(String(result.booking_count || '0'), 10),
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
            'SELECT * FROM accounts WHERE provider = @provider AND provider_account_id = @providerAccountId',
            { provider, providerAccountId }
        );
    }

    static async create(data: Omit<Account, 'id'>): Promise<Account> {
        const id = crypto.randomUUID();

        await query(
            `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
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
            'SELECT * FROM sessions WHERE session_token = @sessionToken',
            { sessionToken }
        );
    }

    static async create(data: Omit<Session, 'id'>): Promise<Session> {
        const id = crypto.randomUUID();

        await query(
            `INSERT INTO sessions (id, session_token, user_id, expires)
             VALUES (@id, @sessionToken, @userId, @expires)`,
            { id, ...data }
        );

        return { id, ...data };
    }

    static async update(sessionToken: string, expires: Date): Promise<Session | null> {
        await query(
            'UPDATE sessions SET expires = @expires WHERE session_token = @sessionToken',
            { sessionToken, expires }
        );

        return this.findBySessionToken(sessionToken);
    }

    static async delete(sessionToken: string): Promise<void> {
        await query(
            'DELETE FROM sessions WHERE session_token = @sessionToken',
            { sessionToken }
        );
    }

    static async deleteExpired(): Promise<void> {
        await query('DELETE FROM sessions WHERE expires < NOW()', {});
    }
}
