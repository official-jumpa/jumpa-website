import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { NextRequest } from "next/server";
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
    await connectDB();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.log("[Session] No BetterAuth session found");
      return null;
    }

    
    // Find the wallet associated with this session user
    const wallet = await Wallet.findOne({ userId: session.user.id });
    
    if (!wallet) {
      console.warn("[Session] No wallet linked to user:", session.user.id);
      // Return userId even without wallet — needed for wallet-setup flow
      return { address: "", userId: session.user.id };
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
  // Clear legacy cookie if present
  cookieStore.delete("jumpa_session");
  // BetterAuth session cookies are managed by the framework;
  // actual sign-out should use auth.api.signOut or the /api/auth/sign-out endpoint
  console.log("[Session] Session cleared");
}