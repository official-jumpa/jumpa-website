import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // If no session and trying to hit /home, go to /onboarding
    if (!session && request.nextUrl.pathname.startsWith("/home")) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/home(.*)", "/dashboard(.*)", "/setup-pin"],
 };
