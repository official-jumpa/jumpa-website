"use client"
import { useState } from "react";
// Removed react-router imports - using Next.js router instead
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Eye, EyeOff } from "lucide-react";
import { saveWallet, login } from "@/lib/api";
import { deriveAddresses } from "@/lib/wallet";
import { useNavigate, useLocation } from "@/lib/pages-adapter";

// --- ZOD SCHEMAS ---
const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const pinSchema = z.object({
  pin: z.string().max(4),
});

// Steps: 1 = password entry, 2 = create PIN, 3 = confirm PIN
type Step = 1 | 2 | 3;

export default function CreateAccountForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Phrase and action passed from previous step via adapter state (sessionStorage fallback)
  const { phrase, action } = (location.state ?? {}) as { phrase?: string; action?: "create" | "import" };

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedPassword, setSavedPassword] = useState("");
  const [createdPin, setCreatedPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  const currentPin = pinForm.watch("pin");

  const handlePasswordSubmit = passwordForm.handleSubmit((data) => {
    setSavedPassword(data.password);
    setStep(2);
  });

  // --- STEPS 2/3: PIN keypad logic ---
  const handleKeyPress = (key: string) => {
    if (loading) return;

    let newPin = currentPin;

    if (hasError) {
      newPin = "";
      setHasError(false);
      setErrorMessage("");
      setStep(2);
      setCreatedPin("");
    }

    if (newPin.length < 4) {
      newPin += key;
      pinForm.setValue("pin", newPin);

      if (newPin.length === 4) {
        if (step === 2) {
          setTimeout(() => {
            setCreatedPin(newPin);
            setStep(3);
            pinForm.setValue("pin", "");
          }, 300);
        } else if (step === 3) {
          if (newPin === createdPin) {
            handleWalletCreation(newPin);
          } else {
            console.warn("[CreateAccount] PIN mismatch");
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
      setStep(2);
      setCreatedPin("");
      return;
    }
    if (currentPin.length > 0) {
      pinForm.setValue("pin", currentPin.slice(0, -1));
    }
  };

  // --- Final API call ---
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

    const res = await saveWallet(action ?? "create", {
      phrase,
      password: savedPassword,
      pin: finalPin,
    });

    if (res.error || !res.data) {
      console.error("[CreateAccount] Wallet creation failed:", res.error);
      setHasError(true);
      setErrorMessage(res.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // TODO: Implement local wallet storage if needed
    // saveWalletLocally({
    //     address: res.data.address,
    //     addresses: res.data.addresses,
    // });
    const loginRes = await login(res.data.address, savedPassword);
    if (loginRes.error) {
      console.warn(
        "[CreateAccount] Auto-login failed (user will need to log in manually):",
        loginRes.error,
      );
    }

    setLoading(false);
    navigate("/notifications");
  };

  // --- RENDER: Step 1 — Password ---
  if (step === 1) {
    return (
      <div className="min-h-dvh w-full bg-black text-white flex flex-col justify-start py-8 px-6 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto flex flex-col mt-8 sm:mt-16 gap-6">
          <h1 className="text-[28px] sm:text-3xl font-bold leading-tight">
            Create a password.
          </h1>
          <p className="text-[#A1A1AA] text-sm -mt-2">
            This encrypts your wallet. You'll need it on this device to access
            your funds.
          </p>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            {/* Password field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 characters)"
                {...passwordForm.register("password")}
                className="w-full h-14 bg-[#1C1C1E] border border-[#333333] rounded-xl px-4 pr-12 text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#8B5CF6] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.password && (
              <p className="text-red-400 text-xs -mt-2">
                {passwordForm.formState.errors.password.message}
              </p>
            )}

            {/* Confirm password field */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                {...passwordForm.register("confirmPassword")}
                className="w-full h-14 bg-[#1C1C1E] border border-[#333333] rounded-xl px-4 pr-12 text-white placeholder:text-[#52525B] focus:outline-none focus:border-[#8B5CF6] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-red-400 text-xs -mt-2">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-14 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-base transition-colors mt-2"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: Steps 2 & 3 — PIN ---
  return (
    <div className="min-h-dvh w-full bg-black text-white flex flex-col justify-between py-8 overflow-y-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
        {/* Header */}
        <div className="mt-8 sm:mt-16 w-full px-6 text-left">
          <h1 className="text-[28px] sm:text-3xl font-bold leading-tight">
            {step === 2
              ? "Create your 4-digit passcode."
              : "Confirm your 4-digit passcode."}
          </h1>
        </div>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center justify-center mt-12 mb-4 h-24">
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < currentPin.length;
              let dotClass = "bg-[#262626]";
              if (isFilled) {
                if (hasError) dotClass = "bg-red-500";
                else dotClass = "bg-[#8B5CF6]";
              }
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-colors duration-200 ${loading && isFilled && !hasError ? "animate-pulse" : ""} ${dotClass}`}
                />
              );
            })}
          </div>

          <div className="h-6 mt-4">
            {hasError && (
              <span className="text-red-500 text-xs font-medium">
                {errorMessage}
              </span>
            )}
            {loading && (
              <span className="text-[#A1A1AA] text-xs animate-pulse">
                Creating your wallet...
              </span>
            )}
          </div>
        </div>

        {/* Keypad */}
        <div className="w-full mt-auto mb-8 flex-1 flex flex-col justify-end">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 sm:gap-y-6 justify-items-center">
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
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white active:bg-[#333333] transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Keypad Button ---
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
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1C1C1E] text-white text-2xl sm:text-3xl flex items-center justify-center active:bg-[#333333] transition-colors disabled:opacity-50 font-medium"
    >
      {children}
    </button>
  );
}
