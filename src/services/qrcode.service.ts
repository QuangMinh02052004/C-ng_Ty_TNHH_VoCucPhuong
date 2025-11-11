import QRCode from 'qrcode';

// ===========================================
// QR CODE SERVICE - MODULE ĐỘC LẬP
// ===========================================
// Service này tạo QR code cho thanh toán và vé

interface GeneratePaymentQRParams {
    bookingCode: string;
    amount: number;
    bankAccount?: string;
    bankName?: string;
}

interface GenerateTicketQRParams {
    bookingCode: string;
    customerName: string;
    route: string;
    date: string;
    departureTime: string;
    seats: number;
}

/**
 * Tạo QR code thanh toán theo chuẩn VietQR
 * QR code có thể quét bằng app ngân hàng để chuyển tiền
 */
export async function generatePaymentQRCode({
    bookingCode,
    amount,
}: GeneratePaymentQRParams): Promise<string> {
    try {
        // Thông tin tài khoản nhận tiền (lấy từ env hoặc config)
        const bankAccount = process.env.BANK_ACCOUNT_NO || '0908724146';
        const accountName = process.env.BANK_ACCOUNT_NAME || 'CONG TY TNHH VO CUC PHUONG';
        const bankCode = process.env.BANK_CODE || '970422'; // MBBank bin

        // Tạo nội dung chuyển khoản - CHỈ CẦN MÃ VÉ
        const description = bookingCode;

        // Gọi VietQR API để tạo QR code
        const vietQRUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

        // Fetch QR image và convert sang base64
        try {
            const response = await fetch(vietQRUrl);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                return `data:image/png;base64,${base64}`;
            }
        } catch (fetchError) {
            console.warn('[QR] VietQR API không khả dụng, tạo QR code dự phòng:', fetchError);
        }

        // Fallback: tạo QR code chứa thông tin chuyển khoản
        const qrContent = {
            type: 'PAYMENT',
            bookingCode,
            amount,
            bankAccount,
            bankName: 'MBBank',
            accountName,
            description,
            timestamp: new Date().toISOString(),
        };

        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrContent), {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('[QR] Error generating payment QR code:', error);
        throw new Error('Failed to generate payment QR code');
    }
}

/**
 * Tạo QR code cho vé xe (để check-in và xem thông tin)
 * QR code chứa URL đến trang xem vé, khi quét sẽ mở trang web hiển thị đầy đủ thông tin
 */
export async function generateTicketQRCode({
    bookingCode,
    customerName,
    route,
    date,
    departureTime,
    seats,
}: GenerateTicketQRParams): Promise<string> {
    try {
        // Tạo URL đến trang xem vé công khai
        // Khi quét QR code bằng camera, sẽ tự động mở trang web này
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const ticketUrl = `${baseUrl}/ve/${bookingCode}`;

        // Tạo QR code chứa URL
        const qrCodeDataURL = await QRCode.toDataURL(ticketUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('[QR] Error generating ticket QR code:', error);
        throw new Error('Failed to generate ticket QR code');
    }
}

/**
 * Tạo QR code thanh toán theo chuẩn VietQR (mô phỏng)
 * Trong thực tế sẽ gọi API VietQR để tạo
 */
export async function generateVietQRCode({
    amount,
    description,
    accountNo = '1234567890',
    accountName = 'XE VO CUC PHUONG',
    bankCode = 'VCB', // Vietcombank
}: {
    amount: number;
    description: string;
    accountNo?: string;
    accountName?: string;
    bankCode?: string;
}): Promise<string> {
    try {
        // Chuẩn VietQR format
        // https://www.vietqr.io/danh-sach-api
        const vietQRData = {
            accountNo,
            accountName,
            acqId: bankCode,
            amount: amount.toString(),
            addInfo: description,
            format: 'text',
            template: 'compact',
        };

        // Trong môi trường production, gọi API VietQR:
        // const response = await fetch('https://api.vietqr.io/v2/generate', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(vietQRData)
        // });
        // const result = await response.json();
        // return result.data.qrDataURL;

        // Tạm thời tạo QR code mô phỏng
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(vietQRData), {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 1,
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('[QR] Error generating VietQR code:', error);
        throw new Error('Failed to generate VietQR code');
    }
}

/**
 * Parse QR code data (để scan và verify)
 */
export function parseQRCode(qrData: string): any {
    try {
        return JSON.parse(qrData);
    } catch (error) {
        console.error('[QR] Error parsing QR code:', error);
        return null;
    }
}

/**
 * Verify QR code vé xe
 */
export function verifyTicketQRCode(qrData: string, bookingCode: string): boolean {
    try {
        const data = parseQRCode(qrData);
        return data && data.type === 'TICKET' && data.bookingCode === bookingCode;
    } catch (error) {
        console.error('[QR] Error verifying ticket QR code:', error);
        return false;
    }
}
