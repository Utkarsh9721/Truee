import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '../../../Models/User';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        await dbConnect();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 12);
        await User.create({ name, email, password: hashed });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[register]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}