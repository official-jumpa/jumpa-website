"use client"
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, PenLine, ScanLine } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@/lib/pages-adapter";

import ConfirmFiatSheet from "./components/confirm-fiat-sheet";
import PinSheet from "@/features/send/components/pin-sheet";
import FiatSuccessSheet from "./components/fiat-success-sheet";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";

const quickAmounts = ["50", "200", "500"];

export default function SendFiatPage() {
  const navigate = useNavigate();
  const [recipientAccount, setRecipientAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  
  // Modals state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Pin state
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const isSubmitting = useRef(false);

  const amountValue = Number(amount) || 0;
  const balanceRaw = 81.07; // Mocked USDC balance for design
  
  // Mocked recipient resolution
  const isAccountValid = recipientAccount.length >= 10;
  const showAccountError = recipientAccount.length > 0 && recipientAccount.length < 10;
  const recipientName = isAccountValid ? "Anita Ndukwe" : "";
  const bankName = isAccountValid ? "Opay" : "";

  const isValidAmount = amountValue > 0 && amountValue <= balanceRaw;
  const isInsufficient = amountValue > balanceRaw;
  const isValid = isAccountValid && isValidAmount;

  const handleSendClick = () => {
    if (isValid) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmPayment = () => {
    setConfirmOpen(false);
    setPinOpen(true);
  };

  const handlePinDigit = (digit: string) => {
    if (processing || isSubmitting.current) return;
    setPinError("");
    setPin((prev) => {
      if (prev.length >= WALLET_PIN_LENGTH) return prev;
      return `${prev}${digit}`;
    });
  };

  const verifyPinAndSend = async (inputPin: string) => {
    if (inputPin.length !== WALLET_PIN_LENGTH || processing || isSubmitting.current) return;

    isSubmitting.current = true;
    setProcessing(true);
    setPinError("");

    // Mock API call delay
    setTimeout(() => {
      setProcessing(false);
      isSubmitting.current = false;
      setPin("");
      setPinOpen(false);
      setSuccessOpen(true);
    }, 2000);
  };

  useEffect(() => {
    if (
      pin.length === WALLET_PIN_LENGTH &&
      !processing &&
      !isSubmitting.current
    ) {
      verifyPinAndSend(pin);
    }
  }, [pin, processing]);

  const handleDoneFlow = () => {
    setSuccessOpen(false);
    setPin("");
    setAmount("");
    setRecipientAccount("");
    setNarration("");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#16171d] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-32 pt-5">
        <header className="relative flex items-center justify-between pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-zinc-300 transition hover:bg-white/10"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-white">
            Send Money
          </h1>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300">
            Naira
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </div>
        </header>

        <section className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[13px] font-medium text-white">Recipient Account</p>
            {showAccountError && (
              <span className="text-[11px] text-red-500">Wrong account number</span>
            )}
          </div>
          <div 
            className={`rounded-2xl bg-[#1c1d22] px-4 py-3 transition-colors ${
              showAccountError ? 'border border-red-500' : isAccountValid ? 'border border-green-500' : 'border border-white/5'
            }`}
          >
            <input
              type="text"
              inputMode="numeric"
              value={recipientAccount}
              onChange={(e) => setRecipientAccount(e.target.value.replace(/\D/g, ''))}
              placeholder="Account number"
              className="w-full bg-transparent text-[15px] text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          {isAccountValid && (
            <div className="flex justify-between items-center mt-3 px-1">
              <span className="text-sm font-semibold text-white">{recipientName}</span>
              <span className="text-[13px] text-zinc-400">{bankName}</span>
            </div>
          )}
        </section>

        <section className="rounded-[28px] bg-[#1c1d22] p-5 pb-6 border border-white/5 relative mb-6">
          <div className="flex justify-center mb-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white border border-white/5">
              <div className="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px]">
                USDC
              </div>
              USDC
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>
          </div>

          <div className="text-center w-full mb-3">
            <div className="flex items-center justify-center gap-1 relative">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = val.split('.');
                  if (parts.length > 2) return;
                  setAmount(val);
                }}
                placeholder="0.00"
                className={`w-full bg-transparent text-[42px] font-bold text-center placeholder:text-zinc-600 focus:outline-none ${isInsufficient ? 'text-red-500' : 'text-white'}`}
                style={{ width: `${Math.max(3, amount.length)}ch` }}
              />
            </div>
            <div className="mt-2 text-[13px] text-zinc-400">
              {balanceRaw}
            </div>
          </div>

          <div className="absolute bottom-5 right-5">
            <PenLine className="h-4 w-4 text-[#7c5cfc]" />
          </div>
          <div className="absolute bottom-5 left-0 right-0 text-center">
            <span className="text-[11px] text-zinc-600">Enter amount</span>
          </div>
        </section>

        <section className="flex flex-wrap gap-2 mb-8 justify-center">
          {quickAmounts.map((qAmount) => (
            <button
              key={qAmount}
              type="button"
              onClick={() => setAmount(qAmount)}
              className="inline-flex h-[34px] items-center rounded-full border border-white/10 bg-transparent px-4 text-[13px] font-medium text-white hover:bg-white/5 transition-colors"
            >
              ₦{qAmount}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(balanceRaw.toString())}
            className="inline-flex h-[34px] items-center rounded-full border border-white/10 bg-transparent px-4 text-[13px] font-medium text-white hover:bg-white/5 transition-colors"
          >
            Max
          </button>
          <button
            type="button"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/10 bg-transparent text-white hover:bg-white/5 transition-colors"
            aria-label="Scan QR"
          >
            <ScanLine className="h-4 w-4" />
          </button>
        </section>

        {isInsufficient && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-center">
            <span className="text-[15px] font-semibold text-red-500">Insufficient funds</span>
          </div>
        )}

        {!isInsufficient && (
          <Button
            type="button"
            onClick={handleSendClick}
            disabled={!isValid}
            className={`h-14 w-full rounded-2xl text-[17px] font-medium text-white transition-all mb-8 ${isValid ? "bg-[#7c5cfc] hover:bg-[#6b4ce6] opacity-100" : "bg-[#c3b6fd] opacity-50 cursor-not-allowed"
              }`}
          >
            Send
          </Button>
        )}

        <section className="mb-4">
          <p className="text-[13px] font-medium text-white mb-2">Narration</p>
          <div className="rounded-2xl bg-[#1c1d22] px-4 py-4 border border-white/5">
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="What's it for ?"
              className="w-full bg-transparent text-[14px] text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
        </section>
      </div>

      <ConfirmFiatSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        amount={amount}
        recipientAccount={recipientAccount}
        recipientName={recipientName}
        bankName={bankName}
        fee="0.1 USDC"
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

      <FiatSuccessSheet
        open={successOpen}
        onOpenChange={setSuccessOpen}
        onDone={handleDoneFlow}
        amount={amount}
        recipientAccount={recipientAccount}
        bankName={bankName}
        fee="0.5%"
        date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\//g, '-')}
      />
    </div>
  );
}
