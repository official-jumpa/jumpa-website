import { useState, useEffect } from "react";
import { type Message } from "./chat-types";
import { TextWithLinks } from "./TransactionIntentCard";
import { Copy, Loader2, Wallet, CheckCircle2, AlertCircle, Clock } from "lucide-react";

type CheckState = "idle" | "checking" | "confirmed" | "pending" | "failed";

export function BuyCryptoBlock({
  msg,
  disabled = false,
  onInitiated,
}: {
  msg: Message;
  disabled?: boolean;
  onInitiated?: (reference: string, deposit: any) => void;
}) {
  // Restore from persisted transactionParams if already initiated before reload
  const persistedReference: string = msg.transactionParams?.reference || "";
  const persistedDeposit: any = msg.transactionParams?.depositData || null;

  const [step, setStep] = useState<"summary" | "transfer" | "done">(
    persistedDeposit ? "transfer" : "summary"
  );
  const [quote, setQuote] = useState<any>(null);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const [initiating, setInitiating] = useState(false);
  const [depositData, setDepositData] = useState<any>(persistedDeposit);
  const [txReference, setTxReference] = useState(persistedReference);
  const [initError, setInitError] = useState("");

  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [countdown, setCountdown] = useState(0);
  const [checkMessage, setCheckMessage] = useState("");

  const amount = msg.transactionParams?.amount || "0";
  const rawToken = msg.transactionParams?.token || "solana:usdc";
  const rawCurrency = msg.transactionParams?.currency || "NGN";

  // If currency is not NGN, the user specified a stablecoin/dollar amount → exact output mode
  const exactOutput = rawCurrency !== "NGN";

  // Format token labels dynamically (e.g. "solana:usdc" -> "USDC (Solana)")
  const getFormattedTokenName = (val: string) => {
    const parts = val.split(":");
    if (parts.length < 2) return val.toUpperCase();
    const asset = parts[1].toUpperCase();
    const network = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return `${asset} (${network})`;
  };

  const tokenLabel = getFormattedTokenName(rawToken);

  // Derive display values from quote based on exact_output mode
  const fiatToPay: number = (() => {
    if (!quote) return 0;
    if (exactOutput) {
      if (quote.source?.amount) return Number(quote.source.amount);
      if (quote.rate) return Number(amount) * Number(quote.rate);
      return 0;
    }
    return Number(amount);
  })();

  const cryptoToReceive: number = (() => {
    if (!quote) return 0;
    if (exactOutput) return Number(amount);
    return quote.destination?.amount || 0;
  })();

  // Countdown ticker — ticks down 1 per second when > 0
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Load quote on mount — skip if already in transfer/done step (already initiated)
  useEffect(() => {
    if (step !== "summary") return;
    let active = true;
    const loadQuote = async () => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setQuoteError("Invalid amount parsed by AI.");
        return;
      }
      console.log(`[BuyCryptoBlock] Querying quote - amount: ${amount}, asset: ${rawToken}, exactOutput: ${exactOutput}`);
      setFetchingQuote(true);
      setQuoteError("");
      try {
        const res = await fetch("/api/onramp/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount), asset: rawToken, exact_output: exactOutput }),
        });
        const resJson = await res.json();
        if (!active) return;
        if (resJson.success && resJson.data) {
          console.log("[BuyCryptoBlock] Quote loaded:", resJson.data);
          setQuote(resJson.data);
        } else {
          setQuoteError(resJson.error || "Failed to retrieve bridge quote");
        }
      } catch (err: any) {
        if (active) setQuoteError("Network error retrieving quote.");
      } finally {
        if (active) setFetchingQuote(false);
      }
    };

    loadQuote();
    return () => { active = false; };
  }, [amount, rawToken, exactOutput, step]);

  const handleInitiate = async () => {
    if (!amount || isNaN(Number(amount))) return;
    console.log(`[BuyCryptoBlock] Initiating bridge purchase: ${amount} → ${rawToken} (exactOutput: ${exactOutput})`);
    setInitiating(true);
    setInitError("");
    try {
      const res = await fetch("/api/onramp/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), asset: rawToken, exact_output: exactOutput }),
      });
      const resJson = await res.json();
      if (resJson.success && resJson.data?.deposit) {
        console.log("[BuyCryptoBlock] Bridge initiated:", resJson.data);
        const ref: string = resJson.data.reference;
        const dep: any = resJson.data.deposit;
        setDepositData(dep);
        setTxReference(ref);
        setStep("transfer");
        // Persist reference + deposit data to the message so it survives reloads
        onInitiated?.(ref, dep);
      } else {
        setInitError(resJson.error || "Failed to initiate bridge transfer");
      }
    } catch (err: any) {
      setInitError("Network error initiating transaction.");
    } finally {
      setInitiating(false);
    }
  };

  // Called when user clicks "I've made the payment"
  const handlePaymentMade = async () => {
    if (!txReference || checkState === "checking") return;
    console.log(`[BuyCryptoBlock] User confirmed payment. Checking status for: ${txReference}`);
    setCheckState("checking");
    setCheckMessage("");

    const MAX_CHECKS = 3;
    const INTERVAL_MS = 5000;

    for (let attempt = 1; attempt <= MAX_CHECKS; attempt++) {
      await new Promise((r) => setTimeout(r, INTERVAL_MS));
      console.log(`[BuyCryptoBlock] Status check attempt ${attempt}/${MAX_CHECKS} for ${txReference}`);
      try {
        const res = await fetch(`/api/onramp/status?reference=${txReference}`);
        const resJson = await res.json();
        if (!resJson.success) {
          console.warn(`[BuyCryptoBlock] Status check ${attempt} failed:`, resJson.error);
          continue;
        }
        const status: string = resJson.status;
        console.log(`[BuyCryptoBlock] Status check ${attempt} result: ${status}`);
        if (status === "COMPLETED" || status === "PROCESSING" || status === "SENT") {
          setCheckState("confirmed");
          setStep("done");
          return;
        }
        if (status === "FAILED" || status === "CANCELLED" || status === "REFUNDED") {
          setCheckState("failed");
          setCheckMessage(`Transaction was ${status.toLowerCase()} by the bridge. Please contact support.`);
          return;
        }
      } catch (err) {
        console.warn(`[BuyCryptoBlock] Status check ${attempt} error:`, err);
      }
    }

    console.log(`[BuyCryptoBlock] All ${MAX_CHECKS} status checks done — still pending.`);
    setCheckState("pending");
    setCheckMessage("Payment not yet confirmed. It may take a few more minutes. You can check back shortly.");
    setCountdown(10);
  };

  // ─── DISABLED STATE (older card in thread, never initiated) ───────────────────
  // If disabled and not yet initiated, collapse to just the AI text — no card UI
  if (disabled && step === "summary") {
    if (!msg.text) return null;
    return (
      <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
        <div className="m-0 font-inter font-normal text-base leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
          <TextWithLinks text={msg.text} />
        </div>
      </div>
    );
  }

  // ─── DONE STEP ───────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="flex flex-col gap-3">
        {msg.text && (
          <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
            <div className="m-0 font-inter font-normal text-base leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
              <TextWithLinks text={msg.text} />
            </div>
          </div>
        )}
        <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2 border border-violet-500/20 shadow-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-violet-400" />
          </div>
          <h3 className="m-0 text-white font-bold text-lg mb-2">Bridge Succeeded!</h3>
          <p className="m-0 text-[#909090] text-xs leading-[1.5] mb-5">
            Your stablecoins have been successfully processed. Balances will reflect in your wallet within moments.
          </p>
          <button
            onClick={() => setStep("summary")}
            className="w-full py-3 rounded-xl bg-[#7c5cfc] hover:bg-[#6c4cfb] text-white font-semibold text-sm border-none cursor-pointer active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ─── TRANSFER STEP (bank details + manual confirm) ────────────────────────────
  if (step === "transfer" && depositData) {
    return (
      <div className="flex flex-col gap-3">
        {msg.text && (
          <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
            <div className="m-0 font-inter font-normal text-base leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
              <TextWithLinks text={msg.text} />
            </div>
          </div>
        )}
        <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2 flex flex-col gap-4 border border-white/5 shadow-2xl">

          {/* Amount to transfer */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-center">
            <p className="text-[#909090] text-[10px] uppercase tracking-wider font-semibold mb-1">Transfer exactly</p>
            <p className="text-white font-bold text-2xl font-mono">
              ₦{(fiatToPay || depositData?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-violet-400 text-xs mt-1">to receive {cryptoToReceive || ""} {rawToken.split(":")[1]?.toUpperCase()}</p>
          </div>

          {/* Bank details */}
          <div className="flex flex-col gap-3 border-t border-white/5 pt-3">
            <div className="flex flex-col gap-1">
              <span className="text-[#909090] text-[10px] uppercase tracking-wider font-semibold">Bank name</span>
              <span className="text-white font-bold text-sm">{depositData.bank_name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[#909090] text-[10px] uppercase tracking-wider font-semibold">Account name</span>
              <span className="text-white font-bold text-sm uppercase">{depositData.account_name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[#909090] text-[10px] uppercase tracking-wider font-semibold">Account number</span>
              <div className="flex items-center gap-2 justify-between">
                <span className="text-white font-bold text-lg font-mono tracking-wider">{depositData.account_number}</span>
                <button
                  className="bg-zinc-800 hover:bg-zinc-700 border-none p-2 rounded-lg cursor-pointer flex items-center justify-center text-violet-400 transition-colors"
                  onClick={() => navigator.clipboard.writeText(depositData.account_number)}
                  title="Copy Account Number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Status feedback */}
          {checkState === "pending" && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-300 text-xs leading-relaxed">{checkMessage}</p>
            </div>
          )}
          {checkState === "failed" && (
            <div className="bg-red-500/10 border border-red-500/15 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs leading-relaxed">{checkMessage}</p>
            </div>
          )}

          {/* Confirm button */}
          {checkState !== "confirmed" && (
            <button
              disabled={checkState === "checking" || countdown > 0}
              onClick={handlePaymentMade}
              className="w-full py-3.5 rounded-xl bg-[#7c5cfc] hover:bg-[#6c4cfb] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm border-none cursor-pointer transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(124,58,237,0.35)]"
            >
              {checkState === "checking" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking payment...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  Retry in {countdown}s
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {checkState === "pending" ? "Check again" : "I've made the payment"}
                </>
              )}
            </button>
          )}

          <p className="m-0 text-center text-[#5a5a5a] text-[9px] px-2 leading-relaxed">
            This account expires in 30 minutes and can only be used once. Transfer the exact amount.
          </p>
        </div>
      </div>
    );
  }

  // ─── SUMMARY STEP (quote + pay button) ───────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {msg.text && (
        <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
          <div className="m-0 font-inter font-normal text-base leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
            <TextWithLinks text={msg.text} />
          </div>
        </div>
      )}

      <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2 flex flex-col gap-4 border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-[#d5d5d5] text-xs font-semibold uppercase tracking-wider">Buy Crypto</span>
          <div className="flex items-center gap-1 bg-[#222] px-3 py-1 rounded-full border border-white/5">
            <span className="text-[#d5d5d5] text-[10px] font-bold">{tokenLabel}</span>
          </div>
        </div>

        {fetchingQuote ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            <span className="text-zinc-500 text-xs font-medium">Fetching best rate...</span>
          </div>
        ) : quoteError ? (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs border border-red-500/15 text-center flex flex-col gap-1">
            <span className="font-bold">Quote Error</span>
            <span>{quoteError}</span>
          </div>
        ) : quote ? (
          <>
            <div className="flex items-center justify-between my-1">
              <div className="flex flex-col">
                <span className="text-[#909090] text-[10px] uppercase font-semibold">Pay (Fiat)</span>
                <span className="text-white text-2xl font-bold font-mono">
                  ₦{fiatToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-center shrink-0 mx-2 text-[#909090]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[#909090] text-[10px] uppercase font-semibold">Receive</span>
                <span className="text-violet-400 text-2xl font-bold font-mono">
                  {cryptoToReceive.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-1 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[#909090] text-xs font-medium">Exchange rate</span>
                <span className="text-white text-xs font-bold font-mono">1 USD ≈ ₦{quote.rate.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#909090] text-xs font-medium">Settlement</span>
                <span className="text-emerald-400 text-xs font-bold">Instant Payout</span>
              </div>
            </div>
          </>
        ) : null}

        {initError && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs border border-red-500/10">
            {initError}
          </div>
        )}

        <button
          disabled={!quote || initiating || fetchingQuote}
          onClick={handleInitiate}
          className="w-full py-3.5 rounded-xl bg-[#7c5cfc] hover:bg-[#6c4cfb] text-white font-bold text-sm border-none cursor-pointer mt-2 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(124,58,237,0.35)]"
        >
          {initiating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
          {initiating
            ? "Processing..."
            : `Confirm & Pay ₦${fiatToPay > 0 ? fiatToPay.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "..."}`}
        </button>
      </div>
    </div>
  );
}
