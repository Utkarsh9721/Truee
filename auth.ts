// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from './Models/User';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: 'jwt' },
    providers: [
        Google,   // ← new
        GitHub,   // ← new
        Credentials({
            // keep your original authorize logic unchanged
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;
                if (!email || !password) return null;

                await dbConnect();
                const user = await User.findOne({ email });
                if (!user) return null;

                const ok = await bcrypt.compare(password, user.password);
                if (!ok) return null;

                return { id: user._id.toString(), name: user.name, email: user.email };
            },
        }),
    ],
});