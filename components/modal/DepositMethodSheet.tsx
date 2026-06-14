import React, { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
const closeIcon = "/assets/icons/actions/close.svg";
const backIcon = "/assets/icons/actions/back.svg";
const sendCircleIcon = "/assets/icons/actions/send-circle.svg";
const sideIcon = "/assets/icons/navigation/side.svg";
const cardIllustration = "/assets/images/illustrations/card.svg";

export interface DepositMethodSheetProps {
  onClose: () => void;
  onSelectBank?: () => void;
  onSelectCrypto?: () => void;
  address?: string;
  selectedSymbol?: string;
}

const BANK_ACCOUNT_DISPLAY = "1235 3458 98";
const BANK_ACCOUNT_COPY_VALUE = BANK_ACCOUNT_DISPLAY;

const DepositMethodSheet: React.FC<DepositMethodSheetProps> = ({
  onClose,
  onSelectBank,
  onSelectCrypto,
  address,
  selectedSymbol,
}) => {
  const [step, setStep] = useState<"methods" | "bank" | "crypto">("methods");
  const [copied, setCopied] = useState(false);

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
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }, [address]);

  if (step === "bank") {
    return (
      <div
        className="deposit-method-sheet deposit-method-sheet-bank"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="deposit-bank-title"
        aria-modal="true"
      >
        <div className="absolute top-3.5 left-[23px] w-[298px] max-w-[calc(100%-46px)] h-[35px] flex items-center justify-between z-10">
          <button
            type="button"
            className="w-[35px] h-[35px] p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
            onClick={goBackToMethods}
            aria-label="Back"
          >
            <img src={backIcon} alt="" className="w-3.5 h-[11px] block" />
          </button>
          <button
            type="button"
            className="w-[35px] h-[35px] p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
            onClick={onClose}
            aria-label="Close"
          >
            <img src={closeIcon} alt="" className="w-[11.72px] h-[11.72px] block opacity-70" />
          </button>
        </div>

        <div className="mt-[85px] mx-4 w-[310px] max-w-[calc(100%-32px)] box-border flex flex-col items-center gap-4">
          <div className="w-full flex justify-center pt-[13.33px] px-[6.67px] pb-0 box-border">
            <img
              src={cardIllustration}
              alt=""
              className="w-[66.67px] h-[53.33px] block object-contain"
              width={67}
              height={54}
            />
          </div>

          <div className="w-[300px] max-w-full min-h-[55px] flex flex-col items-center gap-1.5 text-center">
            <h2 id="deposit-bank-title" className="m-0 font-sans font-bold text-lg leading-[120%] tracking-[-0.02em] text-white">
              Bank Transfer
            </h2>
            <p className="m-0 max-w-[203px] font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#959595]/60">
              Transfer to the account number below.
            </p>
          </div>

          <div className="w-full min-h-[66px] box-border bg-[#2d2d2d] rounded-2xl p-0">
            <div className="w-full max-w-[272px] mx-auto min-h-[39px] py-3.5 px-[19px] box-border flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0 text-left">
                <span className="font-sans font-semibold text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4]">{BANK_ACCOUNT_DISPLAY}</span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">GTBank - Ndukwe Anita</span>
              </div>
              <button
                type="button"
                className={`w-[83px] min-h-[25px] box-border py-1 px-2.5 rounded-[8px] border bg-transparent cursor-pointer font-sans font-normal text-[10px] leading-[145%] tracking-[-0.02em] shrink-0 transition-all duration-150 ease-out hover:opacity-90 ${copied ? "text-[#25ad3e] border-[#25ad3e]" : "text-[#5a5a5a] border-[#aaaaaa]"}`}
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
        className="deposit-method-sheet deposit-method-sheet-crypto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="absolute top-3.5 left-[23px] w-[298px] max-w-[calc(100%-46px)] h-[35px] flex items-center justify-between z-10">
          <button type="button" className="w-[35px] h-[35px] p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]" onClick={goBackToMethods}>
            <img src={backIcon} alt="" className="w-3.5 h-[11px] block" />
          </button>
          <button type="button" className="w-[35px] h-[35px] p-2 border-none rounded-[51.1px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]" onClick={onClose}>
            <img src={closeIcon} alt="" className="w-[11.72px] h-[11.72px] block opacity-70" />
          </button>
        </div>

        <div className="mt-[85px] mx-4 w-[310px] max-w-[calc(100%-32px)] box-border flex flex-col items-center gap-4" style={{ marginTop: 60 }}>
          <div className="w-[300px] max-w-full min-h-[55px] flex flex-col items-center gap-1.5 text-center" style={{ minHeight: "auto" }}>
            <h2 className="m-0 font-sans font-bold text-lg leading-[120%] tracking-[-0.02em] text-white">Receive {selectedSymbol || "Crypto"}</h2>
            <p className="m-0 max-w-[203px] font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#959595]/60 text-center">
              Scan the QR code or copy the address below
            </p>
          </div>

          <div className="my-4 mx-auto flex flex-col items-center justify-center rounded-[20px] bg-white/[0.04] p-6 border border-white/[0.08] w-full box-border">
            <div className="bg-white p-3 rounded-2xl mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <QRCodeSVG value={address || ""} size={160} />
            </div>
            <span className="uppercase text-[10px] tracking-widest text-[#5a5a5a] font-semibold mb-1">Your Wallet Address</span>
            <span className="font-mono text-xs text-white text-center break-all leading-[1.45] max-w-[220px]">
              {address}
            </span>
          </div>

          <div className="w-full min-h-[66px] box-border bg-[#2d2d2d] rounded-2xl p-0">
            <div className="w-full max-w-[272px] mx-auto min-h-[39px] py-3.5 px-[19px] box-border flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0 text-left">
                <span className="font-sans font-semibold text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] break-all">{address}</span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                  Your {selectedSymbol || "EVM"} Address
                </span>
              </div>
              <button
                type="button"
                className={`w-[83px] min-h-[25px] box-border py-1 px-2.5 rounded-[8px] border bg-transparent cursor-pointer font-sans font-normal text-[10px] leading-[145%] tracking-[-0.02em] shrink-0 transition-all duration-150 ease-out hover:opacity-90 ${copied ? "text-[#25ad3e] border-[#25ad3e]" : "text-[#5a5a5a] border-[#aaaaaa]"}`}
                onClick={handleCopyCrypto}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
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
        className="absolute top-3.5 right-[21px] w-[35px] h-[35px] p-2 border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer gap-2 z-10 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
        onClick={onClose}
        aria-label="Close"
      >
        <img src={closeIcon} alt="" width={12} height={12} className="w-[11.72px] h-[11.72px] block opacity-70" />
      </button>

      <div className="flex flex-col items-center w-full pt-14 px-4 pb-5 box-border flex-1 min-h-0">
        <img
          src={sendCircleIcon}
          alt=""
          className="w-20 h-20 shrink-0 block object-contain"
          width={80}
          height={80}
        />

        <div className="w-[300px] max-w-full min-h-[57px] mt-2.5 flex flex-col items-center gap-1.5 text-center">
          <h2 id="deposit-sheet-title" className="m-0 font-sans font-bold text-xl leading-[120%] tracking-[-0.02em] text-white">
            Deposit
          </h2>
          <p className="m-0 max-w-[286px] font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#959595]/60">
            Choose a method below to add funds to your account
          </p>
        </div>

        <div className="w-[310px] max-w-full mt-auto flex flex-col gap-3 pb-1">
          <button type="button" className="w-full h-[66px] box-border border-none rounded-2xl bg-[#2d2d2d] cursor-pointer text-left py-3.5 px-[19px] flex items-center transition-all duration-150 ease-out hover:bg-[#353535] active:opacity-[0.92]" onClick={goToBank}>
            <div className="w-full max-w-[272px] mx-auto flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] font-medium">
                  Bank Transfer
                </span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">
                  Deposit from your bank account.
                </span>
              </div>
              <img src={sideIcon} alt="" className="w-[5px] h-2 shrink-0 object-contain brightness-0 invert opacity-90" />
            </div>
          </button>

          <button
            type="button"
            className="w-full h-[66px] box-border border-none rounded-2xl bg-[#2d2d2d] cursor-pointer text-left py-3.5 px-[19px] flex items-center transition-all duration-150 ease-out hover:bg-[#353535] active:opacity-[0.92]"
            onClick={() => {
                onSelectCrypto?.();
                setStep("crypto");
            }}
          >
            <div className="w-full max-w-[272px] mx-auto flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans text-sm leading-[145%] tracking-[-0.02em] text-[#f4f4f4] font-semibold">
                  Crypto
                </span>
                <span className="font-sans font-normal text-xs leading-[145%] tracking-[-0.02em] text-[#5a5a5a]">Receive crypto coins.</span>
              </div>
              <img src={sideIcon} alt="" className="w-[5px] h-2 shrink-0 object-contain brightness-0 invert opacity-90" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositMethodSheet;
