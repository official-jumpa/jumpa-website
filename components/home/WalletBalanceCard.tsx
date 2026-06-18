"use client";
import React, { useState, useEffect, useRef } from "react";
import { useHomeLayout } from "@/components/layouts/HomeLayout";
import { WALLET_ICONS, getChainIcon } from "@/lib/constants/wallet-icons";

// Using public folder references for SVG assets
const balanceEyeOpen = "/assets/icons/actions/eye-open.svg";
const balanceEyeClosed = "/assets/icons/actions/eye-closed.svg";
const balanceCloseSvg = "/assets/icons/actions/balance-close.svg";
const graphUp = "/assets/icons/actions/graph-up.svg";
const graphDown = "/assets/icons/actions/graph-down.svg";
const dropdownChevron = "/assets/icons/actions/dropdown-chevron.svg";

interface WalletBalanceCardProps {
  hidden: boolean;
  onToggle: () => void;
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  hidden,
  onToggle,
}) => {
  const { balances, selectedSymbol, onSelectAsset } = useHomeLayout();
  const [mounted, setMounted] = useState(false);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!chainDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setChainDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [chainDropdownOpen]);

  const handleCopy = (
    e: React.MouseEvent,
    address: string,
    symbol: string
  ) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedSymbol(symbol);
    setTimeout(() => setCopiedSymbol(null), 1500);
  };

  const isUp = true; // Placeholder for future price-change logic

  // Resolve the active token from balances
  const activeToken = balances?.tokens?.find(
    (t: any) => t.symbol === selectedSymbol
  ) || {
    symbol: selectedSymbol,
    name: selectedSymbol === "ETH" ? "Ethereum" : "Multi-Chain",
    balance: "0.00",
    address: "",
  };

  // Format the balance string
  const balanceStr = activeToken.balance.startsWith("$")
    ? activeToken.balance
    : `$${activeToken.balance}`;
  const decimalIndex = balanceStr.lastIndexOf(".");
  const hasDecimal = decimalIndex !== -1;
  const wholePart = hasDecimal
    ? balanceStr.substring(0, decimalIndex)
    : balanceStr;
  const rawDecimalPart = hasDecimal ? balanceStr.substring(decimalIndex) : "";
  const decimalPart =
    rawDecimalPart.length > 5 ? rawDecimalPart.substring(0, 5) : rawDecimalPart;

  // Loading skeleton
  if (
    !mounted ||
    !balances ||
    !balances.tokens ||
    balances.tokens.length === 0
  ) {
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

  return (
    <div className="bg-[#1f1f1f] rounded-[20px] p-4 flex flex-col gap-1 relative">
      {/* Label row: "Wallet Balance" + chain badge dropdown trigger */}
      <div className="text-xs text-[#8b8b93] flex gap-2 items-center">
        Wallet Balance
        <div ref={dropdownRef}>
          <button
            className="flex items-center gap-1 bg-[#2c2c2c] hover:bg-[#353535] border border-[#3a3a3a] rounded-full px-2.5 py-[3px] cursor-pointer transition-colors duration-150"
            onClick={() => setChainDropdownOpen((prev) => !prev)}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={chainDropdownOpen}
          >
            <img
              src={getChainIcon(activeToken.symbol)}
              alt=""
              width="14"
              height="14"
              className="rounded-full"
              style={{ objectFit: "contain" }}
            />
            <span className="text-[11px] font-semibold text-[#d1d1d6]">
              {activeToken.name}
            </span>
            <img
              src={dropdownChevron}
              alt=""
              width="9"
              height="9"
              className={`opacity-60 transition-transform duration-200 ${chainDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
 
          {/* Chain Selector Dropdown Popover */}
          {chainDropdownOpen && (
            <div
              className="absolute top-[48px] left-4 right-4 sm:left-4 sm:right-auto sm:w-[280px] bg-[#1a1a1b] border border-[#2a2a2d] rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
              style={{
                animation: "fadeSlideDown 0.2s cubic-bezier(0.16,1,0.3,1) forwards",
              }}
            >
              {/* Header */}
              <div className="px-4 pt-3.5 pb-2 border-b border-[#2a2a2d]">
                <p className="text-[11px] font-semibold text-[#8b8b93] uppercase tracking-wider">
                  Select Chain
                </p>
              </div>

              {/* Chain List */}
              <div className="flex flex-col py-1.5 max-h-[300px] overflow-y-auto scrollbar-none">
                {balances.tokens.map((token: any) => {
                  const isActive = selectedSymbol === token.symbol;
                  const tBalanceStr = token.balance;
                  const tDecIdx = tBalanceStr.lastIndexOf(".");
                  const tHasDec = tDecIdx !== -1;
                  const tWhole = tHasDec
                    ? tBalanceStr.substring(0, tDecIdx)
                    : tBalanceStr;
                  const tDecimal = tHasDec
                    ? tBalanceStr.substring(tDecIdx, tDecIdx + 5)
                    : "";

                  const truncAddr =
                    token.address && token.address !== "Loading..."
                      ? `${token.address.slice(0, 6)}...${token.address.slice(-4)}`
                      : "Loading...";

                  return (
                    <div
                      key={token.symbol}
                      className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-100 ${isActive ? "bg-[#7c5cfc]/10" : "hover:bg-[#252528]"}`}
                      onClick={() => {
                        onSelectAsset(token.symbol);
                        setChainDropdownOpen(false);
                      }}
                      role="option"
                      aria-selected={isActive}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onSelectAsset(token.symbol);
                          setChainDropdownOpen(false);
                        }
                      }}
                    >
                      {/* Left: icon + name + address */}
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getChainIcon(token.symbol)}
                          alt={token.symbol}
                          className="w-8 h-8 rounded-full shrink-0"
                          style={{
                            objectFit: "contain",
                            backgroundColor: "transparent",
                          }}
                        />
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`text-[13px] font-semibold ${isActive ? "text-[#a78bfa]" : "text-[#f3f3f5]"}`}
                          >
                            {token.name}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-[#6b6b73]">
                            <span>{truncAddr}</span>
                            {token.address &&
                              token.address !== "Loading..." && (
                                <button
                                  className="bg-transparent p-0 flex items-center opacity-40 hover:opacity-80 cursor-pointer border-none"
                                  onClick={(e) =>
                                    handleCopy(e, token.address, token.symbol)
                                  }
                                  aria-label="Copy address"
                                  type="button"
                                >
                                  <img
                                    src={WALLET_ICONS.copy}
                                    alt="Copy"
                                    width="10"
                                    height="10"
                                  />
                                </button>
                              )}
                            {copiedSymbol === token.symbol && (
                              <span className="text-[10px] text-[#22c55e] animate-[fadeIn_0.15s_ease_forwards]">
                                Copied!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: balance + active indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#f3f3f5] whitespace-nowrap">
                          {hidden ? "••••" : tWhole}
                          {!hidden && tHasDec && (
                            <span className="text-[#555]">{tDecimal}</span>
                          )}
                        </span>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-[#7c5cfc] shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Balance amount row */}
      <div className="flex items-center gap-[6px] my-1">
        {hidden ? (
          <img
            src={balanceCloseSvg}
            alt="Hidden"
            className="h-8"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <span className="text-[28px] font-bold text-[#f3f3f5] leading-tight tracking-tight">
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

      {/* Change indicator */}
      <div
        className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-[#22c55e]" : "text-[#ef4444]"}`}
      >
        <img
          src={isUp ? graphUp : graphDown}
          alt=""
          width="18"
          height="18"
        />
        <span>{hidden ? "••••" : "+0.00%"}</span>
      </div>

    </div>
  );
};

export default WalletBalanceCard;
