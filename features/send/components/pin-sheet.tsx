"use client";
import { useEffect, useState } from "react";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";
import NumericKeyboard from "@/components/pin/NumericKeyboard";
import SheetShell from "@/features/send/components/sheet-shell";

const codeIcon = "/assets/icons/actions/code.svg";

type PinSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pin: string;
  error: string;
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  onDone: () => void;
  processing?: boolean;
};

export default function PinSheet({
  open,
  onOpenChange,
  pin,
  error,
  onDigitPress,
  onBackspace,
  onDone,
  processing = false,
}: PinSheetProps) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 800);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (pin.length === WALLET_PIN_LENGTH && !processing && !error) {
      const timer = setTimeout(() => {
        onDone();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin, processing, error, onDone]);

  // Keyboard support
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (processing) return;
      if (e.key >= "0" && e.key <= "9") {
        onDigitPress(e.key);
      } else if (e.key === "Backspace") {
        onBackspace();
      } else if (e.key === "Enter") {
        onDone();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onDigitPress, onBackspace, onDone, processing]);

  const handleKeyPress = (key: string) => {
    if (processing) return;
    if (key === "backspace") {
      onBackspace();
    } else {
      if (pin.length < WALLET_PIN_LENGTH) {
        onDigitPress(key);
      }
    }
  };

  const getDotClass = (index: number) => {
    let baseClass =
      "w-[50px] h-[50px] rounded-[9.12px] bg-[#3C3C3C] border-[1.14px] border-[#AAAAAA] flex items-center justify-center transition-all duration-200";
    if (error && pin.length === WALLET_PIN_LENGTH)
      baseClass += " !border-[#FF2524]";
    return baseClass;
  };

  return (
    <SheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Enter your pin"
      className="bg-[#2D2D2D] border-none"
    >
      <div className="flex flex-col items-center gap-6 my-5 relative">
        <div
          className={`flex gap-3 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
        >
          {Array.from({ length: WALLET_PIN_LENGTH }, (_, i) => (
            <div key={i} className={getDotClass(i)}>
              {i < pin.length && (
                <img src={codeIcon} alt="" className="w-3 h-3" />
              )}
            </div>
          ))}
        </div>
        {error && (
          <div className="absolute -bottom-8 text-[#FF2524] text-xs font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}
        {processing && (
          <div className="absolute -bottom-8 text-violet-400 text-xs font-medium animate-pulse flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            Processing...
          </div>
        )}
      </div>

      <div className="mt-auto pb-2">
        <div className="flex justify-between items-center px-[10%] pb-3 mt-10">
          <span className="font-sans text-[10px] font-normal text-[#D5D5D5] leading-3.75">
            Jumpa Secure Numeric Keypad
          </span>
          <button
            className="font-sans text-[10px] font-normal text-[#6a59ce] bg-transparent border-none cursor-pointer leading-3.75 hover:opacity-80 transition-opacity"
            onClick={() => !processing && onDone()}
            type="button"
            disabled={processing}
          >
            Done
          </button>
        </div>
        <NumericKeyboard onKeyPress={handleKeyPress} />
      </div>
    </SheetShell>
  );
}
