"use client";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, PenLine, ScanLine } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@/lib/pages-adapter";

import ConfirmFiatSheet from "./components/confirm-fiat-sheet";
import SendPinSheet from "@/features/send/components/send-pin-sheet";
import FiatSuccessSheet from "./components/fiat-success-sheet";
import FinalSuccessScreen from "./components/final-success-screen";
import { WALLET_PIN_LENGTH } from "@/lib/wallet-pin";
import TokenSearchSheet from "@/features/send/components/token-search-sheet";
import { defaultFiatToken, fiatTokens } from "@/features/send/mock-data";
import type { Token } from "@/features/send/types";
import { getCoinIcon } from "@/lib/constants/wallet-icons";

const quickAmounts = ["50", "200", "500"];

export default function SendFiatPage() {
  const navigate = useNavigate();
  const [recipientAccount, setRecipientAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [finalSuccessOpen, setFinalSuccessOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const isSubmitting = useRef(false);

  const [token, setToken] = useState<Token>(defaultFiatToken);
  const [tokens, setTokens] = useState<Token[]>(fiatTokens);
  const [tokenSearchOpen, setTokenSearchOpen] = useState(false);

  const amountValue = Number(amount) || 0;
  const balanceRaw = token.balanceRaw || 0;

  const isAccountValid = recipientAccount.length >= 10;
  const showAccountError =
    recipientAccount.length > 0 && recipientAccount.length < 10;
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
    if (
      inputPin.length !== WALLET_PIN_LENGTH ||
      processing ||
      isSubmitting.current
    )
      return;

    isSubmitting.current = true;
    setProcessing(true);
    setPinError("");

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
    setFinalSuccessOpen(true);
  };

  const tokenImg = getCoinIcon(token.symbol);

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
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-white">
            Send Money
          </h1>
          <button
            type="button"
            onClick={() => setTokenSearchOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/20"
          >
            {token.name}
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>
        </header>

        <section
          className={`rounded-2xl bg-[#2D2D2D] p-5 transition-all border-2 ${
            showAccountError ? "border-red-500" : "border-transparent"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-zinc-400">
              Recipient Account
            </p>
            {showAccountError && (
              <span className="text-[12px] font-medium text-red-500">
                Wrong account number
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div
              className={`flex items-center gap-3 rounded-lg p-3 border ${
                isAccountValid
                  ? "bg-[#1F1F1F] border-green-500"
                  : showAccountError
                    ? "bg-[#1F1F1F] border-red-500"
                    : "bg-[#1F1F1F] border-transparent"
              }`}
            >
              <input
                type="text"
                inputMode="numeric"
                value={recipientAccount}
                onChange={(e) =>
                  setRecipientAccount(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Account number"
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            {isAccountValid && (
              <div className="flex justify-between items-center p-2.5 bg-[#1F1F1F]">
                <span className="text-sm font-semibold text-[#F4F4F4]">
                  {recipientName}
                </span>
                <span className="text-xs text-[#D5D5D5]">{bankName}</span>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-[#2D2D2D] p-5">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setTokenSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#101010] px-2.5 py-1.5 text-sm border border-white/5"
            >
              {tokenImg ? (
                <img
                  src={tokenImg}
                  alt={token.symbol}
                  className="h-5 w-5 rounded-full object-contain"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px]">
                  {token.symbol?.[0]}
                </div>
              )}
              {token.symbol}
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>

            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-1 relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount === "0" ? "" : amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = val.split(".");
                    if (parts.length > 2) return;
                    setAmount(val || "0");
                  }}
                  placeholder="0.00"
                  className={`w-full bg-transparent text-[44px] font-bold text-center focus:outline-none ${
                    isInsufficient ? "text-red-500" : "text-white"
                  } placeholder:text-zinc-600`}
                  style={{ width: `${Math.max(4, amount.length)}ch` }}
                />
              </div>
              <div className="mt-2 text-sm text-zinc-400">{balanceRaw}</div>
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">
                Enter amount
              </span>
              <PenLine className="h-3 w-3 text-violet-500 ml-6" />
            </div>
          </div>
        </section>

        <section className="mt-4 flex flex-wrap gap-3 justify-between">
          {["50", "200", "500"].map((qAmount) => (
            <button
              key={qAmount}
              type="button"
              onClick={() => setAmount(qAmount)}
              className="inline-flex h-8 items-center rounded-full border border-[#AAAAAA] px-4 text-xs text-white hover:bg-white/10 transition-colors"
            >
              ₦{qAmount}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(balanceRaw.toString())}
            className="inline-flex h-8 items-center rounded-full border border-[#AAAAAA] px-4 text-xs text-white hover:bg-white/10 transition-colors"
          >
            Max
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#AAAAAA] text-white hover:bg-white/10 transition-colors"
            aria-label="Scan QR"
          >
            <ScanLine className="h-3 w-3" />
          </button>
        </section>

        <section className="mt-6">
          <p className="text-sm font-medium text-zinc-400 mb-3">Narration</p>
          <div className="rounded-2xl border border-[#C3BDEB] p-3">
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="What's it for ?"
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md bg-[#16171d] px-5 pb-6 pt-3">
        {isInsufficient ? (
          <Button
            type="button"
            disabled
            className="h-14 w-full rounded-2xl text-[17px] font-medium text-red-500 bg-[#ffe5e5] transition-all opacity-100"
          >
            Insufficient funds
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSendClick}
            disabled={!isValid}
            className={`h-14 w-full rounded-2xl text-[17px] font-medium text-white transition-all ${
              isValid
                ? "bg-violet-500 hover:bg-violet-400 opacity-100"
                : "bg-[#C3BDEB] opacity-50 cursor-not-allowed"
            }`}
          >
            Send
          </Button>
        )}
      </div>

      <TokenSearchSheet
        open={tokenSearchOpen}
        onOpenChange={setTokenSearchOpen}
        tokens={tokens}
        onSelectToken={(selectedToken) => {
          setToken(selectedToken);
          setTokenSearchOpen(false);
        }}
      />

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

      <SendPinSheet
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
        onDone={() => setFinalSuccessOpen(true)}
        amount={amount || "10.00"}
        recipientAccount={recipientAccount || "Anderson"}
        bankName={"Feyi Opay"}
        fee="₦0.00"
        date={new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      />

      <FinalSuccessScreen
        open={finalSuccessOpen}
        amount={amount || "10.00"}
        recipientName={recipientAccount || "Anderson"}
        bankName={"Feyi Opay"}
      />
    </div>
  );
}
