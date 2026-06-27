"use client";
import { useEffect, useRef, useState } from "react";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";
import NumericKeyboard from "@/components/pin/NumericKeyboard";

const closeIcon = "/assets/icons/actions/close.svg";
const dropIcon = "/assets/icons/actions/drop.svg";
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
  const touchStartY = useRef(0);

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

  if (!open) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 50 && !processing) {
      onOpenChange(false);
    }
  };

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
    <div
      className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-1000 flex justify-center"
      onClick={() => !processing && onOpenChange(false)}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-105 max-w-full max-h-[90vh] bg-[#2D2D2D] rounded-t-[36.49px] flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease-out] px-6 pb-[env(safe-area-inset-bottom,24px)] pt-0 overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-center py-3 cursor-grab"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img src={dropIcon} alt="" className="w-8 h-1" />
        </div>

        <div className="flex justify-start py-2">
          <button
            className="w-9 h-9 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer hover:bg-[#2b2b2b] transition-colors duration-150"
            onClick={() => !processing && onOpenChange(false)}
            aria-label="Close"
            type="button"
            disabled={processing}
          >
            <img
              src={closeIcon}
              alt=""
              className="w-[11.72px] h-[11.72px] opacity-70"
            />
          </button>
        </div>

        <div className="flex flex-col items-center gap-6 my-5 relative">
          <h2 className="text-[15.96px] font-bold text-[#f3f3f5]">
            Enter your pin
          </h2>
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

        <div className="mt-auto pb-7.5">
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
      </div>
    </div>
  );
}
