import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";

/** POST /api/auth/logout — signs out the BetterAuth session */
export async function POST() {
  try {
    // Sign out via BetterAuth
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (err) {
    console.warn("[Logout] BetterAuth signOut error:", err);
  }

  // clear legacy cookie if present
  const cookieStore = await cookies();
  cookieStore.delete("jumpa_session");

  return NextResponse.json({ message: "Logged out" });
}
