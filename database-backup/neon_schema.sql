-- ============================================
-- SCHEMA CHO NEON (PostgreSQL)
-- Database: XeVoCucPhuong
-- ============================================

-- Xóa tables cũ nếu có
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- BẢNG: users
-- ============================================
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar VARCHAR(500),
    role VARCHAR(50) DEFAULT 'USER' NOT NULL CHECK (role IN ('USER', 'STAFF', 'ADMIN')),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- BẢNG: accounts (OAuth)
-- ============================================
CREATE TABLE accounts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(100),
    scope VARCHAR(500),
    id_token TEXT,
    session_state VARCHAR(255),
    UNIQUE (provider, provider_account_id)
);

-- ============================================
-- BẢNG: sessions
-- ============================================
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

-- ============================================
-- BẢNG: routes (Tuyến đường)
-- ============================================
CREATE TABLE routes (
    id VARCHAR(255) PRIMARY KEY,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    duration VARCHAR(100) NOT NULL,
    bus_type VARCHAR(100) NOT NULL,
    distance VARCHAR(100),
    description TEXT,
    route_map_image VARCHAR(500),
    thumbnail_image VARCHAR(500),
    images TEXT,
    from_lat DOUBLE PRECISION,
    from_lng DOUBLE PRECISION,
    to_lat DOUBLE PRECISION,
    to_lng DOUBLE PRECISION,
    operating_start VARCHAR(50) NOT NULL,
    operating_end VARCHAR(50) NOT NULL,
    interval_minutes INTEGER DEFAULT 30 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- BẢNG: buses (Xe)
-- ============================================
CREATE TABLE buses (
    id VARCHAR(255) PRIMARY KEY,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    bus_type VARCHAR(100) NOT NULL,
    total_seats INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- BẢNG: schedules (Lịch trình)
-- ============================================
CREATE TABLE schedules (
    id VARCHAR(255) PRIMARY KEY,
    route_id VARCHAR(255) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bus_id VARCHAR(255) NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    departure_time VARCHAR(50) NOT NULL,
    available_seats INTEGER NOT NULL,
    total_seats INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE (route_id, bus_id, date, departure_time)
);

-- ============================================
-- BẢNG: bookings (Đặt vé)
-- ============================================
CREATE TABLE bookings (
    id VARCHAR(255) PRIMARY KEY,
    booking_code VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(255) REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    route_id VARCHAR(255) NOT NULL REFERENCES routes(id),
    schedule_id VARCHAR(255) REFERENCES schedules(id),
    date DATE NOT NULL,
    departure_time VARCHAR(50) NOT NULL,
    seats INTEGER DEFAULT 1 NOT NULL,
    total_price INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED')),
    qr_code TEXT,
    ticket_url VARCHAR(500),
    checked_in BOOLEAN DEFAULT false NOT NULL,
    checked_in_at TIMESTAMP,
    checked_in_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- BẢNG: payments (Thanh toán)
-- ============================================
CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    booking_id VARCHAR(255) UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    method VARCHAR(50) NOT NULL CHECK (method IN ('CASH', 'BANK_TRANSFER', 'QRCODE', 'VNPAY', 'MOMO')),
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    transaction_id VARCHAR(255),
    paid_at TIMESTAMP,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_schedules_route_id ON schedules(route_id);
CREATE INDEX idx_schedules_bus_id ON schedules(bus_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_route_id ON bookings(route_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
