import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "jumpa_session";
const SESSION_SECRET = process.env.AUTH_SECRET!;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

if (!SESSION_SECRET) {
  throw new Error("AUTH_SECRET is not set");
}

const secretKey = new TextEncoder().encode(SESSION_SECRET);

export interface SessionPayload {
  address: string;
}

/** Issue a signed HS256 JWT session cookie */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey);

  const isProd = process.env.NODE_ENV === "production";

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { connectDB } from "./db";
import { Wallet } from "@/models/Wallet";

export interface SessionPayload {
  address: string;
  userId?: string;
}

/** Verify the BetterAuth session from the incoming request or headers */
export async function getSession(
  req?: NextRequest,
): Promise<SessionPayload | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.log("[Session] No BetterAuth session found");
      return null;
    }

    await connectDB();
    
    // Find the wallet associated with this session user
    const wallet = await Wallet.findOne({ userId: session.user.id });
    
    if (!wallet) {
      console.warn("[Session] No wallet linked to user:", session.user.id);
      return null;
    }

    return { 
        address: wallet.address,
        userId: session.user.id
    };
  } catch (err) {
    console.warn("[Session] Failed to retrieve BetterAuth session:", err);
    return null;
  }
}

/** Clear the session cookie */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  console.log("[Session] Session cleared");
}