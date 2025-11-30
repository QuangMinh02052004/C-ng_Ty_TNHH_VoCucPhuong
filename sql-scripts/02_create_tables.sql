-- ============================================
-- Script: Tạo Tables cho Database XeVoCucPhuong
-- Mô tả: Tạo tất cả các bảng và quan hệ cho hệ thống
-- ============================================

USE XeVoCucPhuong;
GO

-- ============================================
-- Xóa các bảng cũ nếu tồn tại (theo thứ tự ngược lại để tránh lỗi foreign key)
-- ============================================
IF OBJECT_ID('payments', 'U') IS NOT NULL DROP TABLE payments;
IF OBJECT_ID('bookings', 'U') IS NOT NULL DROP TABLE bookings;
IF OBJECT_ID('schedules', 'U') IS NOT NULL DROP TABLE schedules;
IF OBJECT_ID('buses', 'U') IS NOT NULL DROP TABLE buses;
IF OBJECT_ID('routes', 'U') IS NOT NULL DROP TABLE routes;
IF OBJECT_ID('sessions', 'U') IS NOT NULL DROP TABLE sessions;
IF OBJECT_ID('accounts', 'U') IS NOT NULL DROP TABLE accounts;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

-- ============================================
-- Bảng: users (Người dùng)
-- ============================================
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
GO

PRINT 'Bảng users đã được tạo';
GO

-- ============================================
-- Bảng: accounts (Tài khoản OAuth/Social Login)
-- ============================================
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
GO

PRINT 'Bảng accounts đã được tạo';
GO

-- ============================================
-- Bảng: sessions (Phiên đăng nhập)
-- ============================================
CREATE TABLE sessions (
    id NVARCHAR(255) PRIMARY KEY,
    sessionToken NVARCHAR(500) UNIQUE NOT NULL,
    userId NVARCHAR(255) NOT NULL,
    expires DATETIME2 NOT NULL,
    CONSTRAINT FK_sessions_users FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
GO

PRINT 'Bảng sessions đã được tạo';
GO

-- ============================================
-- Bảng: routes (Tuyến đường)
-- ============================================
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
    images NVARCHAR(MAX), -- JSON data
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
GO

PRINT 'Bảng routes đã được tạo';
GO

-- ============================================
-- Bảng: buses (Xe buýt)
-- ============================================
CREATE TABLE buses (
    id NVARCHAR(255) PRIMARY KEY,
    licensePlate NVARCHAR(50) UNIQUE NOT NULL,
    busType NVARCHAR(100) NOT NULL,
    totalSeats INT NOT NULL,
    status NVARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL
);
GO

PRINT 'Bảng buses đã được tạo';
GO

-- ============================================
-- Bảng: schedules (Lịch trình)
-- ============================================
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
    CONSTRAINT FK_schedules_buses FOREIGN KEY (busId) REFERENCES buses(id) ON DELETE CASCADE,
    CONSTRAINT UQ_schedules_route_bus_date_time UNIQUE (routeId, busId, date, departureTime)
);
GO

PRINT 'Bảng schedules đã được tạo';
GO

-- ============================================
-- Bảng: bookings (Đặt vé)
-- ============================================
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
    status NVARCHAR(50) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED')),
    qrCode NVARCHAR(MAX),
    ticketUrl NVARCHAR(500),
    checkedIn BIT DEFAULT 0 NOT NULL,
    checkedInAt DATETIME2,
    checkedInBy NVARCHAR(255),
    notes NVARCHAR(MAX),
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    CONSTRAINT FK_bookings_routes FOREIGN KEY (routeId) REFERENCES routes(id),
    CONSTRAINT FK_bookings_schedules FOREIGN KEY (scheduleId) REFERENCES schedules(id),
    CONSTRAINT FK_bookings_users FOREIGN KEY (userId) REFERENCES users(id)
);
GO

PRINT 'Bảng bookings đã được tạo';
GO

-- ============================================
-- Bảng: payments (Thanh toán)
-- ============================================
CREATE TABLE payments (
    id NVARCHAR(255) PRIMARY KEY,
    bookingId NVARCHAR(255) UNIQUE NOT NULL,
    amount INT NOT NULL,
    method NVARCHAR(50) NOT NULL CHECK (method IN ('CASH', 'BANK_TRANSFER', 'QRCODE', 'VNPAY', 'MOMO')),
    status NVARCHAR(50) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    transactionId NVARCHAR(255),
    paidAt DATETIME2,
    metadata NVARCHAR(MAX), -- JSON data
    createdAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    updatedAt DATETIME2 DEFAULT GETDATE() NOT NULL,
    CONSTRAINT FK_payments_bookings FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE
);
GO

PRINT 'Bảng payments đã được tạo';
GO

-- ============================================
-- Tạo Indexes để tối ưu performance
-- ============================================
CREATE INDEX IDX_accounts_userId ON accounts(userId);
CREATE INDEX IDX_sessions_userId ON sessions(userId);
CREATE INDEX IDX_schedules_routeId ON schedules(routeId);
CREATE INDEX IDX_schedules_busId ON schedules(busId);
CREATE INDEX IDX_schedules_date ON schedules(date);
CREATE INDEX IDX_bookings_userId ON bookings(userId);
CREATE INDEX IDX_bookings_routeId ON bookings(routeId);
CREATE INDEX IDX_bookings_scheduleId ON bookings(scheduleId);
CREATE INDEX IDX_bookings_status ON bookings(status);
CREATE INDEX IDX_bookings_date ON bookings(date);
CREATE INDEX IDX_payments_bookingId ON payments(bookingId);
CREATE INDEX IDX_payments_status ON payments(status);
GO

PRINT 'Các indexes đã được tạo';
GO

PRINT '===========================================';
PRINT 'TẤT CẢ CÁC BẢNG ĐÃ ĐƯỢC TẠO THÀNH CÔNG!';
PRINT '===========================================';
GO
