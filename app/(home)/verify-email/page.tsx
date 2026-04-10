import VerifyEmailPage from "@/lib/pages/home/create-account/verify-email";
import React, { Suspense } from "react";

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
