/**
 * PostgreSQL Database Connection (Neon)
 * Sử dụng pg package để kết nối PostgreSQL
 */

import { Pool, QueryResult } from 'pg';

// Connection string từ Neon
const connectionString = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_1XwtpYJIFC5i@ep-holy-recipe-a1pyfvtp-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

// Connection pool
let pool: Pool | null = null;

/**
 * Lấy connection pool
 */
export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
        console.log('✅ Connected to PostgreSQL (Neon)');
    }
    return pool;
}

/**
 * Đóng connection pool
 */
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✅ PostgreSQL connection closed');
    }
}

/**
 * Execute query với parameters
 * Tương thích với cú pháp cũ (SQL Server style)
 */
export async function query<T = Record<string, unknown>>(
    queryText: string,
    params?: Record<string, unknown>
): Promise<T[]> {
    try {
        const poolConnection = getPool();

        // Chuyển đổi từ @param sang $1, $2, ...
        let convertedQuery = queryText;
        const values: unknown[] = [];

        if (params) {
            let paramIndex = 1;
            const paramMap: Record<string, number> = {};

            // Tìm tất cả @param trong query
            const paramMatches = queryText.match(/@\w+/g) || [];

            for (const match of paramMatches) {
                const paramName = match.substring(1); // Bỏ @
                if (!(paramName in paramMap)) {
                    paramMap[paramName] = paramIndex++;
                    values.push(params[paramName]);
                }
                convertedQuery = convertedQuery.replace(
                    new RegExp(`@${paramName}\\b`, 'g'),
                    `$${paramMap[paramName]}`
                );
            }
        }

        const result: QueryResult = await poolConnection.query(convertedQuery, values);
        return result.rows as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Execute query trả về single result
 */
export async function queryOne<T = Record<string, unknown>>(
    queryText: string,
    params?: Record<string, unknown>
): Promise<T | null> {
    const results = await query<T>(queryText, params);
    return results.length > 0 ? results[0] : null;
}

/**
 * Execute query với positional parameters ($1, $2, ...)
 * Dùng cho queries mới viết theo PostgreSQL style
 */
export async function queryWithValues<T = Record<string, unknown>>(
    queryText: string,
    values?: unknown[]
): Promise<T[]> {
    try {
        const poolConnection = getPool();
        const result: QueryResult = await poolConnection.query(queryText, values || []);
        return result.rows as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Execute query trả về single result (positional params)
 */
export async function queryOneWithValues<T = Record<string, unknown>>(
    queryText: string,
    values?: unknown[]
): Promise<T | null> {
    const results = await queryWithValues<T>(queryText, values);
    return results.length > 0 ? results[0] : null;
}

/**
 * Begin transaction
 */
export async function transaction<T>(
    callback: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> {
    const poolConnection = getPool();
    const client = await poolConnection.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Export Pool type để sử dụng trong code
export { Pool };
