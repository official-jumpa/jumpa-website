import React, { useState } from 'react';
import { useHomeLayout } from '@/components/layouts/HomeLayout';

import { WALLET_ICONS, getChainIcon } from '@/lib/constants/wallet-icons';

interface WalletListModalProps {
  onClose: () => void;
}

const WalletListModal: React.FC<WalletListModalProps> = ({ onClose }) => {
  const { balances, onSelectAsset, selectedSymbol } = useHomeLayout();
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, address: string, symbol: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedSymbol(symbol);
    setTimeout(() => setCopiedSymbol(null), 1500);
  };

  const tokens = balances?.tokens || [
      { symbol: 'SOL', name: 'Solana', balance: '0.00', address: 'Loading...' },
      { symbol: 'ETH-BASE', name: 'Base Mainnet', balance: '0.00', address: 'Loading...' },
      { symbol: 'XLM', name: 'Stellar', balance: '0.00', address: 'Loading...' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#0f0f10] rounded-t-[32px] pt-5 px-4 pb-8 z-[60] max-h-[85%] min-h-[400px] flex flex-col overflow-y-auto scrollbar-none animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards]" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-2">
        <button className="w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]" onClick={onClose} aria-label="Close" type="button">
          <img src={WALLET_ICONS.close} alt="" width="11.72" height="11.72" className="opacity-70" />
        </button>
        <h3 className="text-[17px] font-bold text-[#f3f3f5] flex-1 text-center">My Wallets</h3>
        <button className="w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]" aria-label="Add wallet" type="button">
          <img src={WALLET_ICONS.add} alt="" width="11.72" height="11.72" className="opacity-70" />
        </button>
      </div>
      <p className="text-xs text-[#8b8b93] text-center mb-5">Select a wallet to view its balance</p>

      <div className="flex flex-col gap-3 mt-[25px] flex-1 overflow-y-auto scrollbar-none pb-8 px-0.5">
        {tokens.map((token) => {
          const balanceStr = token.balance;
          const decimalIndex = balanceStr.lastIndexOf('.');
          const hasDecimal = decimalIndex !== -1;
          const wholePart = hasDecimal ? balanceStr.substring(0, decimalIndex) : balanceStr;
          const decimalPart = hasDecimal ? balanceStr.substring(decimalIndex, decimalIndex + 5) : '';
          const isActive = selectedSymbol === token.symbol;

          return (
            <div
              key={token.symbol}
              className={`flex items-center justify-between py-3 px-4 bg-[#1f1f1f] rounded-[14px] cursor-pointer transition-colors duration-150 ease-out w-full hover:bg-[#252525] ${isActive ? 'ring-1 ring-[#7c5cfc]' : ''}`}
              onClick={() => {
                onSelectAsset(token.symbol);
                onClose();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectAsset(token.symbol);
                  onClose();
                }
              }}
            >
              <div className="flex items-center gap-2">
                <img
                  className="w-10 h-10 rounded-full shrink-0"
                  src={getChainIcon(token.symbol)}
                  alt={token.symbol}
                  style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
                />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-semibold text-[#f3f3f5]">{token.name} ({token.symbol})</span>
                  <div className="flex items-center gap-1 text-[11px] text-[#8b8b93]">
                    <span>{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
                    <button
                      className="bg-transparent p-0.5 flex items-center opacity-50 hover:opacity-80 cursor-pointer border-none"
                      onClick={(e) => handleCopy(e, token.address, token.symbol)}
                      aria-label="Copy address"
                      type="button"
                    >
                      <img src={WALLET_ICONS.copy} alt="Copy" width="12" height="12" />
                    </button>
                    {copiedSymbol === token.symbol && <span className="text-[11px] text-[#22c55e] ml-2 animate-[fadeIn_0.15s_ease_forwards]">Copied!</span>}
                  </div>
                </div>
              </div>
              <span className="text-base font-bold text-[#f3f3f5] whitespace-nowrap">
                {wholePart}
                {hasDecimal && <span className="text-[#777777]">{decimalPart}</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WalletListModal;
