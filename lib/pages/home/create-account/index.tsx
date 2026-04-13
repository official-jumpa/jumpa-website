"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { walletSetup } from "@/lib/api";
import { useNavigate, useLocation } from "@/lib/pages-adapter";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";

const pinSchema = z.object({
  pin: z.string().max(WALLET_PIN_LENGTH),
});

// 1 = create PIN, 2 = confirm PIN
type Step = 1 | 2;

export default function CreateAccountForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const { phrase, action } = (location.state ?? {}) as {
    phrase?: string;
    action?: "create" | "import";
  };

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdPin, setCreatedPin] = useState("");

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
    mode: "onChange",
  });

  const currentPin = pinForm.watch("pin");

  const handleKeyPress = (key: string) => {
    if (loading) return;

    let newPin = currentPin;

    if (hasError) {
      newPin = "";
      setHasError(false);
      setErrorMessage("");
      setStep(1);
      setCreatedPin("");
    }

    if (newPin.length < WALLET_PIN_LENGTH) {
      newPin += key;
      pinForm.setValue("pin", newPin);

      if (newPin.length === WALLET_PIN_LENGTH) {
        if (step === 1) {
          setTimeout(() => {
            setCreatedPin(newPin);
            setStep(2);
            pinForm.setValue("pin", "");
          }, 300);
        } else if (step === 2) {
          if (newPin === createdPin) {
            handleWalletCreation(newPin);
          } else {
            setHasError(true);
            setErrorMessage("Does not match");
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (loading) return;
    if (hasError) {
      pinForm.setValue("pin", "");
      setHasError(false);
      setErrorMessage("");
      setStep(1);
      setCreatedPin("");
      return;
    }
    if (currentPin.length > 0) {
      pinForm.setValue("pin", currentPin.slice(0, -1));
    }
  };

  const handleWalletCreation = async (finalPin: string) => {
    if (!phrase) {
      console.error(
        "[CreateAccount] No phrase in location state — cannot create wallet",
      );
      setHasError(true);
      setErrorMessage("Missing seed phrase. Please go back and try again.");
      return;
    }

    setLoading(true);
    setHasError(false);

    // Use the unified wallet-setup endpoint (works for both email OTP and Google users)
    const res = await walletSetup(finalPin, phrase, action);

    if (res.error || !res.data) {
      console.error("[CreateAccount] Wallet creation failed:", res.error);
      setHasError(true);
      setErrorMessage(res.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Session is already active via BetterAuth (signIn.emailOtp or signIn.social)
    // No separate login call needed

    setLoading(false);
    navigate("/notifications");
  };

  return (
    <div className="flex min-h-dvh w-full flex-col justify-between overflow-y-auto bg-black py-8 text-white">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="mt-8 w-full px-6 text-left sm:mt-16">
          <h1 className="text-[28px] font-bold leading-tight sm:text-3xl">
            {step === 1
              ? `Create your ${WALLET_PIN_LENGTH}-digit passcode.`
              : `Confirm your ${WALLET_PIN_LENGTH}-digit passcode.`}
          </h1>
        </div>

        <div className="mb-4 mt-12 flex h-24 flex-col items-center justify-center">
          <div className="flex gap-2 sm:gap-3">
            {Array.from({ length: WALLET_PIN_LENGTH }, (_, index) => {
              const isFilled = index < currentPin.length;
              let dotClass = "bg-[#262626]";
              if (isFilled) {
                dotClass = hasError ? "bg-[#FF2524]" : "bg-[#6A59CE]";
              }
              return (
                <div
                  key={index}
                  className={`h-3.5 w-3.5 shrink-0 rounded-full transition-colors duration-200 sm:h-4 sm:w-4 ${loading && isFilled && !hasError ? "animate-pulse" : ""} ${dotClass}`}
                />
              );
            })}
          </div>

          <div className="mt-4 h-6">
            {hasError && (
              <span className="text-xs font-medium text-red-500">
                {errorMessage}
              </span>
            )}
            {loading && (
              <span className="animate-pulse text-xs text-[#A1A1AA]">
                Creating your wallet...
              </span>
            )}
          </div>
        </div>

        <div className="mb-8 mt-auto flex w-full flex-1 flex-col justify-end">
          <div className="grid grid-cols-3 justify-items-center gap-x-6 gap-y-4 sm:gap-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <KeypadButton
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                disabled={loading}
              >
                {num}
              </KeypadButton>
            ))}
            <div />
            <KeypadButton
              onClick={() => handleKeyPress("0")}
              disabled={loading}
            >
              0
            </KeypadButton>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || currentPin.length === 0}
              className="flex h-16 w-16 items-center justify-center rounded-full text-white transition-colors active:bg-[#333333] disabled:opacity-50 sm:h-20 sm:w-20"
            >
              <X className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KeypadButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

function KeypadButton({ children, onClick, disabled }: KeypadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1C1C1E] text-2xl font-medium text-white transition-colors active:bg-[#333333] disabled:opacity-50 sm:h-20 sm:w-20 sm:text-3xl"
    >
      {children}
    </button>
  );
}
