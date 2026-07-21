import React, { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../ui/button";
const closeIcon = "/assets/icons/actions/close.svg";
const backIcon = "/assets/icons/actions/back.svg";
const receiveCircleIcon = "/assets/icons/actions/receive-circle.svg";
const sideIcon = "/assets/icons/navigation/side.svg";
const cardIllustration = "/assets/images/illustrations/card.svg";
const chevronDownIcon = "/assets/icons/actions/chevron-down.svg";
const usdcIcon = "/coins/usdc.svg";
const usdtIcon = "/coins/usdt.svg";

export interface DepositMethodSheetProps {
  onClose: () => void;
  onSelectBank?: () => void;
  onSelectCrypto?: () => void;
  addresses?: { eth: string; base: string; sol: string; xlm: string };
  selectedSymbol?: string;
}

const BANK_ACCOUNT_DISPLAY = "1235 3458 98";
const BANK_ACCOUNT_COPY_VALUE = BANK_ACCOUNT_DISPLAY;

const DepositMethodSheet: React.FC<DepositMethodSheetProps> = ({
  onClose,
  onSelectBank,
  onSelectCrypto,
  addresses,
  selectedSymbol,
}) => {
  const [step, setStep] = useState<
    "methods" | "bank" | "chain-select" | "crypto"
  >("methods");
  const [copied, setCopied] = useState(false);
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [selectedToken, setSelectedToken] = useState<{
    symbol: string;
    icon?: string;
    color: string;
    hexagon?: boolean;
  } | null>(null);
  const [chainsExpanded, setChainsExpanded] = useState(false);
  const [chainSelectMode, setChainSelectMode] = useState<"bank" | "crypto">(
    "crypto",
  );

  const EVM_CHAIN_IDS = ["ethereum", "base", "bnb", "polygon", "arbitrum", "optimism", "celo"];

  const resolvedAddress =
    EVM_CHAIN_IDS.includes(selectedChain) ? (addresses?.eth || addresses?.base || "")
    : selectedChain === "solana"          ? (addresses?.sol || "")
    : selectedChain === "stellar"         ? (addresses?.xlm || "")
    : "";

  const CHAINS = [
    { id: "ethereum", label: "Ethereum" },
    { id: "base", label: "Base" },
    { id: "bnb", label: "BNB Chain" },
    { id: "polygon", label: "Polygon" },
    { id: "arbitrum", label: "Arbitrum" },
    { id: "optimism", label: "Optimism" },
    { id: "celo", label: "Celo" },
    { id: "solana", label: "Solana" },
    { id: "stellar", label: "Stellar" },
  ];

  const CHAINS_COLLAPSED_COUNT = 5;
  const visibleChains = chainsExpanded
    ? CHAINS
    : CHAINS.slice(0, CHAINS_COLLAPSED_COUNT);

  const TOKEN_LIST = [
    { symbol: "USDC", icon: usdcIcon, color: "#2775CA" },
    { symbol: "USDT", icon: usdtIcon, color: "#26A17B" },
    { symbol: "$NIM", color: "#E9B213", hexagon: true },
  ];

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const goToBank = useCallback(() => {
    onSelectBank?.();
    setStep("bank");
    setCopied(false);
  }, [onSelectBank]);

  const goBackToMethods = useCallback(() => {
    setStep("methods");
    setCopied(false);
    setSelectedToken(null);
    setSelectedChain("ethereum");
    setChainsExpanded(false);
  }, []);

  const handleCopyNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT_COPY_VALUE);
      setCopied(true);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = BANK_ACCOUNT_COPY_VALUE;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleCopyCrypto = useCallback(async () => {
    if (!resolvedAddress) return;
    try {
      await navigator.clipboard.writeText(resolvedAddress);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }, [resolvedAddress]);

  if (step === "chain-select") {
    return (
      <div
        className="deposit-method-sheet deposit-method-sheet-default"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="deposit-chain-title"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute top-3.5 right-5.25 w-8.75 h-8.75 p-2 border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer gap-2 z-10 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
          onClick={onClose}
          aria-label="Close"
        >
          <img
            src={closeIcon}
            alt=""
            width={12}
            height={12}
            className="w-[11.72px] h-[11.72px] block opacity-70"
          />
        </button>

        <div className="flex flex-col w-full pt-14 px-5 pb-5 box-border flex-1 min-h-0">
          {/* Title */}
          <h2
            id="deposit-chain-title"
            className="m-0 font-sans font-bold text-[22px] leading-[120%] tracking-[-0.02em] text-white mb-5"
          >
            Select Chain
          </h2>

          {/* Chain pills */}
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            {visibleChains.map((chain) => {
              const isSelected = selectedChain === chain.id;
              return (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => setSelectedChain(chain.id)}
                  className={`px-3.5 py-1.5 rounded-full font-sans text-[11px] font-normal border-none cursor-pointer transition-all duration-150 ease-out shrink-0 ${
                    isSelected
                      ? "bg-[#F0EEFA] text-[#6A59CE]"
                      : "bg-[#2D2D2D] text-[#D5D5D5] hover:bg-[#3a3a3a]"
                  }`}
                >
                  {chain.label}
                </button>
              );
            })}
            {/* Expand/collapse chevron */}
            <button
              type="button"
              onClick={() => setChainsExpanded((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-[#2d2d2d] flex items-center justify-center cursor-pointer border-none shrink-0 hover:bg-[#3a3a3a] transition-colors duration-150 ease-out"
              aria-label={
                chainsExpanded ? "Show fewer chains" : "Show all chains"
              }
            >
              <img
                src={chevronDownIcon}
                alt=""
                className={`w-3.5 h-3.5 block opacity-70 transition-transform duration-200 ${chainsExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Token list */}
          <div className="flex flex-col gap-1">
            {TOKEN_LIST.map((token, i) => {
              const isFirst = i === 0;
              return (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => {
                    setSelectedToken(token);
                    setCopied(false);
                    setStep(chainSelectMode === "bank" ? "bank" : "crypto");
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl border-none cursor-pointer text-left transition-all duration-150 ease-out ${
                    isFirst
                      ? "bg-[#2d2d2d]"
                      : "bg-transparent hover:bg-[#2d2d2d]/60"
                  }`}
                >
                  {/* Token icon */}
                  {token.icon ? (
                    <img
                      src={token.icon}
                      alt={token.symbol}
                      className="w-9 h-9 shrink-0 rounded-full object-contain"
                    />
                  ) : token.hexagon ? (
                    <div
                      className="w-9 h-9 shrink-0 flex items-center justify-center"
                      style={{
                        clipPath:
                          "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        backgroundColor: token.color,
                      }}
                    >
                      <span className="font-bold text-sm text-black">N</span>
                    </div>
                  ) : (
                    <div
                      className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: token.color }}
                    >
                      <span className="font-bold text-sm text-white">
                        {token.symbol[0]}
                      </span>
                    </div>
                  )}
                  <span className="font-sans font-semibold text-[15px] text-white">
                    {token.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (step === "bank") {
    return (
      <div
        className="deposit-method-sheet deposit-method-sheet-bank"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="deposit-bank-title"
        aria-modal="true"
      >
        <div className="absolute top-3.5 left-5.75 w-74.5 max-w-[calc(100%-46px)] h-8.75 flex items-center justify-between z-10">
          <button
            type="button"
            className="w-8.75 h-8.75 p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
            onClick={() => setStep("chain-select")}
            aria-label="Back"
          >
            <img src={backIcon} alt="" className="w-3.5 h-2.75 block" />
          </button>
          <button
            type="button"
            className="w-8.75 h-8.75 p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
            onClick={onClose}
            aria-label="Close"
          >
            <img
              src={closeIcon}
              alt=""
              className="w-[11.72px] h-[11.72px] block opacity-70"
            />
          </button>
        </div>

        <div className="mt-21.25 mx-4 w-77.5 max-w-[calc(100%-32px)] box-border flex flex-col items-center gap-4">
          <div className="w-full flex justify-center pt-[13.33px] px-[6.67px] pb-0 box-border">
            <img
              src={cardIllustration}
              alt=""
              className="w-[66.67px] h-[53.33px] block object-contain"
              width={67}
              height={54}
            />
          </div>

          <div className="w-75 max-w-full min-h-13.75 flex flex-col items-center gap-1.5 text-center">
            <h2
              id="deposit-bank-title"
              className="m-0 font-sans font-bold text-lg leading-[120%] tracking-[-0.02em] text-white"
            >
              Bank Transfer
            </h2>
            <p className="m-0 max-w-50.75 font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#959595]/60">
              Transfer to the account number below.
            </p>
          </div>

          <div className="w-full min-h-16.5 box-border bg-[#2d2d2d] rounded-2xl p-0">
            <div className="w-full max-w-68 mx-auto min-h-9.75 py-3.5 px-4.75 box-border flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0 text-left">
                <span className="font-sans font-semibold text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4]">
                  {BANK_ACCOUNT_DISPLAY}
                </span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                  GTBank - Ndukwe Anita
                </span>
              </div>
              <button
                type="button"
                className={`w-20.75 min-h-6.25 box-border py-1 px-2.5 rounded-lg border bg-transparent cursor-pointer font-sans font-normal text-[10px] leading-[145%] tracking-[-0.02em] shrink-0 transition-all duration-150 ease-out hover:opacity-90 ${copied ? "text-[#25ad3e] border-[#25ad3e]" : "text-[#5a5a5a] border-[#aaaaaa]"}`}
                onClick={handleCopyNumber}
                aria-live="polite"
              >
                {copied ? "Copied" : "Copy Number"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "crypto") {
    return (
      <div
        className="deposit-method-sheet deposit-method-sheet-crypto bg-[#2D2D2D]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="absolute top-3.5 left-5.75 w-74.5 max-w-[calc(100%-46px)] h-8.75 flex items-center justify-between z-10">
          <button
            type="button"
            className="w-8.75 h-8.75 p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
            onClick={() => setStep("chain-select")}
          >
            <img src={backIcon} alt="" className="w-3.5 h-2.75 block" />
          </button>
          <button
            type="button"
            className="w-8.75 h-8.75 p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
            onClick={onClose}
          >
            <img
              src={closeIcon}
              alt=""
              className="w-[11.72px] h-[11.72px] block opacity-70"
            />
          </button>
        </div>

        <div
          className="mt-21.25 mx-4 w-77.5 max-w-[calc(100%-32px)] box-border flex flex-col items-center gap-4"
          style={{ marginTop: 60 }}
        >
          <div
            className="w-75 max-w-full min-h-13.75 flex flex-col items-center gap-1.5 text-center"
            style={{ minHeight: "auto" }}
          >
            <h2 className="m-0 font-sans font-bold text-lg leading-[120%] tracking-[-0.02em] text-white">
              Scan QR code
            </h2>
            <p className="m-0 max-w-50.75 font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#959595]/60 text-center">
              Scan the QR code or copy the address below
            </p>
          </div>

          <div className="my-4 mx-auto flex flex-col items-center justify-center rounded-[20px] bg-white/4 p-6 border border-white/8 w-full box-border">
            <div className="bg-white p-3 rounded-2xl mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <QRCodeSVG value={resolvedAddress} size={160} />
            </div>
            <span className="font-mono text-xs text-[#777777] text-center break-all leading-[1.45] max-w-55">
              {resolvedAddress}
            </span>
            <button
              type="button"
              className={`box-border py-1 px-2.5 rounded-full bg-[#1F1F1F] cursor-pointer font-sans font-normal text-[10px] leading-[145%] tracking-[-0.02em] shrink-0 transition-all duration-150 ease-out hover:opacity-90 ${copied ? "text-[#25ad3e] bg-[#E6F6E9]" : "text-[#5a5a5a]"}`}
              onClick={handleCopyCrypto}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <Button
            type="button"
            className="h-14 w-full rounded-2xl text-[17px] font-medium text-white transition-all bg-violet-500 hover:bg-violet-400 opacity-100 mb-5"
          >
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="deposit-method-sheet deposit-method-sheet-default"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-labelledby="deposit-sheet-title"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute top-3.5 right-5.25 w-8.75 h-8.75 p-2 border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer gap-2 z-10 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
        onClick={onClose}
        aria-label="Close"
      >
        <img
          src={closeIcon}
          alt=""
          width={12}
          height={12}
          className="w-[11.72px] h-[11.72px] block opacity-70"
        />
      </button>

      <div className="flex flex-col items-center w-full pt-14 px-4 pb-5 box-border flex-1 min-h-0">
        <img
          src={receiveCircleIcon}
          alt=""
          className="w-20 h-20 shrink-0 block object-contain"
          width={80}
          height={80}
        />

        <div className="w-75 max-w-full min-h-14.25 mt-2.5 flex flex-col items-center gap-1.5 text-center">
          <h2
            id="deposit-sheet-title"
            className="m-0 font-sans font-bold text-xl leading-[120%] tracking-[-0.02em] text-white"
          >
            Deposit
          </h2>
          <p className="m-0 max-w-71.5 font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#959595]/60">
            Choose a method below to add funds to your account
          </p>
        </div>

        <div className="w-77.5 max-w-full mt-auto flex flex-col gap-3 pb-1">
          <button
            type="button"
            className="w-full h-16.5 box-border border-none rounded-2xl bg-[#2d2d2d] cursor-pointer text-left py-3.5 px-4.75 flex items-center transition-all duration-150 ease-out hover:bg-[#353535] active:opacity-[0.92]"
            onClick={() => {
              onSelectBank?.();
              setChainSelectMode("bank");
              setCopied(false);
              setStep("chain-select");
            }}
          >
            <div className="w-full max-w-68 mx-auto flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] font-medium">
                  Bank Transfer
                </span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                  Deposit from your bank account.
                </span>
              </div>
              <img
                src={sideIcon}
                alt=""
                className="w-1.25 h-2 shrink-0 object-contain brightness-0 invert opacity-90"
              />
            </div>
          </button>

          <button
            type="button"
            className="w-full h-16.5 box-border border-none rounded-2xl bg-[#2d2d2d] cursor-pointer text-left py-3.5 px-4.75 flex items-center transition-all duration-150 ease-out hover:bg-[#353535] active:opacity-[0.92]"
            onClick={() => {
              onSelectCrypto?.();
              setChainSelectMode("crypto");
              setStep("chain-select");
            }}
          >
            <div className="w-full max-w-68 mx-auto flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] font-semibold">
                  Crypto
                </span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                  Receive crypto coins.
                </span>
              </div>
              <img
                src={sideIcon}
                alt=""
                className="w-1.25 h-2 shrink-0 object-contain brightness-0 invert opacity-90"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositMethodSheet;
