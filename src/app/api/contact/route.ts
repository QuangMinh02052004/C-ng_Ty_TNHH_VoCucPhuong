import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '@/services/email.service';

// ===========================================
// API: GỬI EMAIL LIÊN HỆ
// ===========================================
// POST /api/contact

const contactFormSchema = z.object({
    name: z.string().min(1, 'Họ tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(1, 'Nội dung tin nhắn là bắt buộc'),
});

export async function POST(request: NextRequest) {
    try {
        // 1. Validate input
        const body = await request.json();
        const validation = contactFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validation.error.errors,
                },
                { status: 400 }
            );
        }

        const { name, email, phone, subject, message } = validation.data;

        // 2. Gửi email
        const result = await sendContactEmail({
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            subject: subject,
            message: message,
        });

        if (!result.success) {
            console.error('[API] Error sending contact email:', result.error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to send email',
                    message: 'Không thể gửi email. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua hotline.',
                },
                { status: 500 }
            );
        }

        // 3. Log thành công
        console.log(`✅ [CONTACT] Email sent from ${name} (${email})`);

        return NextResponse.json({
            success: true,
            message: 'Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi trong thời gian sớm nhất!',
        });

    } catch (error) {
        console.error('[API] Error processing contact form:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
