import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chat from '../../../../../Models/Chat';
import { generateReply } from '@/lib/llm';
import { extractText } from '@/lib/file-parser';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;

    const chat = await Chat.findById(id).lean();
    if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(
        chat.messages.map((m: any) => ({
            id: m._id.toString(),
            role: m.role,
            content: m.content,
            fileName: m.fileName,
            createdAt: new Date(m.createdAt).toISOString(),
        }))
    );
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;

    const chat = await Chat.findById(id);
    if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const form = await req.formData();
    const text = (form.get('content') as string) || '';
    const raw = form.get('file');
    const file = raw instanceof File ? raw : null;

    if (!text.trim() && !file) {
        return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    let fileText: string | undefined;
    if (file) {
        try {
            fileText = await extractText(file);
        } catch {
            fileText = `[Could not read: ${file.name}]`;
        }
    }

    // Build history BEFORE pushing the new message
    const history = chat.messages.slice(-20).map((m: any) => ({
        role: m.role as 'user' | 'bot',
        content: m.content,
    }));

    // Push user message
    chat.messages.push({
        role: 'user',
        content: text || (file ? `Uploaded ${file.name}` : ''),
        fileName: file?.name,
        createdAt: new Date(),
    });

    if (chat.title === 'New conversation') {
        chat.title = (text || file?.name || 'New conversation').slice(0, 60);
    }

    // Generate reply
    let reply: string;
    try {
        reply = await generateReply(history, text, fileText);
    } catch (err) {
        console.error('[generateReply]', err);
        reply = 'Sorry, I ran into an error. Please try again.';
    }

    const botCreatedAt = new Date();
    chat.messages.push({
        role: 'bot',
        content: reply,
        createdAt: botCreatedAt,
    });

    await chat.save();

    const saved = chat.messages.slice(-2);

    return NextResponse.json({
        userMessage: {
            id: saved[0]._id!.toString(),
            role: 'user',
            content: saved[0].content,
            fileName: saved[0].fileName,
            createdAt: new Date(saved[0].createdAt).toISOString(),
        },
        botMessage: {
            id: saved[1]._id!.toString(),
            role: 'bot',
            content: saved[1].content,
            createdAt: botCreatedAt.toISOString(),
        },
    });
}