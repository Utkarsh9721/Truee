import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

// After the guard, TypeScript still keeps `string | undefined` on the const
// when referenced inside a closure. Re-bind it to a narrowed const:
const uri: string = MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(uri).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}