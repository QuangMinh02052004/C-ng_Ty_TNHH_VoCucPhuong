/**
 * Microsoft SQL Server Database Connection
 * Sử dụng mssql package để kết nối SQL Server
 */

import sql from 'mssql';

// Cấu hình connection
const config: sql.config = {
    server: 'localhost',
    port: 1433,
    database: 'XeVoCucPhuong',
    user: 'sa',
    password: 'Minhlion02052004',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

// Connection pool
let pool: sql.ConnectionPool | null = null;

/**
 * Lấy connection pool
 */
export async function getPool(): Promise<sql.ConnectionPool> {
    if (!pool) {
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server database');
    }
    return pool;
}

/**
 * Đóng connection pool
 */
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.close();
        pool = null;
        console.log('✅ SQL Server connection closed');
    }
}

/**
 * Execute query với parameters
 */
export async function query<T = any>(
    queryText: string,
    params?: Record<string, any>
): Promise<T[]> {
    try {
        const poolConnection = await getPool();
        const request = poolConnection.request();

        // Add parameters nếu có
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });
        }

        const result = await request.query(queryText);
        return result.recordset as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Execute query trả về single result
 */
export async function queryOne<T = any>(
    queryText: string,
    params?: Record<string, any>
): Promise<T | null> {
    const results = await query<T>(queryText, params);
    return results.length > 0 ? results[0] : null;
}

/**
 * Execute stored procedure
 */
export async function executeProcedure<T = any>(
    procedureName: string,
    params?: Record<string, any>
): Promise<T[]> {
    try {
        const poolConnection = await getPool();
        const request = poolConnection.request();

        // Add parameters nếu có
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });
        }

        const result = await request.execute(procedureName);
        return result.recordset as T[];
    } catch (error) {
        console.error('Stored procedure error:', error);
        throw error;
    }
}

/**
 * Begin transaction
 */
export async function transaction<T>(
    callback: (transaction: sql.Transaction) => Promise<T>
): Promise<T> {
    const poolConnection = await getPool();
    const transaction = new sql.Transaction(poolConnection);

    try {
        await transaction.begin();
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

// Export sql types để sử dụng trong code
export { sql };
