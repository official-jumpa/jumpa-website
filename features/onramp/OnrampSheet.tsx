import { useState, useEffect } from "react";
import SheetShell from "@/features/send/components/sheet-shell";
import { Copy, Wallet, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

type QuoteData = {
  rate: number;
  source?: {
    amount: number;
    currency: string;
  };
  destination: {
    amount: number;
    currency: string;
  };
};

type DepositData = {
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_number: string;
  note: string[];
};

type OnrampSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount?: string;
  defaultToken?: string;
  defaultCurrency?: string;
};

export default function OnrampSheet({ open, onOpenChange, defaultAmount, defaultToken, defaultCurrency }: OnrampSheetProps) {
  const [fiatAmount, setFiatAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [activeInput, setActiveInput] = useState<"fiat" | "crypto">("fiat");
  const [asset, setAsset] = useState(defaultToken || "solana:usdc");
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const [initiating, setInitiating] = useState(false);
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  const [initError, setInitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchQuote = async (amount: string, selectedAsset: string, isExactOut: boolean) => {
    if (!amount || isNaN(Number(amount))) return;
    setFetchingQuote(true);
    setQuoteError("");
    try {
      const res = await fetch("/api/onramp/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), asset: selectedAsset, exact_output: isExactOut }),
      });
      const data = await res.json();
      if (data.success) {
        setQuote(data.data);
        if (isExactOut) {
          if (data.data.source?.amount) {
            setFiatAmount(String(data.data.source.amount));
          } else {
            // Rate fallback inference if exact_out source isn't provided natively
            const inferredFiat = Number(amount) * data.data.rate;
            setFiatAmount(String(inferredFiat));
          }
        } else {
          setCryptoAmount(String(data.data.destination.amount));
        }
      } else {
        setQuoteError(data.error || "Failed to fetch quote");
        if (isExactOut) setFiatAmount(""); else setCryptoAmount("");
      }
    } catch (err) {
      setQuoteError("Network error. Could not fetch quote.");
    } finally {
      setFetchingQuote(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setFiatAmount("");
      setCryptoAmount("");
      setActiveInput("fiat");
      setAsset(defaultToken || "solana:usdc");
      setQuote(null);
      setDepositData(null);
      setQuoteError("");
      setInitError("");
      setShowSuccess(false);
    } else {
      if (defaultAmount) {
        if (defaultCurrency && defaultCurrency !== "NGN") {
          setActiveInput("crypto");
          setCryptoAmount(defaultAmount);
          fetchQuote(defaultAmount, defaultToken || "solana:usdc", true);
        } else {
          setActiveInput("fiat");
          setFiatAmount(defaultAmount);
          fetchQuote(defaultAmount, defaultToken || "solana:usdc", false);
        }
      }
    }
  }, [open, defaultAmount, defaultToken, defaultCurrency]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeInput === "fiat" && fiatAmount) fetchQuote(fiatAmount, asset, false);
      if (activeInput === "crypto" && cryptoAmount) fetchQuote(cryptoAmount, asset, true);
    }, 800);
    return () => clearTimeout(timer);
  }, [fiatAmount, cryptoAmount, asset, activeInput]);

  const handleInitiate = async () => {
    if (!quote || (!fiatAmount && !cryptoAmount)) return;
    setInitiating(true);
    setInitError("");
    try {
      const payloadAmount = activeInput === "crypto" ? Number(cryptoAmount) : Number(fiatAmount);
      const res = await fetch("/api/onramp/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: payloadAmount, 
          asset,
          exact_output: activeInput === "crypto"
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.deposit) {
        setDepositData(data.data.deposit);
      } else {
        setInitError(data.error || "Failed to initiate transaction");
      }
    } catch (err) {
      setInitError("Network error occurred.");
    } finally {
      setInitiating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title="Complete Payment">
      <div className="flex flex-col h-[520px] max-h-[85vh]">
        {!depositData ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-6 px-1 custom-scrollbar pt-2">
              <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-400">You Pay (NGN)</label>
              <input
                type="number"
                disabled={initiating}
                value={fiatAmount}
                onChange={(e) => { setActiveInput("fiat"); setFiatAmount(e.target.value); }}
                placeholder="Enter Naira amount e.g 50000"
                className="w-full text-2xl font-bold bg-transparent border-b-2 border-zinc-800 pb-2 text-white outline-none focus:border-violet-500 transition-colors"
              />

              <div className="flex justify-between items-center mt-4">
                <label className="text-sm font-medium text-zinc-400">You Receive</label>
                <select
                  disabled={initiating}
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs font-medium rounded-lg outline-none px-3 py-1.5 focus:border-violet-500"
                >
                  <option value="solana:usdc">USDC (Solana)</option>
                  <option value="solana:usdt">USDT (Solana)</option>
                  <option value="base:usdc">USDC (Base)</option>
                  <option value="base:cngn">cNGN (Base)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 border-b-2 border-zinc-800 focus-within:border-violet-500 transition-colors pb-2">
                <input
                  type="number"
                  disabled={initiating}
                  value={cryptoAmount}
                  onChange={(e) => { setActiveInput("crypto"); setCryptoAmount(e.target.value); }}
                  placeholder="Enter Crypto amount e.g 20"
                  className="w-full text-2xl font-bold bg-transparent text-white outline-none"
                />
                <span className="text-zinc-500 font-bold">{asset.split(':')[1]?.toUpperCase()}</span>
              </div>
            </div>

            {fetchingQuote ? (
              <div className="flex items-center gap-2 text-zinc-500 justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Fetching best quote...</span>
              </div>
            ) : quoteError ? (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20 text-center">
                {quoteError}
              </div>
            ) : quote ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Exchange Rate</span>
                  <span className="text-white font-medium">1 USD ≈ ₦{quote.rate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">You Receive</span>
                  <span className="text-violet-400 font-bold text-lg">
                    {quote.destination.amount} {quote.destination.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Settlement Time</span>
                  <span className="font-medium text-emerald-400">Instant</span>
                </div>
              </div>
            ) : null}

            {initError && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm text-center border border-red-500/20">
                {initError}
              </div>
            )}

            </div>

            <div className="pt-4 pb-4 bg-[#16171d]/50 backdrop-blur-sm px-1 border-t border-white/5 mt-auto shrink-0">
              <button
                disabled={!quote || initiating || fetchingQuote || (!fiatAmount && !cryptoAmount)}
                onClick={handleInitiate}
                className="w-full h-[60px] rounded-2xl bg-violet-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-violet-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
              >
                {initiating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                {initiating ? "Processing..." : ` Pay ₦${fiatAmount}`}
              </button>
            </div>
          </>
        ) : !showSuccess ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-6 px-1 custom-scrollbar pt-2">
              <button 
                onClick={() => { setDepositData(null); setInitError(''); }}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-0 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Bank Transfer</h3>
                <p className="text-zinc-400 text-sm">Transfer exactly <strong className="text-white">₦{Number(fiatAmount).toLocaleString()}</strong> to the account below</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 mb-6">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Bank Name</p>
                  <p className="text-white font-medium">{depositData.bank_name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Account Name</p>
                  <p className="text-white font-medium uppercase">{depositData.account_name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Account Number</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-violet-400 tracking-wider flex-1 shrink min-w-0 pr-4">{depositData.account_number}</p>
                    <button onClick={() => copyToClipboard(depositData.account_number)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl shrink-0 transition-colors">
                      <Copy className="w-4 h-4 text-violet-400" />
                    </button>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Important Notes</p>
                  <ul className="list-disc list-inside text-xs text-white/70 space-y-1">
                    {/* {depositData.note?.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))} */}
                    <li>Send the exact amount to the bank account provided above, including the decimal part. The account expires in 30 minutes and can only be used once</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 pt-4 pb-4 bg-[#16171d]/50 backdrop-blur-sm px-1 border-t border-white/5 mt-auto shrink-0">
              <button
                onClick={() => setShowSuccess(true)}
                className="w-full h-[60px] rounded-2xl bg-zinc-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
              >
                I have made the transfer
              </button>
              <p className="text-zinc-500 text-xs text-center mt-4 px-4">
                Your asset will be delivered automatically to your wallet once the transfer is confirmed.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Transfer Pending</h3>
            <p className="text-zinc-400 leading-relaxed max-w-[280px]">
              We are checking the status of your transaction. Your balance will be updated within a few seconds once the transaction is confirmed
            </p>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-10 w-full h-14 rounded-2xl bg-violet-500 text-white font-bold hover:bg-violet-400 transition-all active:scale-95 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </SheetShell>
  );
}
