"use client"
import { useEffect } from "react";
import { Delete } from "lucide-react";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";
import SheetShell from "./sheet-shell";

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
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  // Keyboard support
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (processing) return; // Disable keyboard while processing
      
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
  }, [open, onDigitPress, onBackspace, onDone]);

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title="Enter your pin" showHandle>
      <div className="space-y-6 pb-3">
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: WALLET_PIN_LENGTH }, (_, index) => (
            <div
              key={index}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all sm:h-14 sm:w-14 ${
                pin.length === index
                  ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  : "border-zinc-700 bg-zinc-800/50"
              }`}
            >
              {pin.length > index ? (
                <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] sm:h-4 sm:w-4" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500 px-1">
            <span className="select-text">Jumpa Secure Numeric Keypad</span>
            <button
              type="button"
              onClick={onDone}
              className="text-violet-400 transition hover:text-violet-300"
            >
              Done
            </button>
          </div>

          {error ? (
            <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-center text-sm font-medium text-red-400 select-text">
                {error}
              </p>
            </div>
          ) : processing ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-500/10 p-3 animate-pulse">
              <div className="h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-violet-400">Broadcasting to network...</p>
            </div>
          ) : (
            <div className="h-[46px] invisible" /> // Maintain height
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {numbers.map((number) => (
            <button
              key={number}
              type="button"
              disabled={processing}
              onClick={() => onDigitPress(number)}
              className="h-16 rounded-2xl bg-zinc-800 text-2xl font-semibold text-white transition-all active:scale-95 enabled:active:bg-zinc-700 enabled:hover:bg-zinc-750 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {number}
            </button>
          ))}
          <div /> 
          <button
            type="button"
            disabled={processing}
            onClick={() => onDigitPress("0")}
            className="h-16 rounded-2xl bg-zinc-800 text-2xl font-semibold text-white transition-all active:scale-95 enabled:active:bg-zinc-700 enabled:hover:bg-zinc-750 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            0
          </button>
          <button
            type="button"
            disabled={processing}
            onClick={onBackspace}
            className="flex items-center justify-center h-16 rounded-2xl bg-zinc-800 text-white transition-all active:scale-95 enabled:active:bg-zinc-700 enabled:hover:bg-zinc-750 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete last digit"
          >
            <Delete className="h-7 w-7" />
          </button>
        </div>

        <div className="pt-4 pb-2">
          <button
            type="button"
            disabled={pin.length !== WALLET_PIN_LENGTH || processing}
            onClick={onDone}
            className="w-full h-16 rounded-2xl bg-[#3EC6C6] text-zinc-950 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 shadow-[0_8px_30px_rgba(62,198,198,0.2)]"
          >
            {processing ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Confirm & Send Payment</span>
            )}
          </button>
        </div>
      </div>
    </SheetShell>
  );
}
