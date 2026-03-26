-- ============================================
-- BACKUP ĐẦY ĐỦ DỮ LIỆU - XeVoCucPhuong
-- Ngày: 2026-01-14
-- Database gốc: SQL Server
-- ============================================

-- ============================================
-- BẢNG: USERS (5 users)
-- ============================================
-- Mật khẩu:
-- admin@vocucphuong.com: admin123456
-- staff@vocucphuong.com: staff123456
-- user@example.com: user123456
-- lequangminh951@gmail.com: (mật khẩu của bạn)
-- mincubu0205@gmail.com: (mật khẩu của bạn)

INSERT INTO users (id, email, password, name, phone, role, created_at, updated_at) VALUES
('9370c6ed-899c-42d2-b87a-f881a5229ad7', 'staff@vocucphuong.com', '$2b$10$RI6he1yoAc1tgbKOFNpJnOHzeN6.orINOTin8BTKR/C8iWG9S0O9y', 'Nhân viên', '02519999975', 'STAFF', NOW(), NOW()),
('946327fe-acd5-4581-aa42-769e394e70c0', 'admin@vocucphuong.com', '$2b$10$0GsZWC35.pkv7.V7qnsFQuCHjqDZDkwxbTAj3wOZy0EcGrvIgEqya', 'Quản trị viên', '02519999975', 'ADMIN', NOW(), NOW()),
('aa11b92d-e685-4a5a-b694-e8c21c89c333', 'user@example.com', '$2b$10$yfF10H6X8oAZlo4wUPFUTeJAGLSa9ukxeOXrffuVN/o7XwSzzkSXy', 'Nguyễn Văn A', '0987654321', 'USER', NOW(), NOW()),
('ae614573-6938-484c-b3b6-d054baefa0fa', 'lequangminh951@gmail.com', '$2b$10$wrX5HZ5FCULZkU/iC0Gq3Oo3NO1SmD25WgNORa/3O8M9SwrjHDis.', 'Lê Quang Minh', '0908724146', 'USER', NOW(), NOW()),
('deb1ff70-2930-4752-adc7-1ff2430c538d', 'mincubu0205@gmail.com', '$2b$10$txOW3vK5fTDtg.EXlxmF3.zjOdICycMsh8I1TYxZf5pVA0uLRI8Oq', 'Lê Quang Minh', '0908724146', 'USER', NOW(), NOW());

-- ============================================
-- BẢNG: ROUTES (8 tuyến)
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
-- BẢNG: BUSES (8 xe)
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
-- BẢNG: BOOKINGS (26 đơn)
-- ============================================
INSERT INTO bookings (id, booking_code, customer_name, customer_phone, customer_email, route_id, date, departure_time, seats, total_price, status, checked_in, created_at, updated_at) VALUES
('119c6073-c8ad-4845-b99f-9c40206cf2c8', 'VCP202512146942', 'Nguyễn Văn A', '0987654321', 'user@example.com', '3', '2025-12-14', '11:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('142bc7e7-f5c7-4460-9ea8-a204e9c8f51d', 'VCP202601122479', 'Quản trị viên', '02519999975', 'lequangminh951@gmail.com', '1', '2026-01-12', '12:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('1cf16c19-bbdd-4d2c-9074-816dc5021082', 'VCP202512148366', 'Minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-14', '13:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('26dcaa6d-6660-4d46-9520-0a4c854865f8', 'VCP202512140135', 'Lê Quang Minh', '0908724146', 'mincubu0205@gmail.com', '3', '2025-12-14', '20:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('2ab9d916-20ee-4d02-9d67-7d528a276ca7', 'VCP202601123564', 'Quản trị viên', '02519999975', 'lequangminh951@gmail.com', '1', '2026-01-12', '13:30', 1, 120000, 'PENDING', false, NOW(), NOW()),
('34e3d156-9000-4ca4-aaf5-390f96dfac05', 'VCP202511306437', 'Lê Quang Minh', '0908724146', 'lequangminh951@gmail.com', '1', '2025-11-30', '18:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('3be1f04f-3465-41a6-bf8d-f38948f06ea4', 'VCP202601123883', 'Quang Minh', '0908724146', 'lequangminh951@gmail.com', '1', '2026-01-12', '10:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('492664fd-1f84-4594-989a-2bc0051c8b77', 'VCP202511301288', 'Nguyễn Văn A', '0987654321', 'user@example.com', '1', '2025-11-30', '18:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('4cf9c387-21a8-4576-9faa-7631ba092f4f', 'VCP202511306293', 'Lê Quang Minh', '0908724146', 'lequangminh951@gmail.com', '1', '2025-11-30', '18:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('573f67b1-4d6e-44e9-8622-b95bab78bab6', 'VCP202512299518', 'Quản trị viên', '02519999975', 'admin@vocucphuong.com', '1', '2025-12-29', '09:30', 1, 120000, 'PENDING', false, NOW(), NOW()),
('6d480361-3812-47d8-9027-33cef518e482', 'VCP202512119814', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '11:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('7058e57b-30d7-4b0e-9157-7f0e081e1683', 'VCP202512116857', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '06:30', 2, 240000, 'PENDING', false, NOW(), NOW()),
('7b0d5e8f-afd2-4b76-b5e0-327b4c0020ee', 'VCP202512114408', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '11:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('7f848954-c97f-449d-9b0d-598869a9736b', 'VCP202601126571', 'Quản trị viên', '02519999975', 'admin@vocucphuong.com', '1', '2026-01-12', '04:30', 1, 120000, 'PAID', true, NOW(), NOW()),
('85ae6ca9-9699-42d6-9153-e841bace2f9b', 'VCP202512112939', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '11:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('9688dd18-a4b3-427d-a1b0-368458105883', 'VCP202512140798', 'Lê Quang Minh', '0908724146', 'mincubu0205@gmail.com', '3', '2025-12-14', '15:30', 1, 120000, 'PENDING', false, NOW(), NOW()),
('990b2374-cc5b-4d34-8dbd-43b06168681a', 'VCP202512111499', 'minh', '0908724146', 'lequangminh951@gmail.com', '1', '2025-12-12', '05:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('a29554b5-4794-4199-b62a-92c2807af784', 'VCP202511306203', 'minh', '0908724146', 'lequangminh951@gmail.com', '1', '2025-11-30', '18:00', 1, 120000, 'PAID', false, NOW(), NOW()),
('a4a12a65-7d59-4f90-bd21-576e1c4f47e0', 'VCP202512111243', 'minh', '0908724146', 'lequangminh951@gmail.com', '1', '2025-12-12', '09:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('a749144e-8ba8-423e-8f73-98e638d72523', 'VCP202512124738', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '07:30', 2, 240000, 'PENDING', false, NOW(), NOW()),
('ab7a6dcb-931b-4bb6-b789-5ee175d09339', 'VCP202512293904', 'Quản trị viên', '02519999975', 'admin@vocucphuong.com', '3', '2025-12-29', '11:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('bb171cf6-b84a-4736-98ec-37ce48db36b6', 'VCP202512128849', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '08:00', 10, 1200000, 'PENDING', false, NOW(), NOW()),
('d7d8c08f-fd1e-4159-8fee-ccb528b5170a', 'VCP202601121279', 'Quản trị viên', '02519999975', 'lequangminh951@gmail.com', '1', '2026-01-12', '15:00', 1, 120000, 'PAID', false, NOW(), NOW()),
('f4afcb55-ea19-45ec-b536-bb00eaa4dd1c', 'VCP202512129282', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '11:00', 5, 600000, 'PENDING', false, NOW(), NOW()),
('f64fd3fd-db8f-44c7-8c68-b7b246635034', 'VCP202512125082', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '17:00', 1, 120000, 'PENDING', false, NOW(), NOW()),
('f93baf5b-d291-4e2f-9f5e-50e61eebf500', 'VCP202512118468', 'minh', '0908724146', 'lequangminh951@gmail.com', '3', '2025-12-12', '11:00', 1, 120000, 'PENDING', false, NOW(), NOW());

-- ============================================
-- THỐNG KÊ
-- ============================================
-- Users: 5
-- Routes: 8
-- Buses: 8
-- Bookings: 26
-- ============================================
