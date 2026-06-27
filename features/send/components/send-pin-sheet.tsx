"use client";
import { useEffect, useRef, useState } from "react";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";

const closeIcon = "/assets/icons/actions/close.svg";
const dropIcon = "/assets/icons/actions/drop.svg";
const codeIcon = "/assets/icons/actions/code.svg";

type SendPinSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pin: string;
  error: string;
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  onDone: () => void;
  processing?: boolean;
};

export default function SendPinSheet({
  open,
  onOpenChange,
  pin,
  error,
  onDigitPress,
  onBackspace,
  onDone,
  processing = false,
}: SendPinSheetProps) {
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

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (processing) return;
      if (e.key >= "0" && e.key <= "9") {
        onDigitPress(e.key);
      } else if (e.key === "Backspace") {
        onBackspace();
      } else if (e.key === "Enter" && pin.length === WALLET_PIN_LENGTH) {
        onDone();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onDigitPress, onBackspace, onDone, processing, pin.length]);

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

  const rows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["0", "backspace"],
  ];

  return (
    <div
      className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-1000 flex justify-center"
      onClick={() => !processing && onOpenChange(false)}
      style={{ touchAction: "none" }}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-105 max-w-full bg-[#2D2D2D] rounded-t-[36.49px] flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease-out] px-6 pb-[env(safe-area-inset-bottom,24px)] pt-0 overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-center py-3 cursor-grab"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img src={dropIcon} alt="" className="w-8 h-1" />
        </div>

        <div className="flex justify-start py-2 relative">
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
            <div className="absolute -bottom-6 text-[#FF2524] text-[11px] font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          {processing && (
            <div className="absolute -bottom-6 text-[#6a59ce] text-[11px] font-medium animate-pulse flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full border border-[#6a59ce] border-t-transparent animate-spin" />
              Processing...
            </div>
          )}
        </div>

        <div className="mt-8 pb-8">
          <div className="flex justify-between items-center px-[10%] pb-4">
            <span className="font-sans text-[11px] font-normal text-[#D5D5D5]">
              Jumpa Secure Numeric Keypad
            </span>
            <button
              className="font-sans text-[11px] font-normal text-[#6a59ce] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => !processing && onDone()}
              type="button"
              disabled={processing}
            >
              Done
            </button>
          </div>

          <div className="flex flex-col gap-1 items-center">
            {rows.map((row, ri) => (
              <div
                key={ri}
                className="flex justify-center gap-1 w-full max-w-87.5 mx-auto"
              >
                {row.map((key, ki) => {
                  const isWide = key === "0";
                  const isBackspace = key === "backspace";

                  return (
                    <button
                      key={ki}
                      className={`h-13.5 rounded-lg border-none bg-[#3C3C3C] text-[#f3f3f5] text-lg font-semibold font-sans cursor-pointer flex items-center justify-center transition-all duration-100 select-none active:scale-[0.98] active:bg-[#2b2b2b] ${
                        isWide ? "w-58" : "w-28.5"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleKeyPress(key);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleKeyPress(key);
                      }}
                      aria-label={isBackspace ? "Backspace" : key}
                      type="button"
                      style={{ touchAction: "manipulation" }}
                    >
                      {isBackspace ? "x" : key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
