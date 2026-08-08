"use client";

import React, { useState, useEffect } from "react";
import { getWallets, exportPrivateKey, type UserWallet, type ExportKeyResponse } from "@/lib/api";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";
import { getChainIcon } from "@/lib/constants/wallet-icons";
import { X, ArrowLeft, Copy, Check, Eye, EyeOff, ShieldAlert, KeyRound, Delete } from "lucide-react";

interface ExportWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "select-wallet" | "select-chain" | "enter-pin" | "view-keys";

interface ChainOption {
  id: string;
  name: string;
  symbol: string;
}

const SUPPORTED_CHAINS: ChainOption[] = [
  { id: "eth", name: "Ethereum", symbol: "ETH" },
  { id: "base", name: "Base", symbol: "BASE" },
  { id: "sol", name: "Solana", symbol: "SOL" },
  { id: "xlm", name: "Stellar", symbol: "XLM" },
  { id: "btc", name: "Bitcoin", symbol: "BTC" },
];

export default function ExportWalletModal({ isOpen, onClose }: ExportWalletModalProps) {
  const [step, setStep] = useState<Step>("select-wallet");
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [selectedChain, setSelectedChain] = useState<ChainOption | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keysData, setKeysData] = useState<ExportKeyResponse | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const keypadNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  useEffect(() => {
    if (isOpen) {
      setStep("select-wallet");
      setSelectedWallet(null);
      setSelectedChain(null);
      setPin("");
      setPinError(null);
      setKeysData(null);
      setRevealed(false);
      fetchWallets();
    }
  }, [isOpen]);

  const fetchWallets = async () => {
    const res = await getWallets();
    if (res.data) {
      setWallets(res.data);
    }
  };

  const handleSelectWallet = (wallet: UserWallet) => {
    setSelectedWallet(wallet);
    setStep("select-chain");
  };

  const handleSelectChain = (chain: ChainOption) => {
    setSelectedChain(chain);
    setStep("enter-pin");
    setPin("");
    setPinError(null);
  };

  const handleBack = () => {
    if (step === "select-chain") {
      setStep("select-wallet");
      setSelectedWallet(null);
    } else if (step === "enter-pin") {
      setStep("select-chain");
      setSelectedChain(null);
      setPin("");
      setPinError(null);
    } else if (step === "view-keys") {
      setStep("select-chain");
      setKeysData(null);
      setRevealed(false);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (loading || pin.length >= WALLET_PIN_LENGTH) return;
    const newPin = pin + digit;
    setPin(newPin);
    setPinError(null);

    if (newPin.length === WALLET_PIN_LENGTH) {
      verifyAndExport(newPin);
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const verifyAndExport = async (currentPin: string) => {
    if (!selectedWallet || !selectedChain) return;
    setLoading(true);
    try {
      const res = await exportPrivateKey(selectedWallet.address, currentPin, selectedChain.id);
      if (res.data) {
        setKeysData(res.data);
        setStep("view-keys");
        setPin("");
      } else {
        setPinError(res.error || "Incorrect PIN");
        setPin("");
      }
    } catch {
      setPinError("Failed to get private key for wallet ");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div
        className="w-full max-w-md bg-[#101010] rounded-t-[28px] sm:rounded-[24px] border border-zinc-800 p-5 text-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          {step !== "select-wallet" ? (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center hover:bg-zinc-700 transition-colors border-none cursor-pointer"
              type="button"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          ) : (
            <div className="w-9" />
          )}

          <h3 className="text-lg font-semibold tracking-tight text-center flex-1">
            {step === "select-wallet" && "Select Wallet"}
            {step === "select-chain" && "Select Chain"}
            {step === "enter-pin" && "Enter PIN"}
            {step === "view-keys" && `${selectedChain?.name} Key`}
          </h3>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center hover:bg-zinc-700 transition-colors border-none cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none py-4">
          {/* STEP 1: Select Wallet */}
          {step === "select-wallet" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-zinc-400 text-center mb-2">
                Choose the wallet you want to export
              </p>
              {wallets.length === 0 ? (
                <div className="text-center py-8 text-sm text-zinc-500">No wallets found</div>
              ) : (
                wallets.map((w) => (
                  <div
                    key={w.address}
                    onClick={() => handleSelectWallet(w)}
                    className="flex items-center justify-between p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{w.name}</span>
                        <span className="text-xs text-zinc-400 font-mono">
                          {w.address.slice(0, 6)}...{w.address.slice(-4)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full">
                      Select
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 2: Select Chain */}
          {step === "select-chain" && selectedWallet && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-zinc-400 text-center mb-2">
                Select the network chain to reveal its private key
              </p>
              {SUPPORTED_CHAINS.map((chain) => (
                <div
                  key={chain.id}
                  onClick={() => handleSelectChain(chain)}
                  className="flex items-center justify-between p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getChainIcon(chain.symbol)}
                      alt={chain.name}
                      width="36"
                      height="36"
                      className="rounded-full shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{chain.name}</span>
                      <span className="text-xs text-zinc-400">{chain.symbol} Network</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full">
                    Export
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Enter PIN (Reused keypad styling from PinSheet) */}
          {step === "enter-pin" && (
            <div className="space-y-6 pb-2">
              <div className="text-center">
                <p className="text-xs text-zinc-400">
                  Enter your PIN to export {selectedChain?.name} key for <span className="text-white font-medium">{selectedWallet?.name}</span>
                </p>
              </div>

              {/* Pin Indicators */}
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: WALLET_PIN_LENGTH }, (_, index) => (
                  <div
                    key={index}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all ${pin.length === index
                        ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                        : "border-zinc-700 bg-zinc-800/50"
                      }`}
                  >
                    {pin.length > index ? (
                      <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Error or Processing */}
              {pinError ? (
                <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-center text-sm font-medium text-red-400">
                    {pinError}
                  </p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-500/10 p-3 animate-pulse">
                  <div className="h-4 w-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                  <p className="text-sm font-medium text-violet-400">Fetching private key...</p>
                </div>
              ) : (
                <div className="h-[46px] invisible" />
              )}

              {/* Grid 3x4 Keypad matching PinSheet */}
              <div className="grid grid-cols-3 gap-3">
                {keypadNumbers.map((number) => (
                  <button
                    key={number}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDigitPress(number)}
                    className="h-14 sm:h-16 rounded-2xl bg-zinc-800 text-2xl font-semibold text-white transition-all active:scale-95 enabled:active:bg-zinc-700 enabled:hover:bg-zinc-750 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
                  >
                    {number}
                  </button>
                ))}
                <div />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDigitPress("0")}
                  className="h-14 sm:h-16 rounded-2xl bg-zinc-800 text-2xl font-semibold text-white transition-all active:scale-95 enabled:active:bg-zinc-700 enabled:hover:bg-zinc-750 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleBackspace}
                  className="flex items-center justify-center h-14 sm:h-16 rounded-2xl bg-zinc-800 text-white transition-all active:scale-95 enabled:active:bg-zinc-700 enabled:hover:bg-zinc-750 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
                  aria-label="Delete last digit"
                >
                  <Delete className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: View Single Private Key */}
          {step === "view-keys" && keysData && (
            <div className="flex flex-col gap-4">
              {/* Security Warning Alert */}
              <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <p className="leading-relaxed">
                  Never share your private key or seed phrase with anyone. Anyone with this key can take full control of your assets
                </p>
              </div>

              {/* Reveal / Hide Toggle */}
              <div className="flex items-center justify-between bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-400 font-medium">Private Key</span>
                <button
                  onClick={() => setRevealed(!revealed)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-all border-none cursor-pointer active:scale-95"
                  type="button"
                >
                  {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{revealed ? "Hide Key" : "Reveal Key"}</span>
                </button>
              </div>

              {/* Selected Chain Private Key */}
              <div className="flex flex-col gap-2.5 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedChain && (
                      <img
                        src={getChainIcon(selectedChain.symbol)}
                        alt=""
                        width="20"
                        height="20"
                        className="rounded-full"
                      />
                    )}
                    <span className="text-xs font-semibold text-white">
                      {selectedChain?.name} Private Key
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(keysData.privateKey, "Private Key")}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-transparent border-none cursor-pointer font-medium"
                    type="button"
                  >
                    {copiedKey === "Private Key" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "Private Key" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div
                  className={`p-3.5 bg-black rounded-xl text-xs font-mono text-zinc-300 break-all transition-all select-all border border-zinc-800 ${revealed ? "blur-none" : "blur-sm select-none opacity-60"
                    }`}
                >
                  {keysData.privateKey}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
