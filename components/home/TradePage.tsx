"use client"
import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, ChevronDown, Wallet } from "lucide-react";
import { getBalances, postSwap, getSwapQuote } from '@/lib/api';
import type { BalancesResponse } from '@/lib/api';
import PinSheet from "@/features/send/components/pin-sheet";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";

const TOKENS = [
  { symbol: "SOL", name: "Solana Mainnet", icon: "🟣" },
  { symbol: "USDC", name: "USD Coin", icon: "💵" },
];

export default function TradePage() {
  const [balances, setBalances] = useState<BalancesResponse | null>(null);
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [workingToken, setWorkingToken] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [rawQuote, setRawQuote] = useState<any>(null);

  useEffect(() => {
    loadBalances();
  }, []);

  // Real-time quote debouncing
  useEffect(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount)) || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      setQuoteError("");
      return;
    }

    const timer = setTimeout(fetchQuote, 600);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken]);

  const fetchQuote = async () => {
    if (!fromAmount) return;
    setQuoteLoading(true);
    setQuoteError("");
    const res = await getSwapQuote(fromAmount, fromToken.symbol, toToken.symbol);
    setQuoteLoading(false);

    if (res.data) {
      setToAmount(parseFloat(res.data.amountOut).toFixed(4));
      setWorkingToken(res.data.workingToken);
      setTokenName(res.data.tokenName);
      setRawQuote(res.data.rawQuote);
    } else {
      setQuoteError(res.error || "Insufficient liquidity");
      setToAmount("");
      setWorkingToken("");
      setRawQuote(null);
    }
  };

  const loadBalances = async () => {
    setLoading(true);
    const res = await getBalances();
    if (res.data) setBalances(res.data);
    setLoading(false);
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const getBalanceForToken = (symbol: string) => {
    if (!balances) return "0.00";
    if (symbol === "SOL") return balances.balances.sol;
    if (symbol === "USDC") {
       const usdc = balances.tokens.find(t => t.symbol === "USDC-SOL");
       return usdc ? usdc.balance : "0.00";
    }
    return "0.00";
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length < WALLET_PIN_LENGTH) {
      setPin((prev) => prev + digit);
      setPinError("");
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const executeSwap = async () => {
    if (pin.length !== WALLET_PIN_LENGTH) {
      setPinError(`Please enter your ${WALLET_PIN_LENGTH}-digit PIN`);
      return;
    }

    setSwapping(true);
    setPinError("");
    
    try {
      const res = await postSwap({
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromAmount,
        pin,
        workingToken,
        rawQuote,
      });

      if (res.data?.success) {
        setTxHash(res.data.hash);
        setShowPin(false);
        setPin("");
        loadBalances(); // Refresh balances
      } else {
        setPinError(res.error || "Swap failed. Please check your balance.");
      }
    } catch (err) {
      setPinError("Network error. Please try again.");
    } finally {
      setSwapping(false);
    }
  };

  if (txHash) {
    return (
      <div className="p-4 px-6 pb-6 flex flex-col min-h-[calc(100dvh-90px)] bg-transparent animate-[fadeIn_0.4s_ease-out] justify-center items-center">
        <div className="text-center p-10 bg-[#1f1f1f] rounded-[32px] border border-white/10 w-full max-w-[320px]">
          <div className="text-[48px] mb-6">✅</div>
          <h2 className="text-2xl font-extrabold mb-3">Swap Successful!</h2>
          <p className="text-[#b7b7be] text-sm mb-6">
            You swapped {fromAmount} {fromToken.symbol} for {toAmount || "?"} {toToken.symbol}
          </p>
          <a 
            href={`https://solscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-[#3EC6C6] underline text-xs mb-4"
          >
            View in explorer
          </a>
          <button onClick={() => { setTxHash(null); setFromAmount(""); setToAmount(""); }} className="w-full p-[18px] bg-gradient-to-r from-[#3EC6C6] to-[#30A8A8] text-black border-none rounded-[18px] text-base font-bold cursor-pointer transition-all duration-200 ease-in-out shadow-[0_4px_15px_rgba(62,198,198,0.25)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(62,198,198,0.35)] mt-6">
            Make Another Trade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 px-6 pb-6 flex flex-col min-h-[calc(100dvh-90px)] bg-transparent animate-[fadeIn_0.4s_ease-out]">
      <header className="mb-8 text-left">
        <h1 className="text-[28px] font-extrabold text-[#f3f3f5] tracking-tight mb-1">Swap Assets</h1>
        <p className="text-sm text-[#b7b7be] font-normal">Exchange tokens instantly on Solana Mainnet</p>
      </header>

      <div className="flex flex-col gap-2 relative bg-[#1f1f1f] p-6 rounded-[32px] border border-white/[0.05] shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
        {/* From Section */}
        <div className="bg-[#252525] p-[18px] rounded-[20px] border border-white/10 transition-colors duration-200 focus-within:border-[#9a84ff]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold text-[#b7b7be] uppercase tracking-wider">From</span>
            <span className="text-[12px] text-[#8b8b93] flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Balance: {loading ? "..." : getBalanceForToken(fromToken.symbol)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent border-none text-2xl font-bold text-[#f3f3f5] w-full outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button className="flex items-center gap-2 bg-white/[0.05] py-2 px-3 rounded-[14px] border border-white/10 cursor-pointer transition-colors duration-200 hover:bg-white/10">
              <span className="text-base">{fromToken.icon}</span>
              <span className="font-bold text-sm text-[#f3f3f5]">{fromToken.symbol}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </button>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center -my-4 z-10">
          <button className="w-11 h-11 bg-[#1f1f1f] border-[3px] border-[#171717] rounded-xl flex items-center justify-center cursor-pointer transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:rotate-180 hover:scale-110 text-[#9a84ff]" onClick={handleSwapTokens} aria-label="Switch tokens">
            <RefreshCw className="w-5 h-5 text-[#8B5CF6]" />
          </button>
        </div>

        {/* To Section */}
        <div className="bg-[#252525] p-[18px] rounded-[20px] border border-white/10 transition-colors duration-200 focus-within:border-[#9a84ff]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold text-[#b7b7be] uppercase tracking-wider">To (Estimated)</span>
            <span className="text-[12px] text-[#8b8b93] flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Balance: {loading ? "..." : getBalanceForToken(toToken.symbol)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center h-[36px]">
              {quoteLoading ? (
                <div className="flex items-center gap-2 text-[#8B5CF6]/60 text-sm animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching quote...</span>
                </div>
              ) : (
                <input
                  type="number"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                  className={`flex-1 bg-transparent border-none text-2xl font-bold text-[#f3f3f5] w-full outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none opacity-80 cursor-default ${quoteError ? 'text-red-400' : ''}`}
                />
              )}
            </div>
            <button className="flex items-center gap-2 bg-white/[0.05] py-2 px-3 rounded-[14px] border border-white/10 cursor-pointer transition-colors duration-200 hover:bg-white/10">
              <span className="text-base">{toToken.icon}</span>
              <span className="font-bold text-sm text-[#f3f3f5]">{toToken.symbol}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </button>
          </div>
        </div>

        {/* Simple Info Row */}
        <div className="flex justify-between p-2 px-1 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-zinc-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Slippage Tolerance: 0.5%</span>
            </div>
            <button 
              className={`flex items-center justify-center bg-white/[0.05] border border-white/10 text-[#8b8b93] p-1 rounded-md cursor-pointer transition-all duration-200 hover:not-disabled:bg-white/10 hover:not-disabled:text-[#9a84ff] disabled:opacity-50 disabled:cursor-not-allowed ${quoteLoading ? 'animate-spin text-[#9a84ff]' : ''}`}
              onClick={fetchQuote}
              disabled={quoteLoading || !fromAmount}
              aria-label="Refresh quote"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          {quoteError ? (
            <p className="text-red-400 text-xs font-semibold">{quoteError}</p>
          ) : fromAmount && toAmount ? (
            <div className="flex flex-col items-end">
              <p className="text-[#8B5CF6] text-xs font-medium">
                1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}
              </p>
              {tokenName && <span className="text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">Found pool via {tokenName}</span>}
            </div>
          ) : (
             <p className="text-zinc-500 text-xs">Confirming quote...</p>
          )}
        </div>

        {/* Action Button */}
        {(() => {
          const balance = parseFloat(getBalanceForToken(fromToken.symbol));
          const amount = parseFloat(fromAmount);
          const isInsufficient = !isNaN(amount) && amount > balance;

          const btnClass = isInsufficient
            ? "bg-red-500/15 text-[#EF4444] border border-red-500/30 shadow-none cursor-not-allowed"
            : "bg-gradient-to-br from-[#3EC6C6] to-[#30A8A8] text-black border-none shadow-[0_4px_15px_rgba(62,198,198,0.25)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(62,198,198,0.35)] disabled:bg-[#252525] disabled:bg-none disabled:text-[#8b8b93] disabled:cursor-not-allowed disabled:shadow-none";

          return (
            <button
              disabled={!fromAmount || !!quoteError || quoteLoading || amount <= 0 || swapping || isInsufficient}
              onClick={() => setShowPin(true)}
              className={`w-full p-[18px] rounded-[18px] text-base font-bold cursor-pointer transition-all duration-200 ease-in-out ${btnClass}`}
            >
              {swapping ? "Processing..." : 
               isInsufficient ? "Insufficient Balance" : 
               quoteError ? "No Liquidity" : 
               "Secure Swap"}
            </button>
          );
        })()}
      </div>

      <PinSheet
        open={showPin}
        onOpenChange={setShowPin}
        pin={pin}
        error={pinError}
        onDigitPress={handleDigitPress}
        onBackspace={handleBackspace}
        onDone={executeSwap}
        processing={swapping}
      />
    </div>
  );
}
