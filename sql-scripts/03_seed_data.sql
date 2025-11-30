-- ============================================
-- Script: Insert dữ liệu mẫu vào Database
-- Mô tả: Thêm dữ liệu routes và buses mẫu
-- ============================================

USE XeVoCucPhuong;
GO

PRINT 'Bắt đầu insert dữ liệu mẫu...';
GO

-- ============================================
-- Insert Routes (Tuyến đường)
-- ============================================
PRINT 'Đang thêm routes...';

INSERT INTO routes (id, [from], [to], price, duration, busType, operatingStart, operatingEnd, description, isActive, intervalMinutes, createdAt, updatedAt)
VALUES
('1', N'Long Khánh', N'Sài Gòn (Cao tốc)', 120000, N'1.5 giờ', N'Ghế ngồi', '05:00', '18:00', N'Tuyến Long Khánh - Sài Gòn qua cao tốc, nhanh chóng tiện lợi', 1, 30, GETDATE(), GETDATE()),
('2', N'Long Khánh', N'Sài Gòn (Quốc lộ)', 110000, N'2 giờ', N'Ghế ngồi', '05:00', '18:00', N'Tuyến Long Khánh - Sài Gòn qua quốc lộ, giá rẻ', 1, 30, GETDATE(), GETDATE()),
('3', N'Sài Gòn', N'Long Khánh (Cao tốc)', 120000, N'1.5 giờ', N'Ghế ngồi', '05:00', '18:00', N'Tuyến Sài Gòn - Long Khánh qua cao tốc', 1, 30, GETDATE(), GETDATE()),
('4', N'Sài Gòn', N'Long Khánh (Quốc lộ)', 110000, N'2 giờ 30 phút', N'Ghế ngồi', '05:00', '18:00', N'Tuyến Sài Gòn - Long Khánh qua quốc lộ', 1, 30, GETDATE(), GETDATE()),
('5', N'Sài Gòn', N'Xuân Lộc (Cao tốc)', 130000, N'2 giờ - 4 giờ', N'Ghế ngồi', '05:30', '19:00', N'Tuyến Sài Gòn - Xuân Lộc qua cao tốc', 1, 30, GETDATE(), GETDATE()),
('6', N'Quốc Lộ 1A', N'Xuân Lộc (Quốc lộ)', 130000, N'1.5 giờ - 4 tiếng', N'Ghế ngồi', '05:30', '19:00', N'Tuyến Quốc Lộ 1A - Xuân Lộc', 1, 30, GETDATE(), GETDATE()),
('7', N'Xuân Lộc', N'Long Khánh (Cao tốc)', 130000, N'1 giờ', N'Ghế ngồi', '05:30', '19:00', N'Tuyến Xuân Lộc - Long Khánh qua cao tốc', 1, 30, GETDATE(), GETDATE()),
('8', N'Xuân Lộc', N'Long Khánh (Quốc lộ)', 130000, N'1.5 giờ', N'Ghế ngồi', '05:30', '19:00', N'Tuyến Xuân Lộc - Long Khánh qua quốc lộ', 1, 30, GETDATE(), GETDATE());

PRINT '✓ Đã thêm 8 routes';
GO

-- ============================================
-- Insert Buses (Xe buýt)
-- ============================================
PRINT 'Đang thêm buses...';

INSERT INTO buses (id, licensePlate, busType, totalSeats, status, createdAt, updatedAt)
VALUES
(NEWID(), N'51B-12345', N'Ghế ngồi', 45, 'ACTIVE', GETDATE(), GETDATE()),
(NEWID(), N'51B-12346', N'Ghế ngồi', 45, 'ACTIVE', GETDATE(), GETDATE()),
(NEWID(), N'51B-12347', N'Ghế ngồi', 45, 'ACTIVE', GETDATE(), GETDATE()),
(NEWID(), N'51B-12348', N'Giường nằm', 36, 'ACTIVE', GETDATE(), GETDATE()),
(NEWID(), N'51B-12349', N'Giường nằm', 36, 'ACTIVE', GETDATE(), GETDATE()),
(NEWID(), N'51B-12350', N'Limousine', 24, 'ACTIVE', GETDATE(), GETDATE()),
(NEWID(), N'51B-12351', N'Limousine', 24, 'ACTIVE', GETDATE(), GETDATE()),
(NEWID(), N'51B-12352', N'Ghế ngồi', 45, 'ACTIVE', GETDATE(), GETDATE());

PRINT '✓ Đã thêm 8 buses';
GO

PRINT '';
PRINT '===========================================';
PRINT 'DỮ LIỆU MẪU ĐÃ ĐƯỢC THÊM THÀNH CÔNG!';
PRINT '===========================================';
PRINT '';
PRINT 'Tiếp theo:';
PRINT '1. Chạy script Node.js để thêm users với password hash:';
PRINT '   npm run seed-users';
PRINT '';
PRINT 'Hoặc sử dụng Prisma để seed toàn bộ:';
PRINT '   npx prisma db seed';
PRINT '';
GO
