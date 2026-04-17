import React from "react";

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

  const activeToken = balances?.tokens?.find(
    (t: any) => t.symbol === selectedSymbol,
  ) || {
    symbol: selectedSymbol,
    name: selectedSymbol === "ETH" ? "Ethereum" : "Flow (EVM)",
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
    <div className="balance-card">
      {/* <div className="balance-token-row">
        <div
          className="balance-token-orb"
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: selectedSymbol === "ETH" ? "#627EEA" : "#00EF8B",
          }}
        />
        <span
          className="token-label"
          onClick={onWalletDropdown}
          style={{ cursor: "pointer" }}
        >
          {tokenLabel}
          <img
            src={dropdownChevron}
            alt=""
            width="10"
            height="10"
            className="token-chevron"
          />
        </span>
      </div> */}
      <div className="balance-label">
        Wallet Balance
        <span
          className="token-label"
          onClick={onWalletDropdown}
          style={{ cursor: "pointer" }}
        >
          {tokenLabel}
          <img
            src={dropdownChevron}
            alt=""
            width="10"
            height="10"
            className="token-chevron"
          />
        </span>
      </div>
      <div className="balance-amount-row">
        {hidden ? (
          <img
            src={balanceCloseSvg}
            alt="Hidden"
            className="balance-hidden-img"
          />
        ) : (
          <span className="balance-amount">
            {wholePart}
            {hasDecimal && (
              <span className="balance-decimal">{decimalPart}</span>
            )}
          </span>
        )}
        <button
          className="balance-eye-btn"
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
      <div className={`balance-change ${isUp ? "up" : "down"}`}>
        <img src={isUp ? graphUp : graphDown} alt="" width="18" height="18" />
        <span>{hidden ? "••••" : "+0.00%"}</span>
      </div>
    </div>
  );
};

export default WalletBalanceCard;
