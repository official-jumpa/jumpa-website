import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If there is a session and they are on the onboarding page or homepage ("/"), redirect to home
  if (session && (request.nextUrl.pathname.startsWith("/onboarding") || request.nextUrl.pathname === "/")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  
  // If no session and trying to hit protected routes like /home, go to /onboarding
  if (!session && request.nextUrl.pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home(.*)", "/dashboard(.*)", "/setup-pin", "/onboarding(.*)", "/onboarding"],
};
