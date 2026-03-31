import React, { useState } from 'react';
import './Modals.css';
import { useHomeLayout } from '@/components/layouts/HomeLayout';

const closeIcon = '/assets/icons/actions/close.svg';
const copyIcon = '/assets/icons/actions/copy.svg';
const addIcon = '/assets/icons/actions/add.svg';


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
      { symbol: 'FLOW', name: 'Flow (EVM)', balance: '0.00', address: 'Loading...' },
      { symbol: 'ETH', name: 'Ethereum', balance: '0.00', address: 'Loading...' },
      { symbol: 'USDC', name: 'USD Coin', balance: '0.00', address: 'Loading...' },
  ];

  return (
    <div className="modal-sheet modal-wallet-list" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <button className="modal-close" onClick={onClose} aria-label="Close" type="button">
          <img src={closeIcon} alt="" width="11.72" height="11.72" />
        </button>
        <h3 className="modal-title">My Wallets</h3>
        <button className="modal-close" aria-label="Add wallet" type="button">
          <img src={addIcon} alt="" width="11.72" height="11.72" />
        </button>
      </div>
      <p className="modal-subtitle">Select a wallet to view its balance</p>

      <div className="wallet-list">
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
              className={`wallet-row ${isActive ? 'active' : ''}`}
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
              <div className="wallet-row-left">
                <div 
                    className="wallet-row-orb" 
                    style={{ 
                      backgroundColor: 
                        token.symbol === 'ETH' ? '#627EEA' : 
                        token.symbol === 'FLOW' ? '#00EF8B' : 
                        '#2775CA' // USDC Blue
                    }}
                />
                <div className="wallet-row-info">
                  <span className="wallet-row-name">{token.name} ({token.symbol})</span>
                  <div className="wallet-row-addr">
                    <span>{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
                    <button
                      className="wallet-row-copy"
                      onClick={(e) => handleCopy(e, token.address, token.symbol)}
                      aria-label="Copy address"
                      type="button"
                    >
                      <img src={copyIcon} alt="Copy" width="12" height="12" />
                    </button>
                    {copiedSymbol === token.symbol && <span className="copied-toast">Copied!</span>}
                  </div>
                </div>
              </div>
              <span className="wallet-row-balance">
                {wholePart}
                {hasDecimal && <span className="balance-decimal">{decimalPart}</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WalletListModal;
