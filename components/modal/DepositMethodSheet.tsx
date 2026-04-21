import React, { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./DepositMethodSheet.css";
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
        className="deposit-method-sheet deposit-method-sheet--bank"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="deposit-bank-title"
        aria-modal="true"
      >
        <div className="deposit-bank-topbar">
          <button
            type="button"
            className="deposit-sheet-icon-btn"
            onClick={goBackToMethods}
            aria-label="Back"
          >
            <img src={backIcon} alt="" className="deposit-sheet-back-icon" />
          </button>
          <button
            type="button"
            className="deposit-sheet-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <img src={closeIcon} alt="" className="deposit-method-sheet-close-icon" />
          </button>
        </div>

        <div className="deposit-bank-main">
          <div className="deposit-bank-card-wrap">
            <img
              src={cardIllustration}
              alt=""
              className="deposit-bank-card-icon"
              width={67}
              height={54}
            />
          </div>

          <div className="deposit-bank-headings">
            <h2 id="deposit-bank-title" className="deposit-bank-title">
              Bank Transfer
            </h2>
            <p className="deposit-bank-subtitle">
              Transfer to the account number below.
            </p>
          </div>

          <div className="deposit-bank-account-card">
            <div className="deposit-bank-account-row">
              <div className="deposit-bank-account-texts">
                <span className="deposit-bank-account-number">{BANK_ACCOUNT_DISPLAY}</span>
                <span className="deposit-bank-account-meta">GTBank - Ndukwe Anita</span>
              </div>
              <button
                type="button"
                className={`deposit-bank-copy-btn${copied ? " is-copied" : ""}`}
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
        className="deposit-method-sheet deposit-method-sheet--bank deposit-method-sheet--crypto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="deposit-bank-topbar">
          <button type="button" className="deposit-sheet-icon-btn" onClick={goBackToMethods}>
            <img src={backIcon} alt="" className="deposit-sheet-back-icon" />
          </button>
          <button type="button" className="deposit-sheet-icon-btn" onClick={onClose}>
            <img src={closeIcon} alt="" className="deposit-method-sheet-close-icon" />
          </button>
        </div>

        <div className="deposit-bank-main" style={{ marginTop: 60 }}>
          <div className="deposit-bank-headings" style={{ minHeight: "auto" }}>
            <h2 className="deposit-bank-title">Receive {selectedSymbol || "Crypto"}</h2>
            <p className="deposit-bank-subtitle text-center">
              Scan the QR code or copy the address below
            </p>
          </div>

          <div className="deposit-qr-wrapper">
            <div className="deposit-qr-code-box">
              <QRCodeSVG value={address || ""} size={160} />
            </div>
            <span className="deposit-qr-label">Your Wallet Address</span>
            <span className="deposit-qr-address">
              {address}
            </span>
          </div>

          <div className="deposit-bank-account-card">
            <div className="deposit-bank-account-row">
              <div className="deposit-bank-account-texts">
                <span className="deposit-bank-account-number text-sm break-all">{address}</span>
                <span className="deposit-bank-account-meta">
                  Your {selectedSymbol || "EVM"} Address
                </span>
              </div>
              <button
                type="button"
                className={`deposit-bank-copy-btn${copied ? " is-copied" : ""}`}
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
      className="deposit-method-sheet"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-labelledby="deposit-sheet-title"
      aria-modal="true"
    >
      <button
        type="button"
        className="deposit-method-sheet-close"
        onClick={onClose}
        aria-label="Close"
      >
        <img src={closeIcon} alt="" width={12} height={12} className="deposit-method-sheet-close-icon" />
      </button>

      <div className="deposit-method-sheet-body">
        <img
          src={sendCircleIcon}
          alt=""
          className="deposit-method-sheet-icon"
          width={80}
          height={80}
        />

        <div className="deposit-method-sheet-headings">
          <h2 id="deposit-sheet-title" className="deposit-method-sheet-title">
            Deposit
          </h2>
          <p className="deposit-method-sheet-subtitle">
            Choose a method below to add funds to your account
          </p>
        </div>

        <div className="deposit-method-sheet-cards">
          <button type="button" className="deposit-method-card" onClick={goToBank}>
            <div className="deposit-method-card-row">
              <div className="deposit-method-card-texts">
                <span className="deposit-method-card-title deposit-method-card-title--medium">
                  Bank Transfer
                </span>
                <span className="deposit-method-card-desc">
                  Deposit from your bank account.
                </span>
              </div>
              <img src={sideIcon} alt="" className="deposit-method-card-chevron" />
            </div>
          </button>

          <button
            type="button"
            className="deposit-method-card"
            onClick={() => {
                onSelectCrypto?.();
                setStep("crypto");
            }}
          >
            <div className="deposit-method-card-row">
              <div className="deposit-method-card-texts">
                <span className="deposit-method-card-title deposit-method-card-title--semibold">
                  Crypto
                </span>
                <span className="deposit-method-card-desc">Receive crypto coins.</span>
              </div>
              <img src={sideIcon} alt="" className="deposit-method-card-chevron" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositMethodSheet;
