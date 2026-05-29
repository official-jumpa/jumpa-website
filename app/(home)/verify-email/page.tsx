import VerifyEmailPage from "@/components/home/VerifyEmail";
import React, { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Jumpa",
  description: "Verify your email address",
};

export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex min-h-dvh items-center justify-center bg-black text-[#A1A1AA] text-sm">
          Loading…
        </div>
      }
    >
      <VerifyEmailPage />
    </Suspense>
  );
}
