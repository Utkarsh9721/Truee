import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    _id?: string;
    role: 'user' | 'bot';
    content: string;
    fileName?: string;
    createdAt: Date;
}

export interface IChat extends Document {
    title: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        role: { type: String, enum: ['user', 'bot'], required: true },
        content: { type: String, required: true },
        fileName: String,
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const ChatSchema = new Schema<IChat>(
    {
        title: { type: String, default: 'New conversation' },
        messages: [MessageSchema],
    },
    { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);