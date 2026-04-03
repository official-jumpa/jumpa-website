"use client"
import { Button } from "@/components/ui/button";
import { isAddress } from "viem";
import {
  ChevronDown,
  ChevronLeft,
  Delete,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "@/lib/pages-adapter";
import {
  defaultRecipient,
  defaultToken,
  mockTokens,
} from "./mock-data";
import ConfirmTransactionSheet from "./components/confirm-transaction-sheet";
import PinSheet from "./components/pin-sheet";
import RecipientSelectSheet from "./components/recipient-select-sheet";
import SendMethodSheet from "./components/send-method-sheet";
import SuccessSheet from "./components/success-sheet";
import TokenSearchSheet from "./components/token-search-sheet";
import type { Recipient, Token } from "./types";

import { getBalances, getRecipients, postTransfer } from "@/lib/api";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";

const quickAmounts = ["0.01", "0.1", "0.5"];

function appendToAmount(current: string, key: string) {
  if (key === ".") {
    return current.includes(".") ? current : `${current}.`;
  }
  if (current === "0") {
    return key;
  }
  return `${current}${key}`;
}

export default function SendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recipient, setRecipient] = useState<Recipient>(defaultRecipient);
  const [token, setToken] = useState<Token>(defaultToken);
  const [amount, setAmount] = useState("0");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [tokens, setTokens] = useState<Token[]>(mockTokens);
  const [lastHash, setLastHash] = useState("");

  const [sendMethodOpen, setSendMethodOpen] = useState(false);

  // Handle incoming AI state or load recipients/balances
  useEffect(() => {
    async function loadData() {
        const [recipientsRes, balancesRes] = await Promise.all([
            getRecipients(),
            getBalances()
        ]);

        if (recipientsRes.data?.recipients) {
            setRecipients(recipientsRes.data.recipients.map(r => ({
                id: r.address,
                name: r.address.slice(0, 8) + "...",
                address: r.address,
                bank: `${r.token} Destination`
            })));
        }

        if (balancesRes.data?.tokens) {
            const newTokens = balancesRes.data.tokens.map(t => ({
                id: t.symbol.toLowerCase(),
                symbol: t.symbol,
                name: t.name,
                balanceText: `${t.balance} ${t.symbol}`,
                balanceRaw: t.balance, // Added for 'Max' button
                iconLabel: t.symbol[0],
                iconColor: t.symbol === "FLOW" ? "bg-green-500" : "bg-indigo-500",
            }));
            setTokens(newTokens as any);
            
            // Set default token to the first one with balance or just the first one
            if (newTokens.length > 0) {
                const state = location.state as any;
                const targetSymbol = state?.params?.token?.toUpperCase();
                const found = newTokens.find(t => t.symbol === targetSymbol);
                setToken((found || newTokens[0]) as any);
            }
        }
    }
    loadData();

    const state = location.state as any;
    if (state?.intent === "SEND_FUNDS") {
      if (state.params.amount) setAmount(state.params.amount);
      if (state.params.recipient) {
        setRecipient({
          id: state.params.recipient,
          name: state.params.recipient.startsWith("@") ? state.params.recipient.slice(1) : "AI Contact",
          address: state.params.recipient,
          bank: "Crypto Destination"
        });
      }
      setSendMethodOpen(false);
    }
  }, [location.state]);

  const [tokenSearchOpen, setTokenSearchOpen] = useState(false);
  const [recipientSheetOpen, setRecipientSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showAddressError, setShowAddressError] = useState(false);
  const isSubmitting = useRef(false);

  const amountValue = Number(amount) || 0;
  const confirmAmount = amountValue.toString();

  const verifyPinAndSend = async (inputPin: string) => {
    if (inputPin.length !== 4 || processing || isSubmitting.current) return;
    
    isSubmitting.current = true;
    setProcessing(true);
    setPinError("");

    try {
      const res = await postTransfer({
          to: recipient.address,
          amount: amount,
          token: token.symbol,
          pin: inputPin
      });

      if (res.error) {
          setPinError(res.error);
          setPin(""); // Clear pin to retry
          isSubmitting.current = false;
          setProcessing(false);
      } else if (res.data?.success) {
          setLastHash(res.data.hash);
          setPinError("");
          setPin("");
          setPinOpen(false);
          setSuccessOpen(true);
          // Keep processing true until closed to prevent re-submitting while modal is closing
          
          // Re-fetch recipients to update history
          const updatedRecs = await getRecipients();
          if (updatedRecs.data?.recipients) {
            setRecipients(updatedRecs.data.recipients.map(r => ({
              id: r.address,
              name: r.address.slice(0, 8) + "...",
              address: r.address,
              bank: `${r.token} Destination`
            })));
          }
      }
    } catch (err) {
      setPinError("An unexpected error occurred");
      isSubmitting.current = false;
      setProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
    setConfirmOpen(false);
    setPinOpen(true);
  };

  const handleNumberPress = (key: string) => {
    setAmount((prev) => appendToAmount(prev, key));
  };

  const handleBackspaceAmount = () => {
    setAmount((prev) => {
      if (prev.length <= 1) return "0";
      const updated = prev.slice(0, -1);
      return updated === "" ? "0" : updated;
    });
  };

  const handlePinDigit = (digit: string) => {
    if (processing || isSubmitting.current) return;
    setPinError("");
    setPin((prev) => {
      if (prev.length >= WALLET_PIN_LENGTH) return prev;
      return `${prev}${digit}`;
    });
  };

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (
      pin.length === WALLET_PIN_LENGTH &&
      !processing &&
      !isSubmitting.current
    ) {
      verifyPinAndSend(pin);
    }
  }, [pin, processing, verifyPinAndSend]);

  const handleDoneFlow = () => {
    setSuccessOpen(false);
    setPin("");
    setAmount("0");
    navigate("/home");
  };

  const isAddressValid = recipient.address ? isAddress(recipient.address) : false;
  const isValid = amountValue > 0 && amountValue <= (token.balanceRaw || 0);

  return (
    <div className="min-h-screen bg-[#16171d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-32 pt-5">
        <header className="relative flex items-center justify-between pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition hover:bg-white/20"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold">
            Send Token
          </h1>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-base"
          >
            {token.symbol}
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>
        </header>

        <section className={`rounded-3xl bg-white/10 p-5 transition-all border-2 ${showAddressError && (!recipient.address || !isAddressValid) ? 'border-red-500' : 'border-transparent'}`}>
          <p className="text-sm font-medium text-zinc-400">To:</p>
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-black/20 p-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                {recipient.address ? "0x" : "?"}
              </div>
              <input
                type="text"
                value={recipient.address}
                onChange={(e) => {
                  setShowAddressError(false);
                  setRecipient({
                    ...recipient,
                    id: e.target.value,
                    address: e.target.value,
                    name: e.target.value.slice(0, 8) + "..."
                  });
                }}
                placeholder="Paste wallet address (0x...)"
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                {showAddressError && !recipient.address ? (
                  <span className="text-red-400">Recipient address required</span>
                ) : showAddressError && !isAddressValid ? (
                  <span className="text-red-400">Invalid wallet address</span>
                ) : (
                  "Suggested recipients:"
                )}
              </p>
              <button
                type="button"
                onClick={() => setRecipientSheetOpen(true)}
                className="text-xs text-violet-400 font-medium"
              >
                View History
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl bg-white/10 p-5">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setTokenSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm border border-white/5"
            >
              <div className="h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold">
                {token.symbol?.[0]}
              </div>
              {token.symbol}
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>
  
            <div className="text-center w-full">
              <div className="flex flex-col items-center">
                <div className="flex items-baseline justify-center gap-2 w-full">
                   <input
                     type="text"
                     inputMode="decimal"
                     value={amount === "0" ? "" : amount}
                     onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = val.split('.');
                        if (parts.length > 2) return;
                        setAmount(val || "0");
                     }}
                     placeholder="0"
                     className="w-full bg-transparent text-5xl font-bold text-center text-white placeholder:text-zinc-700 focus:outline-none"
                   />
                   <span className="text-xl font-medium text-zinc-400 shrink-0">{token.symbol}</span>
                </div>
                <div className="mt-2 text-sm">
                  {amountValue > token.balanceRaw ? (
                    <span className="text-red-400 font-medium">Insufficient balance ({token.balanceText})</span>
                  ) : amountValue > 0 ? (
                    <span className="text-green-500">Ready to send</span>
                  ) : (
                    <span className="text-zinc-500">Enter amount</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 flex flex-wrap gap-3">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              type="button"
              onClick={() => setAmount(quickAmount)}
              className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
            >
              {quickAmount} {token.symbol}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(token.balanceRaw.toString())}
            className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs text-zinc-300 hover:bg-white/10 transition-colors"
          >
            Max
          </button>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-4 rounded-t-3xl bg-white/10 p-6 pb-10">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleNumberPress(key)}
              className="h-12 text-xl text-zinc-100"
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNumberPress(".")}
            className="h-12 text-xl text-zinc-100"
            aria-label="Decimal point"
          >
            .
          </button>
          <button
            type="button"
            onClick={() => handleNumberPress("0")}
            className="h-12 text-xl text-zinc-100"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspaceAmount}
            className="flex h-12 items-center justify-center text-lg text-zinc-100"
            aria-label="Delete amount digit"
          >
            <Delete className="h-6 w-6" />
          </button>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md bg-[#16171d] px-5 pb-6 pt-3">
        <Button
          type="button"
          onClick={() => {
            if (!recipient.address || !isAddressValid) {
              setShowAddressError(true);
              return;
            }
            setConfirmOpen(true);
          }}
          disabled={!isValid}
          className={`h-14 w-full rounded-xl text-lg text-white transition-all ${
            isValid ? "bg-violet-500 hover:bg-violet-400 opacity-100" : "bg-zinc-700 opacity-50 cursor-not-allowed"
          }`}
        >
          Send
        </Button>
      </div>

      <SendMethodSheet
        open={sendMethodOpen}
        onOpenChange={setSendMethodOpen}
        onSelectMethod={(method) => {
          if (method === "crypto") {
            setSendMethodOpen(false);
            setTokenSearchOpen(true);
          } else {
            setSendMethodOpen(false);
            setConfirmOpen(true);
          }
        }}
      />

      <TokenSearchSheet
        open={tokenSearchOpen}
        onOpenChange={setTokenSearchOpen}
        tokens={tokens}
        onSelectToken={(selectedToken) => {
          setToken(selectedToken);
          setTokenSearchOpen(false);
          setConfirmOpen(false);
        }}
      />

      <RecipientSelectSheet
        open={recipientSheetOpen}
        onOpenChange={setRecipientSheetOpen}
        recipients={recipients}
        selectedRecipientId={recipient.id}
        onSelectRecipient={(selectedRecipient) => {
          setRecipient(selectedRecipient);
          setRecipientSheetOpen(false);
        }}
      />

      <ConfirmTransactionSheet
        open={confirmOpen}
        onOpenChange={(open) => {
          if (processing) return;
          setConfirmOpen(open);
        }}
        recipient={recipient}
        amountDisplay={confirmAmount}
        tokenSymbol={token.symbol}
        processing={processing}
        onMakePayment={handleConfirmPayment}
      />

      <PinSheet
        open={pinOpen}
        onOpenChange={setPinOpen}
        pin={pin}
        error={pinError}
        processing={processing}
        onDigitPress={handlePinDigit}
        onBackspace={() => setPin((prev) => prev.slice(0, -1))}
        onDone={() => verifyPinAndSend(pin)}
      />

      <SuccessSheet 
        open={successOpen} 
        onOpenChange={setSuccessOpen} 
        onDone={handleDoneFlow} 
        amount={amount}
        tokenSymbol={token.symbol}
        hash={lastHash}
      />
    </div>
  );
}
