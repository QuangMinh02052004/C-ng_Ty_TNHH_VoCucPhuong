/**
 * Route Repository
 * Các hàm query liên quan đến routes (tuyến đường)
 */

import { query, queryOne } from '../db';
import { Route } from '../db-types';

export class RouteRepository {
    /**
     * Tìm route theo ID
     */
    static async findById(id: string): Promise<Route | null> {
        return await queryOne<Route>(
            'SELECT * FROM routes WHERE id = @id',
            { id }
        );
    }

    /**
     * Tìm tất cả routes đang hoạt động
     */
    static async findActive(): Promise<Route[]> {
        return await query<Route>(
            'SELECT * FROM routes WHERE isActive = 1 ORDER BY [from], [to]',
            {}
        );
    }

    /**
     * Tìm routes theo điểm đi và điểm đến
     */
    static async findByFromTo(from: string, to: string): Promise<Route[]> {
        return await query<Route>(
            'SELECT * FROM routes WHERE [from] = @from AND [to] = @to AND isActive = 1',
            { from, to }
        );
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
                id, [from], [to], price, duration, busType, distance, description,
                routeMapImage, thumbnailImage, images, fromLat, fromLng, toLat, toLng,
                operatingStart, operatingEnd, intervalMinutes, isActive, createdAt, updatedAt
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
        const params: Record<string, any> = { id, updatedAt: new Date() };

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                // Đảm bảo từ khóa SQL được escape
                const columnName = key === 'from' || key === 'to' ? `[${key}]` : key;
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

        updates.push('updatedAt = @updatedAt');

        await query(
            `UPDATE routes SET ${updates.join(', ')} WHERE id = @id`,
            params
        );

        return this.findById(id);
    }

    /**
     * Xóa route (soft delete - set isActive = false)
     */
    static async delete(id: string): Promise<boolean> {
        await query(
            'UPDATE routes SET isActive = 0, updatedAt = @updatedAt WHERE id = @id',
            { id, updatedAt: new Date() }
        );
        return true;
    }

    /**
     * Tìm tất cả routes (admin)
     */
    static async findAll(): Promise<Route[]> {
        return await query<Route>(
            'SELECT * FROM routes ORDER BY isActive DESC, [from], [to]',
            {}
        );
    }

    /**
     * Tìm tất cả routes với số lượng bookings và schedules
     */
    static async findAllWithCounts(): Promise<any[]> {
        const results = await query<any>(
            `SELECT
                r.*,
                COUNT(DISTINCT b.id) as bookingCount,
                COUNT(DISTINCT s.id) as scheduleCount
            FROM routes r
            LEFT JOIN bookings b ON r.id = b.routeId
            LEFT JOIN schedules s ON r.id = s.routeId
            GROUP BY r.id, r.[from], r.[to], r.price, r.duration, r.busType, r.distance, r.description,
                     r.routeMapImage, r.thumbnailImage, r.images, r.fromLat, r.fromLng, r.toLat, r.toLng,
                     r.operatingStart, r.operatingEnd, r.intervalMinutes, r.isActive, r.createdAt, r.updatedAt
            ORDER BY r.createdAt DESC`,
            {}
        );

        return results.map((result: any) => ({
            id: result.id,
            from: result.from,
            to: result.to,
            price: result.price,
            duration: result.duration,
            busType: result.busType,
            distance: result.distance,
            description: result.description,
            routeMapImage: result.routeMapImage,
            thumbnailImage: result.thumbnailImage,
            images: result.images,
            fromLat: result.fromLat,
            fromLng: result.fromLng,
            toLat: result.toLat,
            toLng: result.toLng,
            operatingStart: result.operatingStart,
            operatingEnd: result.operatingEnd,
            intervalMinutes: result.intervalMinutes,
            isActive: result.isActive,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            _count: {
                bookings: result.bookingCount || 0,
                schedules: result.scheduleCount || 0,
            },
        }));
    }

    /**
     * Tìm route với số lượng bookings và schedules
     */
    static async findByIdWithCounts(id: string): Promise<any | null> {
        const result = await queryOne<any>(
            `SELECT
                r.*,
                COUNT(DISTINCT b.id) as bookingCount,
                COUNT(DISTINCT s.id) as scheduleCount
            FROM routes r
            LEFT JOIN bookings b ON r.id = b.routeId
            LEFT JOIN schedules s ON r.id = s.routeId
            WHERE r.id = @id
            GROUP BY r.id, r.[from], r.[to], r.price, r.duration, r.busType, r.distance, r.description,
                     r.routeMapImage, r.thumbnailImage, r.images, r.fromLat, r.fromLng, r.toLat, r.toLng,
                     r.operatingStart, r.operatingEnd, r.intervalMinutes, r.isActive, r.createdAt, r.updatedAt`,
            { id }
        );

        if (!result) return null;

        return {
            id: result.id,
            from: result.from,
            to: result.to,
            price: result.price,
            duration: result.duration,
            busType: result.busType,
            distance: result.distance,
            description: result.description,
            routeMapImage: result.routeMapImage,
            thumbnailImage: result.thumbnailImage,
            images: result.images,
            fromLat: result.fromLat,
            fromLng: result.fromLng,
            toLat: result.toLat,
            toLng: result.toLng,
            operatingStart: result.operatingStart,
            operatingEnd: result.operatingEnd,
            intervalMinutes: result.intervalMinutes,
            isActive: result.isActive,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            _count: {
                bookings: result.bookingCount || 0,
                schedules: result.scheduleCount || 0,
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
