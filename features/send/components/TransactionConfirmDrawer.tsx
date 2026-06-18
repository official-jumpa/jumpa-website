import { useState } from "react";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";
import SheetShell from "./sheet-shell";
import { User, ArrowRight, ShieldCheck, Send } from "lucide-react";
import PinSheet from "./pin-sheet";
import { useHomeLayout } from "@/components/layouts/HomeLayout";

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
  error?: string;
};

export default function TransactionConfirmDrawer({
  open,
  onOpenChange,
  details,
  onConfirm,
  processing = false,
  error,
}: TransactionConfirmDrawerProps) {
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  let activeWallet = null;
  try {
    const layout = useHomeLayout();
    activeWallet = layout.activeWallet;
  } catch {
    // Fail-safe if loaded outside HomeLayout context
  }

  if (!details) return null;

  const handleDigitPress = (digit: string) => {
    if (pin.length < WALLET_PIN_LENGTH) {
      setPin((prev) => prev + digit);
      setPinError("");
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleFinalConfirm = () => {
    if (pin.length === WALLET_PIN_LENGTH) {
      onConfirm(pin);
      setShowPin(false);
      setPin("");
    } else {
      setPinError(`Please enter your ${WALLET_PIN_LENGTH}-digit PIN`);
    }
  };

  const tokenSymbol = (details.type === 'transfer' ? details.token : details.fromToken).toUpperCase();
  const networkLabel = tokenSymbol.includes('SOL-DEV')
    ? 'Solana Devnet'
    : tokenSymbol.includes('SOL')
    ? 'Solana Mainnet'
    : tokenSymbol.includes('ETH-SEP') || tokenSymbol.includes('USDC-SEP') || tokenSymbol.includes('USDT-SEP')
    ? 'Base Sepolia'
    : tokenSymbol.includes('BASE') || tokenSymbol.includes('ETH')
    ? 'Base Mainnet'
    : tokenSymbol.includes('XLM-TEST') || tokenSymbol.includes('USDC-XLM-TEST')
    ? 'Stellar Testnet'
    : tokenSymbol.includes('XLM') || tokenSymbol.includes('USDC-XLM')
    ? 'Stellar Mainnet'
    : 'Multi-Chain';

  const isSwap = details.type === 'swap';

  const getFromAddress = () => {
    if (!activeWallet) return "Loading...";
    const tSymbol = tokenSymbol.toUpperCase();
    if (tSymbol.includes("SOL")) return activeWallet.addresses?.sol || activeWallet.address;
    if (tSymbol.includes("XLM")) return activeWallet.addresses?.xlm || activeWallet.address;
    return activeWallet.addresses?.base || activeWallet.addresses?.eth || activeWallet.address;
  };
  const fromAddress = getFromAddress();
  const truncatedFrom = fromAddress && fromAddress !== "Loading..."
    ? `${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}`
    : fromAddress;

  return (
    <>
      <SheetShell
        open={open}
        onOpenChange={onOpenChange}
        title={isSwap ? "Confirm Swap" : "Confirm Transfer"}
        showHandle
      >
        <div className="flex flex-col h-[520px] max-h-[85vh]">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar pt-2">
            
            {isSwap ? (
              /* Swap Summary Card */
              <div className="relative overflow-hidden bg-gradient-to-b from-[#1c1c24]/90 to-[#121217]/90 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col text-left">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Pay</span>
                    <span className="text-2xl font-bold text-white">
                      {details.fromAmount} <span className="text-purple-400 text-lg font-bold">{details.fromToken}</span>
                    </span>
                  </div>
                  
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  
                  <div className="flex flex-col text-right">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Receive</span>
                    <span className="text-2xl font-bold text-white">
                      {details.toToken}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Transfer Summary Card */
              <div className="relative overflow-hidden bg-gradient-to-b from-[#1c1c24]/90 to-[#121217]/90 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                  <Send className="w-5 h-5" />
                </div>
                <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1">Amount to Send</p>
                <p className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                  {details.amount}{" "}
                  <span className="text-purple-400 font-bold">{details.token}</span>
                </p>
                <div className="px-2.5 py-0.5 rounded-full bg-zinc-900/60 border border-white/5 text-zinc-500 text-[10px] font-semibold">
                  Immediate Transfer
                </div>
              </div>
            )}

            {/* Details List */}
            <div className="bg-[#121216]/60 border border-white/5 rounded-2xl p-4 space-y-4">
              {/* From Row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/80 flex items-center justify-center border border-white/5 text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-zinc-400">From</span>
                </div>
                <span className="font-mono text-[11px] text-zinc-300 bg-black/40 border border-white/5 px-2.5 py-1.5 rounded-lg select-all text-right leading-tight max-w-[190px]">
                  {truncatedFrom}
                </span>
              </div>

              {/* Recipient Row */}
              <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/80 flex items-center justify-center border border-white/5 text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-zinc-400">
                    {details.type === 'transfer' ? 'Recipient' : 'To'}
                  </span>
                </div>
                {details.type === 'transfer' ? (
                  <span className="font-mono text-[11px] text-zinc-300 bg-black/40 border border-white/5 px-2.5 py-1.5 rounded-lg select-all break-all text-right leading-tight max-w-[190px]">
                    {details.recipient}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {details.toToken}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800/80 flex items-center justify-center border border-white/5 text-zinc-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-zinc-400">Network</span>
                </div>
                <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md border ${
                networkLabel.includes('Solana') 
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                  : networkLabel.includes('Stellar')
                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                  : networkLabel.includes('Base')
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                  : 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
              }`}>
                  {networkLabel}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-[#ef4444] text-center font-medium animate-[fadeIn_0.15s_ease_forwards] wrap-break-word">
                {error}
              </div>
            )}
          </div>

          {/* Action Footer (Sticky at bottom of drawer) */}
          <div className="pt-5 pb-4 bg-[#0f0f10] -mx-4 px-4 border-t border-white/5">
            <button
              type="button"
              disabled={processing}
              onClick={() => setShowPin(true)}
              className="w-full h-14 rounded-xl bg-[#A855F7] hover:bg-[#b56ef8] text-black font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(168,85,247,0.25)]"
            >
              {processing ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Send</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-[10px] text-zinc-500 text-center mt-3.5 px-6 leading-relaxed">
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
