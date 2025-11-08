import { jsPDF } from 'jspdf';

// ===========================================
// PDF SERVICE - MODULE ĐỘC LẬP
// ===========================================
// Service này tạo PDF vé xe điện tử

interface GenerateTicketPDFParams {
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    route: string;
    routeFrom: string;
    routeTo: string;
    date: string;
    departureTime: string;
    seats: number;
    totalPrice: number;
    qrCodeDataURL: string;
    busType?: string;
    duration?: string;
}

/**
 * Tạo PDF vé xe điện tử
 */
export async function generateTicketPDF(params: GenerateTicketPDFParams): Promise<Buffer> {
    const {
        bookingCode,
        customerName,
        customerPhone,
        customerEmail,
        route,
        routeFrom,
        routeTo,
        date,
        departureTime,
        seats,
        totalPrice,
        qrCodeDataURL,
        busType = 'Xe khách',
        duration = 'N/A',
    } = params;

    // Tạo PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ===== HEADER =====
    doc.setFillColor(14, 165, 233); // Sky blue
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('🚌 XE VÕ CÚC PHƯƠNG', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('VÉ XE ĐIỆN TỬ', pageWidth / 2, 30, { align: 'center' });

    // ===== MÃ VÉ =====
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Mã vé: ${bookingCode}`, pageWidth / 2, 55, { align: 'center' });

    // ===== THÔNG TIN HÀNH TRÌNH =====
    let yPos = 70;

    // Box cho tuyến đường
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3);

    yPos += 10;

    // Điểm đi
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Điểm đi:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(routeFrom, 45, yPos);

    // Mũi tên
    doc.setFontSize(14);
    doc.text('→', pageWidth / 2 - 5, yPos);

    // Điểm đến
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Điểm đến:', 100, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(routeTo, 130, yPos);

    yPos += 10;

    // Ngày đi
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Ngày đi:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(date, 45, yPos);

    // Giờ xuất bến
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Giờ xuất bến:', 100, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(departureTime, 130, yPos);

    yPos += 10;

    // Loại xe
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Loại xe:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(busType, 45, yPos);

    // Thời gian di chuyển
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Thời gian:', 100, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(duration, 130, yPos);

    // ===== THÔNG TIN KHÁCH HÀNG =====
    yPos += 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 233);
    doc.text('Thông tin hành khách', 20, yPos);

    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Họ và tên:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(customerName, 50, yPos);

    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Số điện thoại:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(customerPhone, 50, yPos);

    if (customerEmail) {
        yPos += 8;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(75, 85, 99);
        doc.text('Email:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(customerEmail, 50, yPos);
    }

    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Số ghế:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`${seats} ghế`, 50, yPos);

    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Tổng tiền:', 20, yPos);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 233);
    doc.text(`${totalPrice.toLocaleString('vi-VN')} đ`, 50, yPos);

    // ===== QR CODE =====
    yPos += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 233);
    doc.text('Mã QR Check-in', pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;

    // Thêm QR code image
    const qrSize = 50;
    doc.addImage(
        qrCodeDataURL,
        'PNG',
        pageWidth / 2 - qrSize / 2,
        yPos,
        qrSize,
        qrSize
    );

    yPos += qrSize + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Xuất trình mã QR này khi lên xe', pageWidth / 2, yPos, { align: 'center' });

    // ===== LƯU Ý QUAN TRỌNG =====
    yPos += 15;

    doc.setFillColor(254, 243, 199); // Light yellow
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');

    yPos += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text('⚠️ Lưu ý quan trọng:', 20, yPos);

    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('• Vui lòng có mặt tại bến xe trước giờ xuất bến 15 phút', 20, yPos);

    yPos += 6;
    doc.text('• Mang theo CMND/CCCD để kiểm tra khi cần thiết', 20, yPos);

    yPos += 6;
    doc.text(`• Xuất trình mã vé ${bookingCode} khi lên xe`, 20, yPos);

    // ===== FOOTER =====
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 30, pageWidth - 15, pageHeight - 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 233);
    doc.text('LIÊN HỆ HỖ TRỢ', pageWidth / 2, pageHeight - 22, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('📞 Hotline: 02519 999 975 | 📧 vocucphuong0018@gmail.com', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('© 2024 Xe Võ Cúc Phương. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
}

/**
 * Tạo PDF và trả về base64 string (để preview hoặc download trực tiếp)
 */
export async function generateTicketPDFBase64(params: GenerateTicketPDFParams): Promise<string> {
    const buffer = await generateTicketPDF(params);
    return buffer.toString('base64');
}

/**
 * Tạo PDF và lưu vào file system (nếu cần)
 */
export async function saveTicketPDF(params: GenerateTicketPDFParams, filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const buffer = await generateTicketPDF(params);
    await fs.writeFile(filePath, buffer);
}
