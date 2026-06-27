import { useState, useEffect } from "react";
import SheetShell from "@/features/send/components/sheet-shell";
import PinSheet from "@/features/send/components/pin-sheet";
import { ArrowLeft, ArrowRight, Loader2, Landmark, CheckCircle2, AlertCircle } from "lucide-react";
import { SwitchBanks } from "@/lib/SwitchBanks";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";

type QuoteData = {
  rate: number;
  destination: { amount: number; currency: string };
  source?: { amount: number; currency: string };
};

type OfframpSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount?: string;
  defaultToken?: string;
  defaultCurrency?: string;
  defaultBankCode?: string;
  defaultAccountNumber?: string;
  defaultAccountName?: string;
  onBeneficiaryChange?: (bankCode: string, accountNumber: string, accountName: string) => void;
};

export default function OfframpSheet({ 
  open, 
  onOpenChange, 
  defaultAmount, 
  defaultToken,
  defaultCurrency,
  defaultBankCode,
  defaultAccountNumber,
  defaultAccountName,
  onBeneficiaryChange
}: OfframpSheetProps) {
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("solana:usdc");
  
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [resolveError, setResolveError] = useState("");

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [initiating, setInitiating] = useState(false);
  const [initError, setInitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [txReference, setTxReference] = useState("");
  const [pollingStatus, setPollingStatus] = useState("PROCESSING");

  const isExactOutput = defaultCurrency === "NGN";

  useEffect(() => {
    if (!open) {
      setAmount("");
      setBankCode("");
      setAccountNumber("");
      setResolvedAccountName("");
      setResolvingAccount(false);
      setResolveError("");
      setQuote(null);
      setQuoteError("");
      setInitError("");
      setShowSuccess(false);
      setShowPin(false);
      setPin("");
      setTxReference("");
      setPollingStatus("PROCESSING");
    } else {
      setAmount(defaultAmount || "");
      setAsset(defaultToken || "solana:usdc");
      setBankCode(defaultBankCode || "");
      setAccountNumber(defaultAccountNumber || "");
      setResolvedAccountName(defaultAccountName || "");
      setResolvingAccount(false);
      setResolveError("");
    }
  }, [open, defaultAmount, defaultToken, defaultBankCode, defaultAccountNumber, defaultAccountName]);

  useEffect(() => {
    if (bankCode && accountNumber.length === 10) {
      if (bankCode === defaultBankCode && accountNumber === defaultAccountNumber && defaultAccountName) {
        setResolvedAccountName(defaultAccountName);
        setResolveError("");
        return;
      }

      let active = true;
      const resolve = async () => {
        setResolvingAccount(true);
        setResolveError("");
        setResolvedAccountName("");
        try {
          const res = await fetch("/api/offramp/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bankCode, accountNumber }),
          });
          const data = await res.json();
          if (!active) return;
          if (data.success && data.accountName) {
            setResolvedAccountName(data.accountName);
            onBeneficiaryChange?.(bankCode, accountNumber, data.accountName);
          } else {
            setResolveError(data.error || "Could not resolve account name");
            onBeneficiaryChange?.(bankCode, accountNumber, "");
          }
        } catch (err) {
          if (!active) return;
          setResolveError("Verification failed");
          onBeneficiaryChange?.(bankCode, accountNumber, "");
        } finally {
          if (active) setResolvingAccount(false);
        }
      };

      const timer = setTimeout(() => {
        resolve();
      }, 500);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setResolvedAccountName("");
      setResolveError("");
    }
  }, [bankCode, accountNumber, defaultBankCode, defaultAccountNumber, defaultAccountName]);

  const fetchQuote = async (val: string) => {
    if (!val || isNaN(Number(val))) return;
    setFetchingQuote(true);
    setQuoteError("");
    try {
      const res = await fetch("/api/offramp/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(val), asset, exact_output: isExactOutput }),
      });
      const data = await res.json();
      if (data.success) {
        setQuote(data.data);
      } else {
        setQuoteError(data.error || "Failed to fetch quote");
      }
    } catch (err) {
      setQuoteError("Network error fetching quote.");
    } finally {
      setFetchingQuote(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount) fetchQuote(amount);
    }, 500);
    return () => clearTimeout(timer);
  }, [amount, asset]);

  const handleDigitPress = (digit: string) => {
    if (pin.length < WALLET_PIN_LENGTH) {
      setPin((prev) => prev + digit);
      setPinError("");
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleFinalConfirm = async () => {
    if (pin.length !== WALLET_PIN_LENGTH) {
      setPinError(`Please enter your ${WALLET_PIN_LENGTH}-digit PIN`);
      return;
    }

    setInitiating(true);
    setInitError("");
    setShowPin(false);
    // Clear PIN immediately to prevent PinSheet auto-submit from re-triggering
    // if the PinSheet is re-opened before the state settles
    setPin("");

    try {
      const res = await fetch("/api/offramp/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          asset,
          beneficiary: {
            holder_type: "INDIVIDUAL",
            holder_name: resolvedAccountName || defaultAccountName || "Jumpa",
            account_number: accountNumber,
            bank_code: bankCode
          },
          pin,
          exact_output: isExactOutput
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTxReference(data.reference);
        setShowSuccess(true);
      } else {
        setInitError(data.error || "Failed to initiate transfer");
      }
    } catch (err) {
      setInitError("Network error. Transfer failed.");
    } finally {
      setInitiating(false);
    }
  };

  useEffect(() => {
    if (!showSuccess || !txReference) return;

    console.log(`[OfframpSheet] Starting status polling for reference: ${txReference}`);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/onramp/status?reference=${txReference}`);
        const data = await res.json();
        if (data.success) {
          console.log(`[OfframpSheet] Polled status: ${data.status}`);
          setPollingStatus(data.status);
          if (data.status === "COMPLETED" || data.status === "SENT") {
            clearInterval(interval);
            console.log("[OfframpSheet] Bridge fiat payment complete.");
          } else if (data.status === "FAILED" || data.status === "CANCELLED" || data.status === "REFUNDED") {
            clearInterval(interval);
            console.warn(`[OfframpSheet] Bridge transaction failed: ${data.status}`);
          }
        }
      } catch (err) {
        console.warn("[OfframpSheet] Status polling request error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [showSuccess, txReference]);

  const selectedBankName = SwitchBanks.find(b => b.code === bankCode)?.name || "";

  return (
    <>
      <SheetShell open={open} onOpenChange={onOpenChange} title="Sell Asset">
        <div className="flex flex-col h-[520px] max-h-[85vh]">
          {!showSuccess ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-6 px-1 custom-scrollbar pt-2">
                <div className="space-y-4">
                  {/* Amount Input */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <label className="text-zinc-500 text-xs font-medium mb-2 block">
                      {isExactOutput ? "Amount to send to beneficiary" : "You Sell"}
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {isExactOutput && <span className="text-white text-3xl font-bold font-mono">₦</span>}
                        <input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-transparent text-3xl font-bold text-white outline-none w-full"
                        />
                      </div>
                      <select
                        value={asset}
                        onChange={(e) => setAsset(e.target.value)}
                        className="bg-zinc-800 text-white text-sm rounded-xl px-3 py-2 outline-none border border-zinc-700 shrink-0"
                      >
                        <option value="solana:usdc">USDC (Solana)</option>
                        <option value="solana:usdt">USDT (Solana)</option>
                        <option value="base:usdc">USDC (Base)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quote Display */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    {fetchingQuote ? (
                      <div className="flex justify-center p-2"><Loader2 className="w-5 h-5 animate-spin text-zinc-500" /></div>
                    ) : quoteError ? (
                      <div className="text-red-400 text-sm text-center">{quoteError}</div>
                    ) : quote ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Exchange Rate</span>
                          <span className="text-white">1 USD ≈ ₦{quote.rate.toLocaleString()}</span>
                        </div>
                        {isExactOutput ? (
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Total cost</span>
                            <span className="text-violet-400 font-bold text-lg">
                              {quote.source?.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.split(":")[1]?.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">You Receive</span>
                            <span className="text-emerald-400 font-bold text-lg">₦{quote.destination.amount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-zinc-500 text-sm text-center">Enter amount to see quote</div>
                    )}
                  </div>

                  {/* Bank Details Inputs */}
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <div>
                      <label className="text-zinc-500 text-xs font-medium mb-2 block">Bank Name</label>
                      <select
                        value={bankCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBankCode(val);
                          onBeneficiaryChange?.(val, accountNumber, val === defaultBankCode && accountNumber === defaultAccountNumber ? (defaultAccountName || "") : "");
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white outline-none"
                      >
                        <option value="">Select a Bank...</option>
                        {SwitchBanks.map((b, idx) => (
                          <option key={`${b.code}-${idx}`} value={b.code}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-zinc-500 text-xs font-medium mb-2 block">Account Number</label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="0123456789"
                        value={accountNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAccountNumber(val);
                          onBeneficiaryChange?.(bankCode, val, bankCode === defaultBankCode && val === defaultAccountNumber ? (defaultAccountName || "") : "");
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white outline-none font-medium tracking-widest placeholder:tracking-normal"
                      />
                    </div>
                    {resolvingAccount && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
                        <span className="text-zinc-400 text-xs font-medium">Resolving account name...</span>
                      </div>
                    )}
                    {resolveError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 text-xs font-medium m-0">{resolveError}</p>
                        </div>
                      </div>
                    )}
                    {resolvedAccountName && (
                      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-200">
                        <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider m-0">Account Holder Name</p>
                          <p className="text-white font-bold text-sm m-0 mt-0.5">{resolvedAccountName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {initError && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm text-center border border-red-500/20 mt-4">
                      {initError}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="sticky bottom-0 pt-4 pb-4 bg-[#16171d]/50 backdrop-blur-sm px-1 border-t border-white/5 mt-auto shrink-0">
                <button
                  disabled={!quote || !bankCode || accountNumber.length < 10 || initiating || fetchingQuote || resolvingAccount || !!resolveError}
                  onClick={() => setShowPin(true)}
                  className="w-full h-[60px] rounded-2xl bg-violet-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-violet-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                >
                  {initiating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Landmark className="w-5 h-5" />}
                  {initiating ? "Processing..." : `Withdraw ₦${quote?.destination?.amount?.toLocaleString() || '0'}`}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                {pollingStatus === "COMPLETED" || pollingStatus === "SENT" ? (
                  <CheckCircle2 className="w-10 h-10 text-violet-400" />
                ) : pollingStatus === "FAILED" || pollingStatus === "CANCELLED" || pollingStatus === "REFUNDED" ? (
                  <AlertCircle className="w-10 h-10 text-red-500" />
                ) : (
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {pollingStatus === "COMPLETED" || pollingStatus === "SENT" ? "Withdrawal Success" : pollingStatus === "FAILED" || pollingStatus === "CANCELLED" || pollingStatus === "REFUNDED" ? "Withdrawal Failed" : "Withdrawal Processing"}
              </h3>
              <p className="text-zinc-400 leading-relaxed max-w-[280px]">
                {pollingStatus === "COMPLETED" || pollingStatus === "SENT" 
                  ? "Your withdrawal has been processed and bank transfer completed." 
                  : pollingStatus === "FAILED" || pollingStatus === "CANCELLED" || pollingStatus === "REFUNDED" 
                    ? "Bridge settlement failed. Please contact support." 
                    : isExactOutput
                      ? `Your withdrawal of ₦${Number(amount).toLocaleString()} is being processed. You will receive the Naira in your bank account shortly.`
                      : `Your ${amount} asset is being sent securely. You will receive the Naira in your bank account shortly.`}
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-10 w-full h-14 rounded-2xl bg-violet-500 text-white font-bold hover:bg-violet-400 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          )}
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
      />
    </>
  );
}
