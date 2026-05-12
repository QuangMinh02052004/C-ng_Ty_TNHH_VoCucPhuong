/**
 * Scan + trip schema: ensure các cột + bảng mới tồn tại trên DB DatVe.
 */

import { query } from './db';

let ensured = false;

export async function ensureScanSchema() {
    if (ensured) return;
    try {
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_plate TEXT`, {});

        await query(
            `CREATE TABLE IF NOT EXISTS driver_trips (
                id SERIAL PRIMARY KEY,
                driver_id TEXT NOT NULL,
                driver_name TEXT NOT NULL,
                vehicle_plate TEXT,
                started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                completed_at TIMESTAMPTZ,
                passenger_count INTEGER NOT NULL DEFAULT 0,
                paid_online BIGINT NOT NULL DEFAULT 0,
                expected_cash BIGINT NOT NULL DEFAULT 0,
                total_amount BIGINT NOT NULL DEFAULT 0,
                notes TEXT
            )`,
            {}
        );
        await query(
            `CREATE INDEX IF NOT EXISTS idx_driver_trips_driver_started
             ON driver_trips (driver_id, started_at DESC)`,
            {}
        );
        await query(
            `CREATE INDEX IF NOT EXISTS idx_driver_trips_open
             ON driver_trips (driver_id) WHERE completed_at IS NULL`,
            {}
        );

        await query(
            `CREATE TABLE IF NOT EXISTS qr_scan_logs (
                id SERIAL PRIMARY KEY,
                scanner_id TEXT NOT NULL,
                scanner_name TEXT NOT NULL,
                scanner_role TEXT NOT NULL,
                vehicle_plate TEXT,
                trip_id INTEGER,
                booking_code TEXT NOT NULL,
                booking_status TEXT,
                was_paid BOOLEAN NOT NULL DEFAULT false,
                total_price BIGINT,
                customer_name TEXT,
                customer_phone TEXT,
                route TEXT,
                departure_time TEXT,
                departure_date TEXT,
                seats INTEGER,
                pickup_method TEXT,
                pickup_address TEXT,
                result TEXT,
                scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )`,
            {}
        );
        // Add cột nếu bảng đã tồn tại nhưng thiếu cột mới
        await query(`ALTER TABLE qr_scan_logs ADD COLUMN IF NOT EXISTS trip_id INTEGER`, {});
        await query(`ALTER TABLE qr_scan_logs ADD COLUMN IF NOT EXISTS total_price BIGINT`, {});

        await query(
            `CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_scanner
             ON qr_scan_logs (scanner_id, scanned_at DESC)`,
            {}
        );
        await query(
            `CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_trip
             ON qr_scan_logs (trip_id)`,
            {}
        );
        ensured = true;
    } catch (e) {
        console.error('[ensureScanSchema]', e);
    }
}

/**
 * Tìm trip hiện tại (chưa hoàn thành) của tài xế, tạo mới nếu chưa có.
 * Trả về id trip.
 */
export async function getOrCreateOpenTrip(
    driverId: string,
    driverName: string,
    vehiclePlate: string | null
): Promise<number> {
    const existing = await query<{ id: number }>(
        `SELECT id FROM driver_trips
         WHERE driver_id = @driverId AND completed_at IS NULL
         ORDER BY started_at DESC LIMIT 1`,
        { driverId }
    );
    if (existing.length > 0) return existing[0].id;

    const created = await query<{ id: number }>(
        `INSERT INTO driver_trips (driver_id, driver_name, vehicle_plate)
         VALUES (@driverId, @driverName, @vehiclePlate)
         RETURNING id`,
        { driverId, driverName, vehiclePlate }
    );
    return created[0].id;
}
