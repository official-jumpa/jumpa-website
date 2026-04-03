import SaveRecoveryPhrase from "@/lib/pages/home/create-account/save-recovery";
import React, { Suspense } from "react";

export default function SaveRecoveryPage() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="fixed inset-0 flex min-h-dvh items-center justify-center bg-[#050505] text-[#A1A1AA] text-sm">
            Loading…
          </div>
        }
      >
        <SaveRecoveryPhrase />
      </Suspense>
    </div>
  );
}