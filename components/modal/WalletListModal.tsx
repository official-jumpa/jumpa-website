import React, { useState, useEffect, useMemo } from 'react';
import { useHomeLayout } from '@/components/layouts/HomeLayout';
import { WALLET_ICONS } from '@/lib/constants/wallet-icons';
import { walletSetup, getAllWalletBalances } from '@/lib/api';
import { WALLET_PIN_LENGTH } from '@/lib/wallet-pin';
import { Check, X, Edit2, Copy, ArrowLeft, KeyRound, Download } from 'lucide-react';
import NumericKeyboard from '../pin/NumericKeyboard';

type AddWalletStep = null | 'choose-method' | 'generate-pin' | 'import-phrase' | 'import-pin';

interface WalletListModalProps {
  onClose: () => void;
}

const WalletListModal: React.FC<WalletListModalProps> = ({ onClose }) => {
  const {
    wallets,
    activeWallet,
    onSelectWallet,
    onRenameWallet,
    refreshWallets,
    balanceHidden,
  } = useHomeLayout();

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Naming & Editing states
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

  // Per-wallet balance state
  const [walletBalances, setWalletBalances] = useState<Record<string, string>>({});
  const [balancesLoading, setBalancesLoading] = useState(true);

  // Multi-step add wallet flow
  const [addWalletStep, setAddWalletStep] = useState<AddWalletStep>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Import state
  const [importWords, setImportWords] = useState<string[]>(new Array(12).fill(''));
  const [importError, setImportError] = useState<string | null>(null);
  const [importFocusedIndex, setImportFocusedIndex] = useState<number | null>(null);

  const importReady = useMemo(() => {
    return importWords.every((w) => w.trim().length > 0);
  }, [importWords]);

  // Fetch balances for all wallets on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchBalances() {
      setBalancesLoading(true);
      const res = await getAllWalletBalances();
      if (!cancelled && res.data) {
        const map: Record<string, string> = {};
        for (const entry of res.data) {
          map[entry.address.toLowerCase()] = entry.totalUsd;
        }
        setWalletBalances(map);
      }
      if (!cancelled) setBalancesLoading(false);
    }
    fetchBalances();
    return () => { cancelled = true; };
  }, [wallets.length]);

  // --- Helpers ---

  const clearImportState = () => {
    setImportWords(new Array(12).fill(''));
    setImportError(null);
    setImportFocusedIndex(null);
  };

  const handleCopy = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1500);
  };

  const handleStartEdit = (e: React.MouseEvent, address: string, currentName: string) => {
    e.stopPropagation();
    setEditingAddress(address);
    setEditName(currentName);
    setRenameError(null);
  };

  const handleSaveRename = async (e: React.FormEvent, address: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editName.trim()) {
      setRenameError("Name cannot be empty");
      return;
    }
    const success = await onRenameWallet(address, editName.trim());
    if (success) {
      setEditingAddress(null);
      setRenameError(null);
    } else {
      setRenameError("A wallet with this name already exists");
    }
  };

  const handleAddWalletClick = () => {
    if (wallets.length >= 5) {
      // TODO(security): Replace alert() with framework-native modal component
      setPinError("Maximum limit of 5 wallets reached");
      return;
    }
    setAddWalletStep('choose-method');
    setPin('');
    setPinError(null);
    clearImportState();
  };

  const handleBack = () => {
    switch (addWalletStep) {
      case 'choose-method':
        setAddWalletStep(null);
        break;
      case 'generate-pin':
      case 'import-phrase':
        setAddWalletStep('choose-method');
        break;
      case 'import-pin':
        setAddWalletStep('import-phrase');
        break;
    }
    setPin('');
    setPinError(null);
    setImportError(null);
  };

  // --- Import phrase handlers ---

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...importWords];
    const parts = value.trim().split(/\s+/);
    if (parts.length > 1) {
      handlePasteData(parts);
      return;
    }
    newWords[index] = value.toLowerCase().replace(/[^a-z]/g, '');
    setImportWords(newWords);
    setImportError(null);
  };

  const handlePasteData = (words: string[]) => {
    const newWords = [...importWords];
    words.forEach((w, i) => {
      if (i < 12) {
        newWords[i] = w.toLowerCase().replace(/[^a-z]/g, '');
      }
    });
    setImportWords(newWords);
    setImportError(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      handlePasteData(words);
    }
  };

  const handleImportContinue = () => {
    if (!importReady) return;
    setAddWalletStep('import-pin');
    setPin('');
    setPinError(null);
  };

  // --- PIN handler (shared for generate & import) ---

  const handlePinKeyPress = async (key: string) => {
    if (isCreating) return;

    if (key === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      setPinError(null);
      return;
    }

    if (pin.length >= WALLET_PIN_LENGTH) return;

    const newPin = pin + key;
    setPin(newPin);
    setPinError(null);

    if (newPin.length === WALLET_PIN_LENGTH) {
      setIsCreating(true);
      try {
        const isImport = addWalletStep === 'import-pin';
        const phrase = isImport ? importWords.join(' ') : undefined;
        const action = isImport ? 'import' as const : undefined;

        const res = await walletSetup(newPin, phrase, action);
        if (res.data) {
          await refreshWallets();
          if (res.data.address) {
            await onSelectWallet(res.data.address);
          }
          setAddWalletStep(null);
          setPin('');
          clearImportState();
          onClose();
        } else {
          setPinError(res.error || "Incorrect PIN or failed setup");
          setPin('');
        }
      } catch {
        setPinError("Failed to set up wallet");
        setPin('');
      } finally {
        setIsCreating(false);
      }
    }
  };

  // --- Shared modal shell ---
  const modalShell = "absolute bottom-0 left-0 right-0 bg-[#0f0f10] rounded-t-[32px] pt-5 px-4 pb-8 z-60 max-h-[85%] min-h-[400px] flex flex-col overflow-y-auto scrollbar-none animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards]";

  // ==========================================
  // STEP: Choose Method
  // ==========================================
  if (addWalletStep === 'choose-method') {
    return (
      <div className={modalShell} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-6">
          <button
            className="w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]"
            onClick={handleBack}
            aria-label="Back"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 text-[#f3f3f5] opacity-70" />
          </button>
          <h3 className="text-[17px] font-bold text-[#f3f3f5] flex-1 text-center pr-8">Add Wallet</h3>
        </div>

        <p className="text-xs text-[#8b8b93] text-center mb-8">
          How would you like to add a new wallet?
        </p>

        <div className="flex flex-col gap-3 px-1">
          {/* Generate option */}
          <button
            type="button"
            className="flex items-center gap-4 p-4 bg-[#1f1f1f] rounded-[14px] border border-transparent cursor-pointer transition-all duration-150 ease-out hover:bg-[#252525] hover:border-[#7c5cfc]/30 text-left w-full"
            onClick={() => setAddWalletStep('generate-pin')}
          >
            <div className="w-11 h-11 rounded-full bg-[#7c5cfc]/15 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-[#7c5cfc]" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[#f3f3f5]">Generate New Wallet</span>
              <span className="text-[11px] text-[#8b8b93] leading-relaxed">
                Create a new multi-chain wallet
              </span>
            </div>
          </button>

          {/* Import option */}
          <button
            type="button"
            className="flex items-center gap-4 p-4 bg-[#1f1f1f] rounded-[14px] border border-transparent cursor-pointer transition-all duration-150 ease-out hover:bg-[#252525] hover:border-[#7c5cfc]/30 text-left w-full"
            onClick={() => setAddWalletStep('import-phrase')}
          >
            <div className="w-11 h-11 rounded-full bg-[#22c55e]/15 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[#f3f3f5]">Import Existing Wallet</span>
              <span className="text-[11px] text-[#8b8b93] leading-relaxed">
                Restore a wallet using your 12-word seed phrase
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP: Generate PIN (existing flow)
  // ==========================================
  if (addWalletStep === 'generate-pin') {
    return (
      <div className={modalShell} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-6">
          <button
            className="w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]"
            onClick={handleBack}
            aria-label="Back"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 text-[#f3f3f5] opacity-70" />
          </button>
          <h3 className="text-[17px] font-bold text-[#f3f3f5] flex-1 text-center pr-8">Create New Wallet</h3>
        </div>

        <div className="flex flex-col items-center gap-5 my-3">
          <p className="text-xs text-[#8b8b93] text-center max-w-[280px]">
            Enter your transaction PIN to continue
          </p>

          <div className="flex gap-3 my-2">
            {Array.from({ length: WALLET_PIN_LENGTH }, (_, i) => {
              const filled = i < pin.length;
              return (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg bg-[#252525] border border-[#444] flex items-center justify-center transition-all duration-150 ${pinError ? '!border-[#FF2524]' : filled ? '!border-[#7c5cfc]' : ''
                    }`}
                >
                  {filled && <div className="w-2.5 h-2.5 rounded-full bg-[#7c5cfc]" />}
                </div>
              );
            })}
          </div>

          {pinError && <p className="text-xs text-[#ff2524] font-medium">{pinError}</p>}
          {isCreating && <p className="text-xs text-[#7c5cfc] animate-pulse">Deriving addresses and encrypting seed phrase...</p>}
        </div>

        <div className="mt-auto pt-4 pb-2">
          <NumericKeyboard onKeyPress={handlePinKeyPress} />
        </div>
      </div>
    );
  }

  // Import Phrase (12-word grid)
  if (addWalletStep === 'import-phrase') {
    return (
      <div className={modalShell} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-4">
          <button
            className="w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]"
            onClick={handleBack}
            aria-label="Back"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 text-[#f3f3f5] opacity-70" />
          </button>
          <h3 className="text-[17px] font-bold text-[#f3f3f5] flex-1 text-center pr-8">Import Wallet</h3>
        </div>

        <p className="text-xs text-[#8b8b93] text-center mb-6 max-w-[280px] mx-auto">
          Enter your 12-word recovery phrase in the correct order.
        </p>

        {/* 12-word grid */}
        <div className="grid grid-cols-2 gap-2.5 px-1">
          {importWords.map((word, idx) => (
            <div
              key={idx}
              className={`relative flex h-11 items-center rounded-xl border px-3 transition-all duration-200 ${importFocusedIndex === idx
                  ? 'border-[#7c5cfc] bg-[#1a1a1b]'
                  : 'border-[#2a2a2d] bg-[#141414]'
                }`}
            >
              <span className="mr-2 text-[10px] font-medium text-[#52525B] w-4">
                {idx + 1}
              </span>
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={word}
                onChange={(e) => handleWordChange(idx, e.target.value)}
                onPaste={idx === 0 ? handlePaste : undefined}
                onFocus={() => setImportFocusedIndex(idx)}
                onBlur={() => setImportFocusedIndex(null)}
                placeholder="word"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] font-medium text-[#f3f3f5] outline-none placeholder:text-[#3F3F46]"
              />
            </div>
          ))}
        </div>

        {importError && (
          <p className="text-xs text-[#ff2524] font-medium text-center mt-4" role="alert">
            {importError}
          </p>
        )}

        <div className="mt-auto pt-6 pb-2">
          <button
            type="button"
            onClick={handleImportContinue}
            disabled={!importReady}
            className={`w-full h-12 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer ${importReady
                ? 'bg-[#7c5cfc] text-white hover:bg-[#6a59ce] shadow-[0_4px_12px_rgba(124,92,252,0.3)]'
                : 'bg-[#252525] text-[#52525B] cursor-not-allowed'
              }`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Import PIN (authorize import)
  if (addWalletStep === 'import-pin') {
    return (
      <div className={modalShell} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-6">
          <button
            className="w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]"
            onClick={handleBack}
            aria-label="Back"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 text-[#f3f3f5] opacity-70" />
          </button>
          <h3 className="text-[17px] font-bold text-[#f3f3f5] flex-1 text-center pr-8">Authorize Import</h3>
        </div>

        <div className="flex flex-col items-center gap-5 my-3">
          <p className="text-xs text-[#8b8b93] text-center max-w-[280px]">
            Enter your transaction PIN to continue
          </p>

          <div className="flex gap-3 my-2">
            {Array.from({ length: WALLET_PIN_LENGTH }, (_, i) => {
              const filled = i < pin.length;
              return (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg bg-[#252525] border border-[#444] flex items-center justify-center transition-all duration-150 ${pinError ? '!border-[#FF2524]' : filled ? '!border-[#7c5cfc]' : ''
                    }`}
                >
                  {filled && <div className="w-2.5 h-2.5 rounded-full bg-[#7c5cfc]" />}
                </div>
              );
            })}
          </div>

          {pinError && <p className="text-xs text-[#ff2524] font-medium">{pinError}</p>}
          {isCreating && <p className="text-xs text-[#7c5cfc] animate-pulse">Importing and encrypting wallet...</p>}
        </div>

        <div className="mt-auto pt-4 pb-2">
          <NumericKeyboard onKeyPress={handlePinKeyPress} />
        </div>
      </div>
    );
  }

  // DEFAULT Wallet List

  return (
    <div
      className={modalShell}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2">
        <button
          className="w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <img src={WALLET_ICONS.close} alt="" width="11.72" height="11.72" className="opacity-70" />
        </button>
        <h3 className="text-[17px] font-bold text-[#f3f3f5] flex-1 text-center">My Wallets</h3>
        <button
          className="w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]"
          onClick={handleAddWalletClick}
          aria-label="Add wallet"
          type="button"
        >
          <img src={WALLET_ICONS.add} alt="" width="11.72" height="11.72" className="opacity-70" />
        </button>
      </div>
      <p className="text-xs text-[#8b8b93] text-center mb-5">Select a wallet to view its balance</p>

      <div className="flex flex-col gap-3 mt-[25px] pt-2 flex-1 overflow-y-auto scrollbar-none pb-8 px-0.5">
        {wallets.map((w) => {
          const isSelected = w.address.toLowerCase() === activeWallet?.address.toLowerCase();

          return (
            <div
              key={w.address}
              className={`flex flex-col gap-2 p-2 bg-[#1f1f1f] rounded-[14px] cursor-pointer transition-all duration-150 ease-out w-full hover:bg-[#252525] ${isSelected ? 'ring-1 ring-[#7c5cfc]' : ''}`}
              onClick={() => {
                onSelectWallet(w.address);
                onClose();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectWallet(w.address);
                  onClose();
                }
              }}
            >
              {/* Row 1: Icon + Name/Edit (left) — Total USD (right) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#6a59ce]/20 flex items-center justify-center text-[#7c5cfc]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                  {editingAddress === w.address ? (
                    <form
                      onSubmit={(e) => handleSaveRename(e, w.address)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-[#2c2c2c] border border-[#444] rounded px-2 py-0.5 text-sm text-[#f3f3f5] focus:outline-none focus:border-[#7c5cfc] w-[140px]"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-[#7c5cfc] border-none text-white rounded p-1 cursor-pointer hover:bg-[#6a59ce] flex items-center justify-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditingAddress(null); }}
                        className="bg-[#333] border-none text-[#aaa] rounded p-1 cursor-pointer hover:bg-[#444] flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#f3f3f5]">{w.name}</span>
                      <button
                        className="bg-transparent p-0.5 opacity-50 hover:opacity-100 cursor-pointer border-none flex items-center text-[#8b8b93]"
                        onClick={(e) => handleStartEdit(e, w.address, w.name)}
                        title="Rename wallet"
                        type="button"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Total USD balance */}
                <span className="text-sm font-bold text-[#f3f3f5] whitespace-nowrap">
                  {balanceHidden
                    ? '••••'
                    : balancesLoading
                      ? <span className="inline-block w-14 h-4 bg-[#252525] rounded animate-pulse" />
                      : `$${walletBalances[w.address.toLowerCase()] || '0.00'}`
                  }
                </span>
              </div>

              {/* Row 2: Address + Copy */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#8b8b93] ml-10">
                <span>{w.address.slice(0, 6)}...{w.address.slice(-4)}</span>
                <button
                  className="bg-transparent p-0.5 flex items-center opacity-50 hover:opacity-80 cursor-pointer border-none text-[#8b8b93]"
                  onClick={(e) => handleCopy(e, w.address)}
                  aria-label="Copy address"
                  type="button"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {copiedAddress === w.address && (
                  <span className="text-[10px] text-[#22c55e] ml-1 animate-[fadeIn_0.15s_ease_forwards]">Copied!</span>
                )}
              </div>

              {editingAddress === w.address && renameError && (
                <p className="text-[11px] text-[#ff4d4d] mt-1">{renameError}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WalletListModal;
