"use client";
import React, { useState, useEffect } from "react";
import { useHomeLayout } from "@/components/layouts/HomeLayout";
import { WALLET_ICONS, getChainIcon } from "@/lib/constants/wallet-icons";

const chevronDown = "/assets/icons/actions/chevron-down.svg";


interface WalletSelectorCardProps {
  onDropdown: () => void;
}

const WalletSelectorCard: React.FC<WalletSelectorCardProps> = ({
  onDropdown,
}) => {
  const { balances, selectedSymbol, activeWallet } = useHomeLayout();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !balances || !balances.tokens || balances.tokens.length === 0) {
    return (
      <div className="flex justify-between items-center py-3 px-4 bg-[#1f1f1f] rounded-[20px] animate-pulse h-[64px]">
        <div className="flex items-center gap-[6px]">
          <div className="w-10 h-10 rounded-full bg-[#252525]" />
          <div className="flex flex-col gap-[6px] flex-1">
            <div className="w-24 h-4 bg-[#252525] rounded" />
            <div className="w-32 h-3 bg-[#252525] rounded" />
          </div>
        </div>
        <div className="w-4 h-2 bg-[#252525] rounded" />
      </div>
    );
  }

  const symbolKey = selectedSymbol.toLowerCase() as "eth" | "base" | "sol" | "xlm";
  const fallbackAddress = balances?.addresses?.[symbolKey] || balances?.address || "Fetching...";

  const activeToken = balances?.tokens?.find(
    (t: any) => t.symbol === selectedSymbol,
  ) || {
    symbol: selectedSymbol,
    name: selectedSymbol === "ETH" ? "Ethereum" : "Multi-Chain",
    address: fallbackAddress,
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeToken.address === "Fetching...") return;
    navigator.clipboard.writeText(activeToken.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const truncatedAddress =
    activeToken.address.length > 15
      ? `${activeToken.address.slice(0, 6)}...${activeToken.address.slice(-4)}`
      : activeToken.address;

  return (
    <div className="flex justify-between items-center py-3 px-4 bg-[#1f1f1f] rounded-[20px] transition-colors duration-150 ease-out hover:bg-[#252525]">
      <div className="flex items-center gap-[6px]">
        <img
          className="w-10 h-10 rounded-full"
          src={getChainIcon(activeToken.symbol)}
          alt={activeToken.symbol}
          style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
        />
        <div className="flex flex-col gap-[2px] flex-1">
          <span className="text-sm font-semibold text-[#f3f3f5]">{activeWallet?.name || activeToken.name}</span>
          <div className="flex items-center gap-[6px]">
            <span className="text-xs text-[#8b8b93]">{truncatedAddress}</span>
            <button
              className="bg-transparent border-none cursor-pointer p-[2px] flex items-center opacity-50 hover:opacity-80 transition-opacity"
              onClick={handleCopy}
              aria-label="Copy address"
              type="button"
            >
              <img src={WALLET_ICONS.copy} alt="Copy" width="14" height="14" />
            </button>
            {copied && <span className="text-[10px] text-[#22c55e] font-medium animate-[fadeIn_0.15s_ease_forwards]">Copied!</span>}
          </div>
        </div>
      </div>
      <button
        className="bg-transparent border-none cursor-pointer p-2 flex items-center opacity-60"
        onClick={onDropdown}
        aria-label="Switch wallet"
        type="button"
      >
        <img src={chevronDown} alt="" width="10.21" height="6.44" />
      </button>
    </div>
  );
};

export default WalletSelectorCard;
