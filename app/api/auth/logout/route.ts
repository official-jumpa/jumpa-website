import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

/** POST /api/auth/logout — clears the session cookie */
export async function POST() {
  await clearSession();
  return NextResponse.json({ message: "Logged out" });
}
