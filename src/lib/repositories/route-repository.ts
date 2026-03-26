/**
 * Route Repository
 * Các hàm query liên quan đến routes (PostgreSQL)
 */

import { query, queryOne } from '../db';
import { Route } from '../db-types';

// Helper function để map từ DB row sang Route object
function mapRowToRoute(row: Record<string, unknown>): Route {
    return {
        id: row.id as string,
        from: row.origin as string,
        to: row.destination as string,
        price: row.price as number,
        duration: row.duration as string,
        busType: row.bus_type as string,
        distance: row.distance as string | null,
        description: row.description as string | null,
        routeMapImage: row.route_map_image as string | null,
        thumbnailImage: row.thumbnail_image as string | null,
        images: row.images as string | null,
        fromLat: row.from_lat as number | null,
        fromLng: row.from_lng as number | null,
        toLat: row.to_lat as number | null,
        toLng: row.to_lng as number | null,
        operatingStart: row.operating_start as string,
        operatingEnd: row.operating_end as string,
        intervalMinutes: row.interval_minutes as number,
        isActive: row.is_active as boolean,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    };
}

export class RouteRepository {
    /**
     * Tìm route theo ID
     */
    static async findById(id: string): Promise<Route | null> {
        const result = await queryOne<Record<string, unknown>>(
            'SELECT * FROM routes WHERE id = @id',
            { id }
        );
        return result ? mapRowToRoute(result) : null;
    }

    /**
     * Tìm tất cả routes đang hoạt động
     */
    static async findActive(): Promise<Route[]> {
        const results = await query<Record<string, unknown>>(
            'SELECT * FROM routes WHERE is_active = true ORDER BY origin, destination',
            {}
        );
        return results.map(mapRowToRoute);
    }

    /**
     * Tìm routes theo điểm đi và điểm đến
     */
    static async findByFromTo(from: string, to: string): Promise<Route[]> {
        const results = await query<Record<string, unknown>>(
            'SELECT * FROM routes WHERE origin = @from AND destination = @to AND is_active = true',
            { from, to }
        );
        return results.map(mapRowToRoute);
    }

    /**
     * Tạo route mới
     */
    static async create(data: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> {
        const id = crypto.randomUUID();
        const now = new Date();

        // Parse images nếu là object
        const images = typeof data.images === 'object' ? JSON.stringify(data.images) : data.images;

        await query(
            `INSERT INTO routes (
                id, origin, destination, price, duration, bus_type, distance, description,
                route_map_image, thumbnail_image, images, from_lat, from_lng, to_lat, to_lng,
                operating_start, operating_end, interval_minutes, is_active, created_at, updated_at
            ) VALUES (
                @id, @from, @to, @price, @duration, @busType, @distance, @description,
                @routeMapImage, @thumbnailImage, @images, @fromLat, @fromLng, @toLat, @toLng,
                @operatingStart, @operatingEnd, @intervalMinutes, @isActive, @createdAt, @updatedAt
            )`,
            {
                id,
                from: data.from,
                to: data.to,
                price: data.price,
                duration: data.duration,
                busType: data.busType,
                distance: data.distance || null,
                description: data.description || null,
                routeMapImage: data.routeMapImage || null,
                thumbnailImage: data.thumbnailImage || null,
                images: images || null,
                fromLat: data.fromLat || null,
                fromLng: data.fromLng || null,
                toLat: data.toLat || null,
                toLng: data.toLng || null,
                operatingStart: data.operatingStart,
                operatingEnd: data.operatingEnd,
                intervalMinutes: data.intervalMinutes,
                isActive: data.isActive,
                createdAt: now,
                updatedAt: now,
            }
        );

        return (await this.findById(id))!;
    }

    /**
     * Cập nhật route
     */
    static async update(
        id: string,
        data: Partial<Omit<Route, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<Route | null> {
        const updates: string[] = [];
        const params: Record<string, unknown> = { id, updatedAt: new Date() };

        // Map camelCase to snake_case
        const columnMap: Record<string, string> = {
            from: 'origin',
            to: 'destination',
            busType: 'bus_type',
            routeMapImage: 'route_map_image',
            thumbnailImage: 'thumbnail_image',
            fromLat: 'from_lat',
            fromLng: 'from_lng',
            toLat: 'to_lat',
            toLng: 'to_lng',
            operatingStart: 'operating_start',
            operatingEnd: 'operating_end',
            intervalMinutes: 'interval_minutes',
            isActive: 'is_active',
        };

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                const columnName = columnMap[key] || key;
                updates.push(`${columnName} = @${key}`);

                // Parse images nếu là object
                if (key === 'images' && typeof value === 'object') {
                    params[key] = JSON.stringify(value);
                } else {
                    params[key] = value;
                }
            }
        });

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push('updated_at = @updatedAt');

        await query(
            `UPDATE routes SET ${updates.join(', ')} WHERE id = @id`,
            params
        );

        return this.findById(id);
    }

    /**
     * Xóa route (soft delete - set is_active = false)
     */
    static async delete(id: string): Promise<boolean> {
        await query(
            'UPDATE routes SET is_active = false, updated_at = @updatedAt WHERE id = @id',
            { id, updatedAt: new Date() }
        );
        return true;
    }

    /**
     * Tìm tất cả routes (admin)
     */
    static async findAll(): Promise<Route[]> {
        const results = await query<Record<string, unknown>>(
            'SELECT * FROM routes ORDER BY is_active DESC, origin, destination',
            {}
        );
        return results.map(mapRowToRoute);
    }

    /**
     * Tìm tất cả routes với số lượng bookings và schedules
     */
    static async findAllWithCounts(): Promise<(Route & { _count: { bookings: number; schedules: number } })[]> {
        const results = await query<Record<string, unknown>>(
            `SELECT
                r.*,
                COUNT(DISTINCT b.id) as booking_count,
                COUNT(DISTINCT s.id) as schedule_count
            FROM routes r
            LEFT JOIN bookings b ON r.id = b.route_id
            LEFT JOIN schedules s ON r.id = s.route_id
            GROUP BY r.id
            ORDER BY r.created_at DESC`,
            {}
        );

        return results.map((result) => ({
            ...mapRowToRoute(result),
            _count: {
                bookings: parseInt(String(result.booking_count)) || 0,
                schedules: parseInt(String(result.schedule_count)) || 0,
            },
        }));
    }

    /**
     * Tìm route với số lượng bookings và schedules
     */
    static async findByIdWithCounts(id: string): Promise<(Route & { _count: { bookings: number; schedules: number } }) | null> {
        const result = await queryOne<Record<string, unknown>>(
            `SELECT
                r.*,
                COUNT(DISTINCT b.id) as booking_count,
                COUNT(DISTINCT s.id) as schedule_count
            FROM routes r
            LEFT JOIN bookings b ON r.id = b.route_id
            LEFT JOIN schedules s ON r.id = s.route_id
            WHERE r.id = @id
            GROUP BY r.id`,
            { id }
        );

        if (!result) return null;

        return {
            ...mapRowToRoute(result),
            _count: {
                bookings: parseInt(String(result.booking_count)) || 0,
                schedules: parseInt(String(result.schedule_count)) || 0,
            },
        };
    }

    /**
     * Xóa route (hard delete)
     */
    static async hardDelete(id: string): Promise<boolean> {
        await query('DELETE FROM routes WHERE id = @id', { id });
        return true;
    }
}
