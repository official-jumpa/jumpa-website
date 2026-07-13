import React, { useState } from "react";
const closeIcon = "/assets/icons/actions/close.svg";
const copyIcon = "/assets/icons/actions/copy.svg";
const chevronRight = "/assets/icons/actions/chevron-right.svg";
const walletIconImage = "/assets/images/illustrations/wallet.png";

import { type Wallet } from "../../data/wallets";

interface WalletDetailsModalProps {
  wallet: Wallet | null;
  onClose: () => void;
  onPrivateKey: (wallet: Wallet) => void;
}

const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({
  wallet,
  onClose,
  onPrivateKey,
}) => {
  const [copied, setCopied] = useState(false);

  if (!wallet) return null;

  // Handle StaticImageData from next/image
  const walletIcon =
    typeof walletIconImage === "string"
      ? walletIconImage
      : (walletIconImage as any).src ||
        "/assets/images/illustrations/wallet.png";

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: silently fail */
    }
  };

  return (
    <div
      className="absolute top-1/2 left-1/2 w-85.5 h-100 bg-[#0f0f10] rounded-4xl p-6 flex flex-col overflow-visible m-0 animate-[modalScaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards] z-60"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]"
        onClick={onClose}
        aria-label="Close"
        type="button"
      >
        <img
          src={closeIcon}
          alt=""
          width="11.72"
          height="11.72"
          className="opacity-70"
        />
      </button>

      <div className="flex flex-col items-center gap-3 mb-5 mt-2.5">
        <div className="w-22.5 h-21.5 bg-[#1f1f1f] rounded-xl overflow-hidden flex items-center justify-center">
          <img src={walletIcon} alt="" className="w-full h-full object-cover" />
        </div>
        <h3 className="text-lg font-bold text-[#f3f3f5]">
          {wallet.fullAddress.substring(0, 6)}...
          {wallet.fullAddress.substring(wallet.fullAddress.length - 4)}
        </h3>
      </div>

      <div
        className="flex items-center gap-3 bg-[#1f1f1f] rounded-[14px] p-4 my-4 cursor-pointer transition-colors duration-150 ease-out hover:bg-[#252525]"
        onClick={handleCopyAddress}
      >
        <span className="flex-1 text-xs text-[#b7b7be] font-mono break-all text-left leading-[1.4]">
          {wallet.fullAddress}
        </span>
        <button
          className="bg-transparent opacity-60 p-1 flex items-center border-none cursor-pointer"
          aria-label="Copy address"
          type="button"
        >
          <img src={copyIcon} alt="" width="16" height="16" />
        </button>
      </div>
      {copied && (
        <span className="inline-block text-[11px] text-[#22c55e] mb-2 animate-[fadeIn_0.15s_ease_forwards]">
          Copied!
        </span>
      )}

      <div className="text-left mt-5">
        <h4 className="text-sm font-semibold text-[#f3f3f5] mb-3">
          Export Key
        </h4>
        <button
          className="flex items-center justify-between p-4 bg-[#1f1f1f] rounded-[14px] border-none w-full cursor-pointer font-sans text-sm text-[#b7b7be] transition-colors duration-150 ease-out hover:bg-[#252525]"
          onClick={() => onPrivateKey(wallet)}
          type="button"
        >
          <span>Private key</span>
          <img
            src={chevronRight}
            alt=""
            width="16"
            height="16"
            className="opacity-50"
          />
        </button>
      </div>
    </div>
  );
};

export default WalletDetailsModal;
