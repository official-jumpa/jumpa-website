import SaveRecoveryPhrase from "@/components/home/SaveRecovery";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Save Recovery Phrase | Jumpa",
  description: "Securely backup your Jumpa recovery phrase",
};

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