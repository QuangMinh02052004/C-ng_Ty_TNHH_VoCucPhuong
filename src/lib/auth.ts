import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserRepository } from '@/lib/repositories/user-repository';
import { comparePassword } from '@/lib/utils';

// ===========================================
// NEXTAUTH CONFIGURATION
// ===========================================

export const authOptions: NextAuthOptions = {
    // Không cần adapter khi dùng JWT strategy
    // adapter: PrismaAdapter(prisma),

    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email và mật khẩu là bắt buộc');
                }

                // Tìm user trong database
                const user = await UserRepository.findByEmail(credentials.email);

                if (!user || !user.password) {
                    throw new Error('Email hoặc mật khẩu không đúng');
                }

                // Verify password
                const isPasswordValid = await comparePassword(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error('Email hoặc mật khẩu không đúng');
                }

                // Return user object
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    phone: user.phone || undefined,
                    avatar: user.avatar || undefined,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // Add user info to token
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.phone = user.phone;
                token.avatar = user.avatar;
            }
            return token;
        },

        async session({ session, token }) {
            // Add token info to session
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.phone = token.phone as string | undefined;
                session.user.avatar = token.avatar as string | undefined;
            }
            return session;
        },
    },

    pages: {
        signIn: '/auth/login',
        signOut: '/auth/logout',
        error: '/auth/error',
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === 'development',
};
