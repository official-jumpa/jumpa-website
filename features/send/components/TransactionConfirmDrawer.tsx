import { useState } from "react";
import SheetShell from "./sheet-shell";
import { User, ArrowRight, ShieldCheck, Send } from "lucide-react";
import PinSheet from "./pin-sheet";

export type TransactionDetails = 
  | {
      type: 'transfer';
      amount: string;
      token: string;
      recipient: string;
    }
  | {
      type: 'swap';
      fromToken: string;
      toToken: string;
      fromAmount: string;
    };

type TransactionConfirmDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: TransactionDetails | null;
  onConfirm: (pin: string) => void;
  processing?: boolean;
};

export default function TransactionConfirmDrawer({
  open,
  onOpenChange,
  details,
  onConfirm,
  processing = false,
}: TransactionConfirmDrawerProps) {
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  if (!details) return null;

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setPinError("");
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleFinalConfirm = () => {
    if (pin.length === 4) {
      onConfirm(pin);
      setShowPin(false);
      setPin("");
    } else {
      setPinError("Please enter your 4-digit PIN");
    }
  };

  return (
    <>
      <SheetShell
        open={open}
        onOpenChange={onOpenChange}
        title="Confirm Transfer"
        showHandle
      >
        <div className="flex flex-col h-[520px] max-h-[85vh]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar pt-2">
            {/* Summary Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#3EC6C6]/10 flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-[#3EC6C6]" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {details.type === 'transfer' ? details.amount : details.fromAmount}{" "}
                <span className="text-[#3EC6C6]">
                  {details.type === 'transfer' ? details.token : details.fromToken}
                </span>
              </p>
              <p className="text-zinc-500 text-sm">
                {details.type === 'transfer' ? 'Immediate transfer' : `Swap to ${details.toToken}`}
              </p>
            </div>

            {/* Details List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-400">
                    {details.type === 'transfer' ? 'Recipient' : 'To'}
                  </span>
                </div>
                <span className="text-sm font-medium text-white max-w-[150px] truncate">
                  {details.type === 'transfer' ? details.recipient : details.toToken}
                </span>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#3EC6C6]" />
                  </div>
                  <span className="text-sm text-zinc-400">Network</span>
                </div>
                <span className="text-sm font-medium text-white">Flow EVM</span>
              </div>
            </div>
          </div>

          {/* Action Footer (Sticky at bottom of drawer) */}
          <div className="pt-6 pb-4 bg-[#16171d]/50 backdrop-blur-sm -mx-2 px-2 border-t border-white/5">
            <button
              type="button"
              disabled={processing}
              onClick={() => setShowPin(true)}
              className="w-full h-16 rounded-2xl bg-[#3EC6C6] text-zinc-950 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_8px_30px_rgba(62,198,198,0.3)]"
            >
              {processing ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Send</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-[10px] text-zinc-500 text-center mt-4 px-6 leading-relaxed">
              By authorizing, you are cryptographically signing this transaction to be broadcasted immediately.
            </p>
          </div>
        </div>
      </SheetShell>

      <PinSheet
        open={showPin}
        onOpenChange={setShowPin}
        pin={pin}
        error={pinError}
        onDigitPress={handleDigitPress}
        onBackspace={handleBackspace}
        onDone={handleFinalConfirm}
        processing={processing}
      />
    </>
  );
}
