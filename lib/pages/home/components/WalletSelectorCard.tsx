import React, { useState } from "react";

// Using public folder references for SVG assets
const chevronDown = "/assets/icons/actions/chevron-down.svg";
const copyIcon = "/assets/icons/actions/copy.svg";

import { useHomeLayout } from "@/components/layouts/HomeLayout";

interface WalletSelectorCardProps {
  onDropdown: () => void;
}

const WalletSelectorCard: React.FC<WalletSelectorCardProps> = ({
  onDropdown,
}) => {
  const { balances, selectedSymbol } = useHomeLayout();
  const [copied, setCopied] = useState(false);

  const activeToken = balances?.tokens?.find(
    (t: any) => t.symbol === selectedSymbol,
  ) || {
    symbol: selectedSymbol,
    name: selectedSymbol === "ETH" ? "Ethereum" : "Multi-Chain",
    address: "Fetching...",
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
    <div className="wallet-selector">
      <div className="wallet-selector-left">
        <div
          className="wallet-orb"
          style={{
            backgroundColor: selectedSymbol === "ETH" ? "#627EEA" : "#00EF8B",
          }}
        />
        <div className="wallet-info">
          <span className="wallet-name">{activeToken.name} Wallet</span>
          <div className="wallet-address-row">
            <span className="wallet-address">{truncatedAddress}</span>
            <button
              className="wallet-copy-btn"
              onClick={handleCopy}
              aria-label="Copy address"
              type="button"
            >
              <img src={copyIcon} alt="Copy" width="14" height="14" />
            </button>
            {copied && <span className="copied-toast">Copied!</span>}
          </div>
        </div>
      </div>
      <button
        className="wallet-dropdown-btn"
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
