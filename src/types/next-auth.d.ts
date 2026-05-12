import type { UserRole } from '@/lib/db-types';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        phone?: string;
        avatar?: string;
        vehiclePlate?: string | null;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            phone?: string;
            avatar?: string;
            vehiclePlate?: string | null;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
        phone?: string;
        avatar?: string;
        vehiclePlate?: string | null;
    }
}
