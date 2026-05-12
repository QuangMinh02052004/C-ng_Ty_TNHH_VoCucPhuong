/**
 * Scan schema: ensure các cột + bảng mới tồn tại trên DB DatVe.
 * Bảng `qr_scan_logs` dùng chung cho cả tài xế và admin quét vé.
 */

import { query } from './db';

let ensured = false;

export async function ensureScanSchema() {
    if (ensured) return;
    try {
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_plate TEXT`, {});
        await query(
            `CREATE TABLE IF NOT EXISTS qr_scan_logs (
                id SERIAL PRIMARY KEY,
                scanner_id TEXT NOT NULL,
                scanner_name TEXT NOT NULL,
                scanner_role TEXT NOT NULL,
                vehicle_plate TEXT,
                booking_code TEXT NOT NULL,
                booking_status TEXT,
                was_paid BOOLEAN NOT NULL DEFAULT false,
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
        await query(
            `CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_scanner
             ON qr_scan_logs (scanner_id, scanned_at DESC)`,
            {}
        );
        await query(
            `CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_role
             ON qr_scan_logs (scanner_role, scanned_at DESC)`,
            {}
        );
        ensured = true;
    } catch (e) {
        console.error('[ensureScanSchema]', e);
    }
}
