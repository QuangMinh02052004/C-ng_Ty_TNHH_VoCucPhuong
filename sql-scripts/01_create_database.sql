-- ============================================
-- Script: Tạo Database XeVoCucPhuong
-- Mô tả: Tạo database mới cho hệ thống quản lý xe Võ Cúc Phương
-- ============================================

-- Kiểm tra và xóa database cũ nếu tồn tại (cẩn thận với lệnh này!)
-- Uncomment dòng dưới nếu muốn xóa database cũ
-- DROP DATABASE IF EXISTS XeVoCucPhuong;

-- Tạo database mới
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'XeVoCucPhuong')
BEGIN
    CREATE DATABASE XeVoCucPhuong;
    PRINT 'Database XeVoCucPhuong đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT 'Database XeVoCucPhuong đã tồn tại!';
END
GO

-- Sử dụng database vừa tạo
USE XeVoCucPhuong;
GO

PRINT 'Đã chuyển sang database XeVoCucPhuong';
GO
