import { createTransport } from 'nodemailer';

// ===========================================
// EMAIL SERVICE - MODULE ĐỘC LẬP
// ===========================================
// Service này xử lý tất cả email logic
// Chỉ cần gọi các hàm export từ file khác

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

// Tạo transporter
const createTransporter = () => {
    console.log('📧 [Email] Creating transporter with config:', {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || '587',
        user: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASSWORD,
    });

    return createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * Gửi email chung
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    try {
        console.log('📧 [Email] Attempting to send email:', {
            to,
            subject,
            from: process.env.EMAIL_FROM || '"Xe Võ Cúc Phương" <vocucphuong0018@gmail.com>',
        });

        const transporter = createTransporter();

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Xe Võ Cúc Phương" <vocucphuong0018@gmail.com>',
            to,
            subject,
            text,
            html,
        });

        console.log('✅ [Email] Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('❌ [Email] Error sending email:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
        });
        return { success: false, error };
    }
}

/**
 * Gửi email xác nhận vé
 */
export async function sendBookingConfirmationEmail({
    to,
    customerName,
    bookingCode,
    route,
    date,
    departureTime,
    seats,
    totalPrice,
    ticketUrl,
}: {
    to: string;
    customerName: string;
    bookingCode: string;
    route: string;
    date: string;
    departureTime: string;
    seats: number;
    totalPrice: number;
    ticketUrl?: string;
}) {
    const subject = `Xác nhận đặt vé - Mã vé: ${bookingCode}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-info { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
        .booking-code { font-size: 24px; font-weight: bold; color: #0ea5e9; text-align: center; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-label { font-weight: bold; color: #6b7280; }
        .info-value { color: #111827; }
        .button { display: inline-block; padding: 12px 30px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚌 Xe Võ Cúc Phương</h1>
            <p>Xác nhận đặt vé thành công</p>
        </div>
        <div class="content">
            <h2>Xin chào ${customerName},</h2>
            <p>Cảm ơn bạn đã đặt vé tại <strong>Xe Võ Cúc Phương</strong>. Vé của bạn đã được xác nhận thành công!</p>

            <div class="booking-code">
                Mã vé: ${bookingCode}
            </div>

            <div class="booking-info">
                <h3 style="margin-top: 0;">Thông tin chuyến đi</h3>
                <div class="info-row">
                    <span class="info-label">Tuyến đường:</span>
                    <span class="info-value">${route}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày đi:</span>
                    <span class="info-value">${date}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Giờ xuất bến:</span>
                    <span class="info-value">${departureTime}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Số ghế:</span>
                    <span class="info-value">${seats} ghế</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tổng tiền:</span>
                    <span class="info-value" style="color: #0ea5e9; font-weight: bold;">${totalPrice.toLocaleString('vi-VN')} đ</span>
                </div>
            </div>

            ${ticketUrl ? `
            <div style="text-align: center;">
                <a href="${ticketUrl}" class="button">📄 Tải vé điện tử</a>
            </div>
            ` : ''}

            <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #92400e;">⚠️ Lưu ý quan trọng:</h4>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Vui lòng có mặt tại bến xe trước giờ xuất bến <strong>15 phút</strong></li>
                    <li>Mang theo CMND/CCCD để kiểm tra khi cần thiết</li>
                    <li>Xuất trình mã vé <strong>${bookingCode}</strong> khi lên xe</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <p><strong>Cần hỗ trợ?</strong></p>
                <p>📞 Hotline: <a href="tel:02519999975" style="color: #0ea5e9;">02519 999 975</a></p>
                <p>📧 Email: <a href="mailto:vocucphuong0018@gmail.com" style="color: #0ea5e9;">vocucphuong0018@gmail.com</a></p>
            </div>
        </div>
        <div class="footer">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            <p>&copy; 2024 Xe Võ Cúc Phương. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Xin chào ${customerName},

Cảm ơn bạn đã đặt vé tại Xe Võ Cúc Phương!

Mã vé: ${bookingCode}
Tuyến đường: ${route}
Ngày đi: ${date}
Giờ xuất bến: ${departureTime}
Số ghế: ${seats} ghế
Tổng tiền: ${totalPrice.toLocaleString('vi-VN')} đ

Vui lòng có mặt tại bến xe trước giờ xuất bến 15 phút.

Cần hỗ trợ? Liên hệ:
📞 Hotline: 02519 999 975
📧 Email: vocucphuong0018@gmail.com
    `;

    return sendEmail({ to, subject, html, text });
}

/**
 * Gửi email hủy vé
 */
export async function sendBookingCancellationEmail({
    to,
    customerName,
    bookingCode,
    route,
}: {
    to: string;
    customerName: string;
    bookingCode: string;
    route: string;
}) {
    const subject = `Xác nhận hủy vé - Mã vé: ${bookingCode}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚌 Xe Võ Cúc Phương</h1>
            <p>Xác nhận hủy vé</p>
        </div>
        <div class="content">
            <h2>Xin chào ${customerName},</h2>
            <p>Vé của bạn với mã <strong>${bookingCode}</strong> (${route}) đã được hủy thành công.</p>
            <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua hotline <strong>02519 999 975</strong>.</p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của Xe Võ Cúc Phương!</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Xe Võ Cúc Phương. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({ to, subject, html });
}

/**
 * Gửi email liên hệ từ khách hàng (feedback)
 */
export async function sendContactEmail({
    customerName,
    customerEmail,
    customerPhone,
    subject,
    message,
}: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    subject?: string;
    message: string;
}) {
    const emailSubject = subject
        ? `[Liên hệ] ${subject}`
        : `[Liên hệ] Tin nhắn từ ${customerName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .customer-info { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
        .info-row { padding: 5px 0; }
        .info-label { font-weight: bold; color: #6b7280; }
        .info-value { color: #111827; }
        .message-box { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Tin nhắn liên hệ mới</h1>
            <p>Từ website Xe Võ Cúc Phương</p>
        </div>
        <div class="content">
            <h2>Thông tin khách hàng</h2>
            <div class="customer-info">
                <div class="info-row">
                    <span class="info-label">👤 Họ tên:</span>
                    <span class="info-value">${customerName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📧 Email:</span>
                    <span class="info-value"><a href="mailto:${customerEmail}">${customerEmail}</a></span>
                </div>
                ${customerPhone ? `
                <div class="info-row">
                    <span class="info-label">📞 Số điện thoại:</span>
                    <span class="info-value"><a href="tel:${customerPhone}">${customerPhone}</a></span>
                </div>
                ` : ''}
                ${subject ? `
                <div class="info-row">
                    <span class="info-label">📋 Tiêu đề:</span>
                    <span class="info-value">${subject}</span>
                </div>
                ` : ''}
            </div>

            <h3>Nội dung tin nhắn:</h3>
            <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                    📅 Nhận lúc: ${new Date().toLocaleString('vi-VN')}
                </p>
            </div>
        </div>
        <div class="footer">
            <p>Email này được gửi từ form liên hệ trên website.</p>
            <p>&copy; 2024 Xe Võ Cúc Phương. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
📧 TIN NHẮN LIÊN HỆ MỚI

Thông tin khách hàng:
- Họ tên: ${customerName}
- Email: ${customerEmail}
${customerPhone ? `- Số điện thoại: ${customerPhone}` : ''}
${subject ? `- Tiêu đề: ${subject}` : ''}

Nội dung tin nhắn:
${message}

---
Nhận lúc: ${new Date().toLocaleString('vi-VN')}
    `;

    // Gửi đến email admin/staff
    return sendEmail({
        to: 'lequangminh951@gmail.com',
        subject: emailSubject,
        html,
        text
    });
}
