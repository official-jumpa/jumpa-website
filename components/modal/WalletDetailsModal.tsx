import React, { useState } from 'react';
import './Modals.css';
const closeIcon = '/assets/icons/actions/close.svg';
const copyIcon = '/assets/icons/actions/copy.svg';
const chevronRight = '/assets/icons/actions/chevron-right.svg';
const walletIconImage = '/assets/images/illustrations/wallet.png';

import { type Wallet } from '../../data/wallets';

interface WalletDetailsModalProps {
  wallet: Wallet | null;
  onClose: () => void;
  onPrivateKey: (wallet: Wallet) => void;
}

const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({ wallet, onClose, onPrivateKey }) => {
  const [copied, setCopied] = useState(false);

  if (!wallet) return null;

  // Handle StaticImageData from next/image
  const walletIcon = typeof walletIconImage === 'string' ? walletIconImage : (walletIconImage as any).src || '/assets/images/illustrations/wallet.png';

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
    <div className="modal-sheet modal-details" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close details-close" onClick={onClose} aria-label="Close" type="button">
        <img src={closeIcon} alt="" width="11.72" height="11.72" />
      </button>

      <div className="details-hero">
        <div className="details-card-avatar">
          <img src={walletIcon} alt="" />
        </div>
        <h3 className="details-wallet-name">{wallet.fullAddress.substring(0, 6)}...{wallet.fullAddress.substring(wallet.fullAddress.length - 4)}</h3>
      </div>

      <div className="details-address-box" onClick={handleCopyAddress}>
        <span className="details-address">{wallet.fullAddress}</span>
        <button className="details-copy-btn" aria-label="Copy address" type="button">
          <img src={copyIcon} alt="" width="16" height="16" />
        </button>
      </div>
      {copied && <span className="copy-toast">Copied!</span>}

      <div className="details-section">
        <h4 className="details-section-title">Export Key</h4>
        <button className="details-key-row" onClick={() => onPrivateKey(wallet)} type="button">
          <span>Private key</span>
          <img src={chevronRight} alt="" width="16" height="16" />
        </button>
      </div>
    </div>
  );
};

export default WalletDetailsModal;
