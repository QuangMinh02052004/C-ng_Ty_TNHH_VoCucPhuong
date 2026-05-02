/**
 * Settings Repository — feature flags & system config (key/value)
 */
import { queryWithValues, queryOneWithValues } from '../db';

let ensured = false;
async function ensureTable() {
    if (ensured) return;
    await queryWithValues(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    ensured = true;
}

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
    await ensureTable();
    const row = await queryOneWithValues<{ value: string }>(
        `SELECT value FROM settings WHERE key = $1`,
        [key]
    );
    return row ? row.value : defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
    await ensureTable();
    await queryWithValues(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
    );
}

export async function getAllSettings(): Promise<Record<string, string>> {
    await ensureTable();
    const rows = await queryWithValues<{ key: string; value: string }>(`SELECT key, value FROM settings`);
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
}

export async function isBookingEnabled(): Promise<boolean> {
    const v = await getSetting('booking_enabled', 'true');
    return v !== 'false';
}

export async function getMaintenanceMessage(): Promise<string> {
    return await getSetting(
        'maintenance_message',
        'Hệ thống đặt vé online đang trong quá trình hoàn thiện. Vui lòng liên hệ hotline để đặt vé.'
    );
}
