import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UserRepository } from '@/lib/repositories/user-repository';
import { hashPassword, isValidEmail, isValidPhone } from '@/lib/utils';

// ===========================================
// API: ĐĂNG KÝ TÀI KHOẢN MỚI
// ===========================================
// POST /api/auth/register

const registerSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
    phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validation.error.issues,
                },
                { status: 400 }
            );
        }

        const { email, password, name, phone } = validation.data;

        // Validate email format
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { success: false, error: 'Email không hợp lệ' },
                { status: 400 }
            );
        }

        // Validate phone if provided
        if (phone && !isValidPhone(phone)) {
            return NextResponse.json(
                { success: false, error: 'Số điện thoại không hợp lệ' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await UserRepository.findByEmail(email);

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email đã được đăng ký' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await UserRepository.create({
            email,
            password: hashedPassword,
            name,
            phone,
            role: 'USER', // Default role
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Đăng ký thành công',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        role: user.role,
                        createdAt: user.createdAt,
                    },
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('[API] Error registering user:', error);

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
