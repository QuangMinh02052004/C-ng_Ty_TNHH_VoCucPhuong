-- ============================================
-- DỮ LIỆU CHO NEON (PostgreSQL)
-- Chạy sau khi chạy neon_schema.sql
-- ============================================

-- ============================================
-- USERS (5 users)
-- ============================================
INSERT INTO users (id, email, password, name, phone, role, created_at, updated_at) VALUES
('9370c6ed-899c-42d2-b87a-f881a5229ad7', 'staff@vocucphuong.com', '$2b$10$RI6he1yoAc1tgbKOFNpJnOHzeN6.orINOTin8BTKR/C8iWG9S0O9y', 'Nhân viên', '02519999975', 'STAFF', NOW(), NOW()),
('946327fe-acd5-4581-aa42-769e394e70c0', 'admin@vocucphuong.com', '$2b$10$0GsZWC35.pkv7.V7qnsFQuCHjqDZDkwxbTAj3wOZy0EcGrvIgEqya', 'Quản trị viên', '02519999975', 'ADMIN', NOW(), NOW()),
('aa11b92d-e685-4a5a-b694-e8c21c89c333', 'user@example.com', '$2b$10$yfF10H6X8oAZlo4wUPFUTeJAGLSa9ukxeOXrffuVN/o7XwSzzkSXy', 'Nguyễn Văn A', '0987654321', 'USER', NOW(), NOW()),
('ae614573-6938-484c-b3b6-d054baefa0fa', 'lequangminh951@gmail.com', '$2b$10$wrX5HZ5FCULZkU/iC0Gq3Oo3NO1SmD25WgNORa/3O8M9SwrjHDis.', 'Lê Quang Minh', '0908724146', 'USER', NOW(), NOW()),
('deb1ff70-2930-4752-adc7-1ff2430c538d', 'mincubu0205@gmail.com', '$2b$10$txOW3vK5fTDtg.EXlxmF3.zjOdICycMsh8I1TYxZf5pVA0uLRI8Oq', 'Lê Quang Minh', '0908724146', 'USER', NOW(), NOW());

-- ============================================
-- ROUTES (8 tuyến)
-- ============================================
INSERT INTO routes (id, origin, destination, price, duration, bus_type, operating_start, operating_end, is_active, interval_minutes, created_at, updated_at) VALUES
('1', 'Long Khánh', 'Sài Gòn (Cao tốc)', 120000, '1.5 giờ', 'Ghế ngồi', '05:00', '18:00', true, 30, NOW(), NOW()),
('2', 'Long Khánh', 'Sài Gòn (Quốc lộ)', 110000, '2 giờ', 'Ghế ngồi', '05:00', '18:00', true, 30, NOW(), NOW()),
('3', 'Sài Gòn', 'Long Khánh (Cao tốc)', 120000, '1.5 giờ', 'Ghế ngồi', '05:00', '18:00', true, 30, NOW(), NOW()),
('4', 'Sài Gòn', 'Long Khánh (Quốc lộ)', 110000, '2 giờ 30 phút', 'Ghế ngồi', '05:00', '18:00', true, 30, NOW(), NOW()),
('5', 'Sài Gòn', 'Xuân Lộc (Cao tốc)', 130000, '2 giờ - 4 giờ', 'Ghế ngồi', '05:30', '19:00', true, 30, NOW(), NOW()),
('6', 'Quốc Lộ 1A', 'Xuân Lộc (Quốc lộ)', 130000, '1.5 giờ - 4 tiếng', 'Ghế ngồi', '05:30', '19:00', true, 30, NOW(), NOW()),
('7', 'Xuân Lộc', 'Long Khánh (Cao tốc)', 130000, '1 giờ', 'Ghế ngồi', '05:30', '19:00', true, 30, NOW(), NOW()),
('8', 'Xuân Lộc', 'Long Khánh (Quốc lộ)', 130000, '1.5 giờ', 'Ghế ngồi', '05:30', '19:00', true, 30, NOW(), NOW());

-- ============================================
-- BUSES (8 xe)
-- ============================================
INSERT INTO buses (id, license_plate, bus_type, total_seats, status, created_at, updated_at) VALUES
('49E6E250-AF1A-4398-9308-69A7224ACB4D', '51B-12351', 'Limousine', 24, 'ACTIVE', NOW(), NOW()),
('52D3A4FB-2B4F-4E10-8E2C-E6844A0B70C5', '51B-12346', 'Ghế ngồi', 45, 'ACTIVE', NOW(), NOW()),
('6B39525B-194C-43AD-96D7-24BCB26DCDF1', '51B-12348', 'Giường nằm', 36, 'ACTIVE', NOW(), NOW()),
('762BA7D3-F349-426E-9EBF-11D88CA4B81A', '51B-12347', 'Ghế ngồi', 45, 'ACTIVE', NOW(), NOW()),
('86B2609C-F79B-49F7-B737-47B1953C4411', '51B-12349', 'Giường nằm', 36, 'ACTIVE', NOW(), NOW()),
('97B0D070-8B6F-4FC2-A457-F8630E7802B8', '51B-12345', 'Ghế ngồi', 45, 'ACTIVE', NOW(), NOW()),
('B7316D00-4748-4CEA-A05D-1A13B69E9492', '51B-12352', 'Ghế ngồi', 45, 'ACTIVE', NOW(), NOW()),
('CBE6DC9E-E061-4F6E-B187-D88D53AF35EE', '51B-12350', 'Limousine', 24, 'ACTIVE', NOW(), NOW());

-- ============================================
-- BOOKINGS (26 đơn đặt vé)
-- ============================================
INSERT INTO bookings (id, booking_code, customer_name, customer_phone, customer_email, route_id, date, departure_time, seats, total_price, status, checked_in, created_at, updated_at) VALUES
('119c6073-c8ad-4845-b99f-9c40206cf2c8', 'VCP202512146942', 'Nguyễn Văn A', '0987654321', 'user@example.com', '3', '2025-12-14', '11:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('142bc7e7-f5c7-4460-9ea8-a204e9c8f51d', 'VCP202601122479', 'Quản trị viên', '02519999975', 'lequangminh951@gmail.com', '1', '2026-01-12', '12:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('1cf16c19-bbdd-4d2c-9074-816dc5021082', 'VCP202512148366', 'Minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-14', '13:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('7f848954-c97f-449d-9b0d-598869a9736b', 'VCP202601126571', 'Quản trị viên', '02519999975', 'admin@vocucphuong.com', '1', '2026-01-12', '04:30', 1, 120000, 'PAID', true, NOW(), NOW()),
('a29554b5-4794-4199-b62a-92c2807af784', 'VCP202511306203', 'minh', '0908724146', 'lequangminh951@gmail.com', '1', '2025-11-30', '18:00', 1, 120000, 'PAID', false, NOW(), NOW()),
('d7d8c08f-fd1e-4159-8fee-ccb528b5170a', 'VCP202601121279', 'Quản trị viên', '02519999975', 'lequangminh951@gmail.com', '1', '2026-01-12', '15:00', 1, 120000, 'PAID', false, NOW(), NOW());

-- ============================================
-- THỐNG KÊ SAU KHI SEED
-- ============================================
-- SELECT 'Users:', COUNT(*) FROM users;
-- SELECT 'Routes:', COUNT(*) FROM routes;
-- SELECT 'Buses:', COUNT(*) FROM buses;
-- SELECT 'Bookings:', COUNT(*) FROM bookings;
