"use client";
import React, { useState, useEffect } from "react";

// Using public folder references for SVG assets
const balanceEyeOpen = "/assets/icons/actions/eye-open.svg";
const balanceEyeClosed = "/assets/icons/actions/eye-closed.svg";
const balanceCloseSvg = "/assets/icons/actions/balance-close.svg";
const graphUp = "/assets/icons/actions/graph-up.svg";
const graphDown = "/assets/icons/actions/graph-down.svg";
const dropdownChevron = "/assets/icons/actions/dropdown-chevron.svg";

import { useHomeLayout } from "@/components/layouts/HomeLayout";

interface WalletBalanceCardProps {
  hidden: boolean;
  onToggle: () => void;
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  hidden,
  onToggle,
}) => {
  const { balances, selectedSymbol, onWalletDropdown } = useHomeLayout();
  const isUp = true;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !balances || !balances.tokens || balances.tokens.length === 0) {
    return (
      <div className="bg-[#1f1f1f] rounded-[20px] p-4 flex flex-col gap-1 animate-pulse h-[114px]">
        <div className="text-xs text-[#8b8b93] flex gap-2 items-center">
          Wallet Balance
          <span className="w-16 h-4 bg-[#252525] rounded-full" />
        </div>
        <div className="flex items-center gap-[6px] my-1">
          <div className="w-32 h-8 bg-[#252525] rounded" />
          <div className="w-6 h-6 bg-[#252525] rounded-full" />
        </div>
        <div className="w-20 h-4 bg-[#252525] rounded" />
      </div>
    );
  }

  const activeToken = balances?.tokens?.find(
    (t: any) => t.symbol === selectedSymbol,
  ) || {
    symbol: selectedSymbol,
    name: selectedSymbol === "ETH" ? "Ethereum" : "Multi-Chain",
    balance: "0.00",
    address: "",
  };

  const balanceStr = activeToken.balance.startsWith("$")
    ? activeToken.balance
    : `$${activeToken.balance}`;
  const tokenLabel = activeToken.name;

  const decimalIndex = balanceStr.lastIndexOf(".");
  const hasDecimal = decimalIndex !== -1;
  const wholePart = hasDecimal
    ? balanceStr.substring(0, decimalIndex)
    : balanceStr;
  const rawDecimalPart = hasDecimal ? balanceStr.substring(decimalIndex) : "";
  const decimalPart =
    rawDecimalPart.length > 5 ? rawDecimalPart.substring(0, 5) : rawDecimalPart;

  return (
    <div className="bg-[#1f1f1f] rounded-[20px] p-4 flex flex-col gap-1">
      <div className="text-xs text-[#8b8b93] flex gap-2 items-center">
        Wallet Balance
        <span
          className="text-[11px] text-[#b7b7be] bg-[#2b2b2b] py-[2px] px-2 rounded-full font-medium inline-flex items-center gap-1"
          onClick={onWalletDropdown}
          style={{ cursor: "pointer" }}
        >
          {tokenLabel}
          <img
            src={dropdownChevron}
            alt=""
            width="10"
            height="10"
            className="opacity-60"
          />
        </span>
      </div>
      <div className="flex items-center gap-[6px]">
        {hidden ? (
          <img
            src={balanceCloseSvg}
            alt="Hidden"
            className="h-[35px]"
          />
        ) : (
          <span className="text-[32px] font-extrabold text-[#f3f3f5] tracking-[-1px]">
            {wholePart}
            {hasDecimal && (
              <span className="text-[#777777]">{decimalPart}</span>
            )}
          </span>
        )}
        <button
          className="bg-transparent border-none cursor-pointer flex items-center p-1"
          onClick={onToggle}
          aria-label="Toggle balance"
          type="button"
        >
          <img
            src={hidden ? balanceEyeClosed : balanceEyeOpen}
            alt=""
            width="24"
            height="24"
          />
        </button>
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
        <img src={isUp ? graphUp : graphDown} alt="" width="18" height="18" />
        <span>{hidden ? "••••" : "+0.00%"}</span>
      </div>
    </div>
  );
};

export default WalletBalanceCard;
