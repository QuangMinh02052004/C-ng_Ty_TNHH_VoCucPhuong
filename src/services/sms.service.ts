import twilio from 'twilio';

// ===========================================
// SMS SERVICE - MODULE ĐỘC LẬP
// ===========================================
// Service này xử lý tất cả SMS logic
// Sử dụng Twilio để gửi SMS

interface SendSMSParams {
    to: string;
    message: string;
}

// Tạo Twilio client
const getTwilioClient = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.warn('Twilio credentials not configured. SMS will not be sent.');
        return null;
    }

    return twilio(accountSid, authToken);
};

/**
 * Gửi SMS chung
 */
export async function sendSMS({ to, message }: SendSMSParams) {
    try {
        const client = getTwilioClient();

        if (!client) {
            console.log('[SMS] Skipping SMS (Twilio not configured):', { to, message });
            return { success: false, error: 'Twilio not configured' };
        }

        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!twilioPhone) {
            console.error('[SMS] TWILIO_PHONE_NUMBER not configured');
            return { success: false, error: 'TWILIO_PHONE_NUMBER not configured' };
        }

        // Format phone number (Vietnam: +84)
        const formattedPhone = formatPhoneNumber(to);

        const result = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: formattedPhone,
        });

        console.log('[SMS] Sent successfully:', result.sid);
        return { success: true, messageSid: result.sid };
    } catch (error) {
        console.error('[SMS] Error sending SMS:', error);
        return { success: false, error };
    }
}

/**
 * Format số điện thoại Việt Nam sang chuẩn quốc tế
 */
function formatPhoneNumber(phone: string): string {
    // Loại bỏ khoảng trắng và ký tự đặc biệt
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Nếu bắt đầu bằng 0, thay bằng +84
    if (cleaned.startsWith('0')) {
        cleaned = '+84' + cleaned.substring(1);
    }

    // Nếu bắt đầu bằng 84, thêm +
    if (cleaned.startsWith('84')) {
        cleaned = '+' + cleaned;
    }

    // Nếu không có +, thêm +84
    if (!cleaned.startsWith('+')) {
        cleaned = '+84' + cleaned;
    }

    return cleaned;
}

/**
 * Gửi SMS xác nhận vé
 */
export async function sendBookingConfirmationSMS({
    to,
    customerName,
    bookingCode,
    route,
    date,
    departureTime,
}: {
    to: string;
    customerName: string;
    bookingCode: string;
    route: string;
    date: string;
    departureTime: string;
}) {
    const message = `
[XE VO CUC PHUONG]
Xin chao ${customerName}!

Ma ve: ${bookingCode}
Tuyen: ${route}
Ngay di: ${date}
Gio: ${departureTime}

Vui long co mat truoc gio xuat ben 15 phut.
Hotline: 02519 999 975
    `.trim();

    return sendSMS({ to, message });
}

/**
 * Gửi SMS nhắc nhở trước giờ xuất bến
 */
export async function sendDepartureReminderSMS({
    to,
    customerName,
    bookingCode,
    route,
    departureTime,
    minutesBefore = 60,
}: {
    to: string;
    customerName: string;
    bookingCode: string;
    route: string;
    departureTime: string;
    minutesBefore?: number;
}) {
    const message = `
[XE VO CUC PHUONG - NHAC NHO]
Xin chao ${customerName}!

Chuyen xe cua ban (${route}) se xuat ben luc ${departureTime}.
Ma ve: ${bookingCode}

Con ${minutesBefore} phut nua. Vui long chuan bi!
Hotline: 02519 999 975
    `.trim();

    return sendSMS({ to, message });
}

/**
 * Gửi SMS hủy vé
 */
export async function sendBookingCancellationSMS({
    to,
    customerName,
    bookingCode,
}: {
    to: string;
    customerName: string;
    bookingCode: string;
}) {
    const message = `
[XE VO CUC PHUONG]
Xin chao ${customerName}!

Ve cua ban voi ma ${bookingCode} da duoc huy thanh cong.

Lien he: 02519 999 975 neu co thac mac.
    `.trim();

    return sendSMS({ to, message });
}
