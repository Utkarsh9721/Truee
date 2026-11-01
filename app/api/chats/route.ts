import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '../../../Models/Chat';

export async function GET() {
    await dbConnect();
    const chats = await Chat.find({})
        .select('title updatedAt')
        .sort({ updatedAt: -1 })
        .lean();

    return NextResponse.json(
        chats.map((c: any) => ({
            id: c._id.toString(),
            title: c.title,
            updatedAt: new Date(c.updatedAt).getTime(),
        }))
    );
}

export async function POST() {
    await dbConnect();
    const chat = await Chat.create({});
    return NextResponse.json({
        id: chat._id.toString(),
        title: chat.title,
        updatedAt: chat.updatedAt.getTime(),
    });
}