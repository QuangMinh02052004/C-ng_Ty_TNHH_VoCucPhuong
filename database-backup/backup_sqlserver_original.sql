-- ============================================
-- BACKUP GỐC - SQL SERVER
-- Database: XeVoCucPhuong
-- Ngày backup: 2026-01-14
-- ============================================

-- ============================================
-- PHẦN 1: TẠO DATABASE
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'XeVoCucPhuong')
BEGIN
    CREATE DATABASE XeVoCucPhuong;
END
GO

USE XeVoCucPhuong;
GO

-- ============================================
-- PHẦN 2: TẠO CÁC BẢNG
-- ============================================

-- Bảng: users (Người dùng)
CREATE TABLE users (
    id NVARCHAR(255) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    emailVerified DATETIME2,
    password NVARCHAR(255),
    name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50),
    avatar NVARCHAR(500),
    role NVARCHAR(50) DEFAULT 'USER' NOT NULL CHECK (role IN ('USER', 'STAFF', 'ADMIN')),
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL
);

-- Bảng: accounts (Tài khoản OAuth)
CREATE TABLE accounts (
    id NVARCHAR(255) PRIMARY KEY,
    userId NVARCHAR(255) NOT NULL,
    type NVARCHAR(100) NOT NULL,
    provider NVARCHAR(100) NOT NULL,
    providerAccountId NVARCHAR(255) NOT NULL,
    refresh_token NVARCHAR(MAX),
    access_token NVARCHAR(MAX),
    expires_at INT,
    token_type NVARCHAR(100),
    scope NVARCHAR(500),
    id_token NVARCHAR(MAX),
    session_state NVARCHAR(255),
    CONSTRAINT FK_accounts_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_accounts_provider UNIQUE (provider, providerAccountId)
);

-- Bảng: sessions
CREATE TABLE sessions (
    id NVARCHAR(255) PRIMARY KEY,
    sessionToken NVARCHAR(500) UNIQUE NOT NULL,
    userId NVARCHAR(255) NOT NULL,
    expires DATETIME2 NOT NULL,
    CONSTRAINT FK_sessions_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng: routes (Tuyến đường)
CREATE TABLE routes (
    id NVARCHAR(255) PRIMARY KEY,
    [from] NVARCHAR(255) NOT NULL,
    [to] NVARCHAR(255) NOT NULL,
    price INT NOT NULL,
    duration NVARCHAR(100) NOT NULL,
    busType NVARCHAR(100) NOT NULL,
    distance NVARCHAR(100),
    description NVARCHAR(MAX),
    routeMapImage NVARCHAR(500),
    thumbnailImage NVARCHAR(500),
    images NVARCHAR(MAX),
    fromLat FLOAT,
    fromLng FLOAT,
    toLat FLOAT,
    toLng FLOAT,
    operatingStart NVARCHAR(50) NOT NULL,
    operatingEnd NVARCHAR(50) NOT NULL,
    intervalMinutes INT DEFAULT 30 NOT NULL,
    isActive BIT DEFAULT 1 NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL
);

-- Bảng: buses (Xe buýt)
CREATE TABLE buses (
    id NVARCHAR(255) PRIMARY KEY,
    licensePlate NVARCHAR(50) UNIQUE NOT NULL,
    busType NVARCHAR(100) NOT NULL,
    totalSeats INT NOT NULL,
    status NVARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL
);

-- Bảng: schedules (Lịch trình)
CREATE TABLE schedules (
    id NVARCHAR(255) PRIMARY KEY,
    routeId NVARCHAR(255) NOT NULL,
    busId NVARCHAR(255) NOT NULL,
    date DATETIME2 NOT NULL,
    departureTime NVARCHAR(50) NOT NULL,
    availableSeats INT NOT NULL,
    totalSeats INT NOT NULL,
    status NVARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    CONSTRAINT FK_schedules_routes FOREIGN KEY (routeId) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT FK_schedules_buses FOREIGN KEY (busId) REFERENCES buses(id) ON DELETE CASCADE
);

-- Bảng: bookings (Đặt vé)
CREATE TABLE bookings (
    id NVARCHAR(255) PRIMARY KEY,
    bookingCode NVARCHAR(100) UNIQUE NOT NULL,
    userId NVARCHAR(255),
    customerName NVARCHAR(255) NOT NULL,
    customerPhone NVARCHAR(50) NOT NULL,
    customerEmail NVARCHAR(255),
    routeId NVARCHAR(255) NOT NULL,
    scheduleId NVARCHAR(255),
    date DATETIME2 NOT NULL,
    departureTime NVARCHAR(50) NOT NULL,
    seats INT DEFAULT 1 NOT NULL,
    totalPrice INT NOT NULL,
    status NVARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    qrCode NVARCHAR(MAX),
    ticketUrl NVARCHAR(500),
    checkedIn BIT DEFAULT 0 NOT NULL,
    checkedInAt DATETIME2,
    checkedInBy NVARCHAR(255),
    notes NVARCHAR(MAX),
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    CONSTRAINT FK_bookings_routes FOREIGN KEY (routeId) REFERENCES routes(id),
    CONSTRAINT FK_bookings_users FOREIGN KEY (userId) REFERENCES users(id)
);

-- Bảng: payments (Thanh toán)
CREATE TABLE payments (
    id NVARCHAR(255) PRIMARY KEY,
    bookingId NVARCHAR(255) UNIQUE NOT NULL,
    amount INT NOT NULL,
    method NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    transactionId NVARCHAR(255),
    paidAt DATETIME2,
    metadata NVARCHAR(MAX),
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    CONSTRAINT FK_payments_bookings FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ============================================
-- PHẦN 3: DỮ LIỆU MẪU
-- ============================================

-- Routes (Tuyến đường)
INSERT INTO routes (id, [from], [to], price, duration, busType, operatingStart, operatingEnd, description, isActive, intervalMinutes)
VALUES
('1', N'Long Khánh', N'Sài Gòn (Cao tốc)', 120000, N'1.5 giờ', N'Ghế ngồi', '05:00', '18:00', N'Tuyến Long Khánh - Sài Gòn qua cao tốc', 1, 30),
('2', N'Long Khánh', N'Sài Gòn (Quốc lộ)', 110000, N'2 giờ', N'Ghế ngồi', '05:00', '18:00', N'Tuyến Long Khánh - Sài Gòn qua quốc lộ', 1, 30),
('3', N'Sài Gòn', N'Long Khánh (Cao tốc)', 120000, N'1.5 giờ', N'Ghế ngồi', '05:00', '18:00', N'Tuyến Sài Gòn - Long Khánh qua cao tốc', 1, 30),
('4', N'Sài Gòn', N'Long Khánh (Quốc lộ)', 110000, N'2 giờ 30 phút', N'Ghế ngồi', '05:00', '18:00', N'Tuyến Sài Gòn - Long Khánh qua quốc lộ', 1, 30),
('5', N'Sài Gòn', N'Xuân Lộc (Cao tốc)', 130000, N'2 giờ - 4 giờ', N'Ghế ngồi', '05:30', '19:00', N'Tuyến Sài Gòn - Xuân Lộc qua cao tốc', 1, 30),
('6', N'Quốc Lộ 1A', N'Xuân Lộc (Quốc lộ)', 130000, N'1.5 giờ - 4 tiếng', N'Ghế ngồi', '05:30', '19:00', N'Tuyến Quốc Lộ 1A - Xuân Lộc', 1, 30),
('7', N'Xuân Lộc', N'Long Khánh (Cao tốc)', 130000, N'1 giờ', N'Ghế ngồi', '05:30', '19:00', N'Tuyến Xuân Lộc - Long Khánh qua cao tốc', 1, 30),
('8', N'Xuân Lộc', N'Long Khánh (Quốc lộ)', 130000, N'1.5 giờ', N'Ghế ngồi', '05:30', '19:00', N'Tuyến Xuân Lộc - Long Khánh qua quốc lộ', 1, 30);

-- Buses (Xe)
INSERT INTO buses (id, licensePlate, busType, totalSeats, status)
VALUES
('bus-001', N'51B-12345', N'Ghế ngồi', 45, 'ACTIVE'),
('bus-002', N'51B-12346', N'Ghế ngồi', 45, 'ACTIVE'),
('bus-003', N'51B-12347', N'Ghế ngồi', 45, 'ACTIVE'),
('bus-004', N'51B-12348', N'Giường nằm', 36, 'ACTIVE'),
('bus-005', N'51B-12349', N'Giường nằm', 36, 'ACTIVE'),
('bus-006', N'51B-12350', N'Limousine', 24, 'ACTIVE'),
('bus-007', N'51B-12351', N'Limousine', 24, 'ACTIVE'),
('bus-008', N'51B-12352', N'Ghế ngồi', 45, 'ACTIVE');

-- Users mẫu (password đã hash với bcrypt)
-- Password gốc: admin123456, staff123456, user123456
INSERT INTO users (id, email, password, name, phone, role)
VALUES
('user-admin-001', 'admin@vocucphuong.com', '$2b$10$Qc5K8mJ8N.hFvK8R9O7Wl.bXvYgEjSo9h6Q3T6y5w.JmK2f5g8K2q', N'Admin VoCucPhuong', '0251999975', 'ADMIN'),
('user-staff-001', 'staff@vocucphuong.com', '$2b$10$Qc5K8mJ8N.hFvK8R9O7Wl.bXvYgEjSo9h6Q3T6y5w.JmK2f5g8K2q', N'Nhân viên 1', '0909123456', 'STAFF'),
('user-normal-001', 'user@example.com', '$2b$10$Qc5K8mJ8N.hFvK8R9O7Wl.bXvYgEjSo9h6Q3T6y5w.JmK2f5g8K2q', N'Khách hàng demo', '0909111222', 'USER');

-- ============================================
-- KẾT THÚC BACKUP
-- ============================================
