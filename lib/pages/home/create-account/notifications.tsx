"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const goHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  const handleEnable = async () => {
    setBusy(true);
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "denied") {
          console.info("[Notifications] Permission denied by user or browser");
        }
      }
    } catch (e) {
      console.warn("[Notifications] requestPermission failed:", e);
    } finally {
      setBusy(false);
      goHome();
    }
  };

  const handleSkip = () => {
    goHome();
  };

  return (
    <div className="fixed inset-0 flex h-dvh w-full flex-col bg-black px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center -mt-12">
        <img src="/notifications.svg" alt="" />
        <h1 className="mb-4 text-3xl font-bold tracking-tight">
          Enable notifications
        </h1>
        <p className="px-2 text-[15px] leading-relaxed text-[#A1A1AA] sm:px-4">
          Get personalized notifications for transactions, account changes, and
          security alerts.
        </p>
      </div>

      <div className="mx-auto mt-auto flex w-full max-w-md flex-col gap-4 pb-6">
        <Button
          type="button"
          onClick={handleEnable}
          disabled={busy}
          className="h-14 w-full rounded-xl border-none bg-[#8B5CF6] font-semibold text-base text-white shadow-none transition-colors hover:bg-[#7C3AED]"
        >
          {busy ? "Please wait…" : "Enable notification"}
        </Button>

        <Button
          type="button"
          onClick={handleSkip}
          disabled={busy}
          variant="outline"
          className="h-14 w-full rounded-xl border border-[#333333] bg-transparent font-semibold text-base text-white shadow-none transition-colors hover:bg-[#1C1C1E] hover:text-white"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
