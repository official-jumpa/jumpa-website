"use client"
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : process.env.BETTER_AUTH_URL,
  plugins: [emailOTPClient()],
});

export const { signIn, signOut, useSession, emailOtp } = authClient;

