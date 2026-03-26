import { NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';

export const dynamic = 'force-dynamic';

// GET /api/test-email - Debug endpoint to test email config
export async function GET() {
    const config = {
        host: process.env.EMAIL_HOST || '(not set)',
        port: process.env.EMAIL_PORT || '(not set)',
        user: process.env.EMAIL_USER || '(not set)',
        hasPassword: !!process.env.EMAIL_PASSWORD,
        passwordLength: process.env.EMAIL_PASSWORD?.length || 0,
        from: process.env.EMAIL_FROM || '(not set)',
    };

    // Try to verify SMTP connection
    let smtpTest = 'not tested';
    try {
        const transporter = createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.verify();
        smtpTest = 'OK - SMTP connection verified';
    } catch (error: any) {
        smtpTest = `FAILED: ${error.code || ''} ${error.message}`;
    }

    return NextResponse.json({
        config,
        smtpTest,
        timestamp: new Date().toISOString(),
    });
}
