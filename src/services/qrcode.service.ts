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
 * Tạo QR code thanh toán (mô phỏng)
 * Trong thực tế sẽ tích hợp với VNPay, MoMo, etc.
 */
export async function generatePaymentQRCode({
    bookingCode,
    amount,
    bankAccount = '0908724146',
    bankName = 'MBBank',
}: GeneratePaymentQRParams): Promise<string> {
    try {
        // Tạo nội dung QR code theo chuẩn VietQR
        // Format: bankAccount|bankName|amount|description
        const qrContent = {
            type: 'PAYMENT',
            bookingCode,
            amount,
            bankAccount,
            bankName,
            description: `Thanh toan ve xe ${bookingCode}`,
            timestamp: new Date().toISOString(),
        };

        // Tạo QR code dạng Data URL (base64)
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
 * Tạo QR code cho vé xe (để check-in)
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
        const qrContent = {
            type: 'TICKET',
            bookingCode,
            customerName,
            route,
            date,
            departureTime,
            seats,
            timestamp: new Date().toISOString(),
        };

        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrContent), {
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
