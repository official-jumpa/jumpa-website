import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, ChevronDown, Wallet } from "lucide-react";
import "./TradePage.css";
import { getBalances, postSwap, getSwapQuote } from '@/lib/api';
import type { BalancesResponse } from '@/lib/api';
import PinSheet from "@/features/send/components/pin-sheet";

const TOKENS = [
  { symbol: "FLOW", name: "Flow", icon: "🌊" },
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
    } else {
      setQuoteError(res.error || "Insufficient liquidity");
      setToAmount("");
      setWorkingToken("");
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
    if (symbol === "FLOW") return balances.balances.flow;
    if (symbol === "USDC") {
       const usdc = balances.tokens.find(t => t.symbol === "USDC");
       return usdc ? usdc.balance : "0.00";
    }
    return "0.00";
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setPinError("");
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const executeSwap = async () => {
    if (pin.length !== 4) {
      setPinError("Please enter your 4-digit PIN");
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
      <div className="trade-page success-view">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Swap Successful!</h2>
          <p className="success-msg">
            You swapped {fromAmount} {fromToken.symbol} for {toAmount || "?"} {toToken.symbol}
          </p>
          <a 
            href={`https://evm-testnet.flowscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="explorer-link"
          >
            View in explorer
          </a>
          <button onClick={() => { setTxHash(null); setFromAmount(""); setToAmount(""); }} className="trade-submit-btn mt-6">
            Make Another Trade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-page">
      <header className="trade-header">
        <h1 className="trade-title">Swap Assets</h1>
        <p className="trade-subtitle">Exchange tokens instantly on Flow EVM</p>
      </header>

      <div className="trade-container">
        {/* From Section */}
        <div className="trade-input-card">
          <div className="trade-input-header">
            <span className="trade-label">From</span>
            <span className="trade-balance">
              <Wallet className="w-3 h-3" /> Balance: {loading ? "..." : getBalanceForToken(fromToken.symbol)}
            </span>
          </div>
          <div className="trade-input-row">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="trade-amount-input"
            />
            <button className="trade-token-selector">
              <span className="token-icon">{fromToken.icon}</span>
              <span className="token-symbol">{fromToken.symbol}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </button>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="trade-switch-container">
          <button className="trade-switch-btn" onClick={handleSwapTokens} aria-label="Switch tokens">
            <RefreshCw className="w-5 h-5 text-[#3EC6C6]" />
          </button>
        </div>

        {/* To Section */}
        <div className="trade-input-card">
          <div className="trade-input-header">
            <span className="trade-label">To (Estimated)</span>
            <span className="trade-balance">
              <Wallet className="w-3 h-3" /> Balance: {loading ? "..." : getBalanceForToken(toToken.symbol)}
            </span>
          </div>
          <div className="trade-input-row">
            <div className="flex-1 flex items-center h-[36px]">
              {quoteLoading ? (
                <div className="flex items-center gap-2 text-[#3EC6C6]/60 text-sm animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching quote...</span>
                </div>
              ) : (
                <input
                  type="number"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                  className={`trade-amount-input readonly ${quoteError ? 'text-red-400' : ''}`}
                />
              )}
            </div>
            <button className="trade-token-selector">
              <span className="token-icon">{toToken.icon}</span>
              <span className="token-symbol">{toToken.symbol}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </button>
          </div>
        </div>

        {/* Simple Info Row */}
        <div className="trade-info-row">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-zinc-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Slippage Tolerance: 0.5%</span>
            </div>
            <button 
              className={`refresh-quote-btn ${quoteLoading ? 'spinning' : ''}`}
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
              <p className="text-[#3EC6C6] text-xs font-medium">
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

          return (
            <button
              disabled={!fromAmount || !!quoteError || quoteLoading || amount <= 0 || swapping || isInsufficient}
              onClick={() => setShowPin(true)}
              className={`trade-submit-btn ${isInsufficient ? 'insufficient' : ''}`}
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
