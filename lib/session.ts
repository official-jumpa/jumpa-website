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

/** Verify the JWT session from the incoming request */
export async function getSession(
  req: NextRequest,
): Promise<SessionPayload | null> {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ??
    req.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];

  if (!token) {
    console.log("[Session] No session cookie found");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch (err) {
    console.warn("[Session] Invalid or expired session token:", err);
    return null;
  }
}

/** Clear the session cookie */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  console.log("[Session] Session cleared");
}