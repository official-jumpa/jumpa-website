import mongoose from "mongoose";
import type { Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env.local");
}

// Global safety net: prevent Mongoose from auto-generating ObjectId _id fields.
// Every schema must declare its own string _id with a custom default generator.
mongoose.set("id", false);

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

/**
 * Returns the native MongoDB Db instance from the live MongoClient.
 * Using getClient().db() is resilient to Atlas replica set failovers
 * because the MongoClient manages the connection pool internally.
 * This avoids the stale-snapshot problem with mongoose.connection.db.
 */
export function getDb(): Db {
  const client = mongoose.connection.getClient();
  if (!client) {
    throw new Error(
      "[DB] MongoClient is not available. Ensure connectDB() has been awaited before calling getDb()."
    );
  }
  return client.db();
}

export { mongoose };
