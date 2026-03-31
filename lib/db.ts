import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env.local");
}

// Use a global cache to reuse connection across Next.js hot reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: mongoose.Connection | null;
}

let cached = global._mongooseConn ?? null;

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached && cached.readyState === 1) return cached;

  const conn = await mongoose.connect(MONGO_URI);

  cached = conn.connection;
  global._mongooseConn = cached;

  console.log("MongoDB connected:", cached.host);
  return cached;
}
