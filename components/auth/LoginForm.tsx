"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, ChevronRight, Lock } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { getMe, verifyPin } from "@/lib/api";
import { getStoredWallet, saveWalletLocally } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";

/**
 * Login screen — PIN-based unlock for returning users.
 *
 * Auth is now managed by BetterAuth sessions (email OTP or Google).
 * - If NO session → redirect to /onboarding (to get OTP/Google sign-in)
 * - If session EXISTS → show PIN input to "unlock" the wallet
 */
export default function LoginForm() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [checkingWallet, setCheckingWallet] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const storedWallet = getStoredWallet();

  useEffect(() => {
    if (isPending) return;

    // 1. No BetterAuth session? They need to sign in first (OTP/Google)
    if (!session) {
      router.replace("/onboarding");
      return;
    }

    // 2. Session exists — check if user already has a wallet
    getMe()
      .then((res) => {
        if (res.data && res.data.address) {
          // User has a wallet — proceed to PIN unlock UI
          saveWalletLocally({
            address: res.data.address,
            addresses: res.data.addresses,
          });
          setCheckingWallet(false);
        } else {
          // Session exists but no wallet on server → go to setup
          router.replace("/setup-pin");
        }
      })
      .catch((err) => {
        console.error("[Login] Failed to check wallet status:", err);
        router.replace("/onboarding");
      });
  }, [isPending, session, router, storedWallet]);

  const handleNumberClick = (num: string) => {
    if (error) setError(null);
    if (pin.length < WALLET_PIN_LENGTH) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === WALLET_PIN_LENGTH) {
        setTimeout(() => handleUnlock(newPin), 200);
      }
    }
  };

  const handleUnlock = async (p: string) => {
    setIsUnlocking(true);
    setError(null);
    try {
      const res = await verifyPin(p);
      if (res.data?.valid) {
        router.push("/home");
      } else {
        setError(res.error || "Incorrect PIN");
        setPin("");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      setPin("");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const renderDots = () => {
    const errorHighlightsDots = !!error && pin.length === 0; // if reset after error
    return (
      <div className="flex justify-center gap-3 mb-4">
        {Array.from({ length: WALLET_PIN_LENGTH }, (_, i) => {
          const filled = pin.length > i;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: filled ? 1.2 : 1,
                backgroundColor: error ? "#FF2524" : filled ? "#6A59CE" : "#262626",
              }}
              className="h-3.5 w-3.5 rounded-full border border-[#333]"
            />
          );
        })}
      </div>
    );
  };

  if (isPending || checkingWallet) {
    return (
      <div className="min-h-dvh w-full bg-[#050505] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const displayAddress = storedWallet
    ? `${storedWallet.address.slice(0, 10)}...${storedWallet.address.slice(-6)}`
    : "";

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center px-6 pt-12 pb-8 overflow-hidden">
      <div className="w-full max-w-md flex flex-col h-full bg-[#050505]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#18181B] rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
            <Lock className="w-8 h-8 text-[#6A59CE]" />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome back!</h1>
          <p className="text-[#A1A1AA] text-sm mb-1 text-center font-medium">
            Unlock your wallet to continue
          </p>
          {displayAddress && (
            <p className="text-[#52525B] text-xs font-mono bg-[#18181B] px-3 py-1 rounded-full border border-white/5">
              {displayAddress}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="pin-display"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              {renderDots()}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-medium mt-2"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-auto w-full">
          <div className="grid grid-cols-3 gap-y-4 gap-x-8 w-full mb-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 text-2xl font-semibold flex items-center justify-center hover:bg-white/5 rounded-full active:scale-90 transition-all"
              >
                {num}
              </button>
            ))}
            <div className="empty" />
            <button
              onClick={() => handleNumberClick("0")}
              className="h-16 text-2xl font-semibold flex items-center justify-center hover:bg-white/5 rounded-full active:scale-90 transition-all"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-16 flex items-center justify-center hover:bg-white/5 rounded-full active:scale-90 transition-all text-[#A1A1AA]"
            >
              <Delete className="w-7 h-7" />
            </button>
          </div>

          <Button
            disabled={pin.length !== WALLET_PIN_LENGTH || isUnlocking}
            onClick={() => handleUnlock(pin)}
            className={`w-full h-14 rounded-2xl font-bold text-lg transition-all shadow-2xl flex items-center justify-center gap-2
              ${
                pin.length === WALLET_PIN_LENGTH && !isUnlocking
                  ? "bg-[#6A59CE] text-white hover:bg-[#5c4ec0]"
                  : "bg-[#18181B] text-[#52525B] opacity-50"
              }`}
          >
            {isUnlocking ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Unlock wallet
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
          
          <button 
            onClick={() => router.push("/onboarding")}
            className="w-full mt-6 text-[#A1A1AA] text-sm font-medium hover:text-white transition-colors"
          >
            Not your wallet? Switch account
          </button>
        </div>
      </div>
    </div>
  );
}