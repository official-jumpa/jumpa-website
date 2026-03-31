import { useState } from 'react';
const clipboardIcon = '/assets/icons/actions/clipboard.svg';;
const closeIcon = '/assets/icons/actions/close.svg';;
const closeCircleDashIcon = '/assets/icons/actions/close_circle_dash_line.svg';;
import './BorrowEntryScreen.css';

interface BorrowEntryScreenProps {
  onContinue: () => void;
  onPasteAddress: () => Promise<string>;
  onChangeNetwork: () => void;
  depositBalanceLabel: string;
  usdcBalance: string;
}

export default function BorrowEntryScreen({
  onContinue,
  onPasteAddress,
  onChangeNetwork,
  depositBalanceLabel,
  usdcBalance,
}: BorrowEntryScreenProps) {
  const [showBanner, setShowBanner] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'invalid' | 'valid'>('idle');
  const [showNoBalanceHints, setShowNoBalanceHints] = useState(false);
  const [showSecondHint, setShowSecondHint] = useState(false);

  const handleAddressChange = (value: string) => {
    setWalletAddress(value);
    setShowNoBalanceHints(false);
    setShowSecondHint(false);
    if (value.length === 0) {
      setValidationStatus('idle');
    } else if (value.length < 10) {
      setValidationStatus('invalid');
    } else {
      setValidationStatus('valid');
    }
  };

  const handlePaste = async () => {
    const pastedValue = await onPasteAddress();
    if (pastedValue) {
      handleAddressChange(pastedValue);
    }
  };

  const handleContinueClick = () => {
    if (validationStatus === 'valid') {
      if (usdcBalance.startsWith('0')) {
        if (!showNoBalanceHints) {
          setShowNoBalanceHints(true);
        } else {
          setShowSecondHint(true);
        }
      } else {
        onContinue();
      }
    }
  };

  const handleClear = () => {
    handleAddressChange('');
  };

  return (
    <div className="borrow-entry-screen">
      {showBanner && (
        <div className="borrow-entry-banner">
          <button
            type="button"
            className="borrow-entry-banner-close"
            onClick={() => setShowBanner(false)}
            aria-label="Close banner"
          >
            <img src={closeCircleDashIcon} alt="" />
          </button>
          <p className="borrow-entry-banner-text">
            Low interest rate, no credit checks and instant approval using your crypto as collateral.
          </p>
        </div>
      )}

      <div className="borrow-entry-input-card">
        <div className="borrow-entry-input-labels">
          <div className="borrow-entry-input-header">
            <p className="borrow-entry-input-label">Address or .Tag handle</p>
            {(validationStatus === 'invalid' || validationStatus === 'valid') && (
              <button type="button" className="borrow-entry-clear-btn" onClick={handleClear}>
                <img src={closeIcon} alt="Clear" width="8.03" height="8.03" />
              </button>
            )}
          </div>
          
          <div className="borrow-entry-input-wrapper">
            <input
              type="text"
              className="borrow-entry-input-placeholder"
              value={walletAddress}
              placeholder="Enter wallet address or .tag handle"
              onChange={(e) => handleAddressChange(e.target.value)}
              aria-label="Wallet address"
            />
            {validationStatus === 'valid' && (
              <div className="borrow-entry-recipient-tag">
                <span className="borrow-entry-new-label">New address</span>
              </div>
            )}
          </div>
          
          {validationStatus === 'invalid' && (
            <span className="borrow-entry-error-text">Invalid address</span>
          )}
        </div>

        <div className="borrow-entry-input-actions">
          <button
            type="button"
            className={`borrow-entry-input-btn borrow-entry-input-btn--primary ${
              validationStatus !== 'valid' ? 'is-disabled' : ''
            }`}
            onClick={handleContinueClick}
            disabled={validationStatus !== 'valid'}
          >
            Continue
          </button>
          <div className="borrow-entry-secondary-actions">
            <button
              type="button"
              className="borrow-entry-input-btn borrow-entry-input-btn--secondary"
              onClick={handlePaste}
            >
              <span>Paste</span>
              <img src={clipboardIcon} alt="" />
            </button>
            {validationStatus === 'valid' && (
              <span className="borrow-entry-available-inline">Available USDC : {usdcBalance}</span>
            )}
          </div>
        </div>
      </div>

      <div className="borrow-entry-balance-section">
        {showNoBalanceHints && (
          <div className="borrow-entry-hints-row">
            <span className="borrow-entry-hint-text">Supply Collateral to Borrow</span>
            {showSecondHint && (
              <span className="borrow-entry-hint-text">Minimum 0.06 SOL Balance</span>
            )}
          </div>
        )}
        
        <button
          type="button"
          className="borrow-entry-balance-card"
          onClick={onChangeNetwork}
        >
          <div className="borrow-entry-balance-main">
            <div className="borrow-entry-token-icon">
              <img src="/coins/usdc.svg" alt="USDC" />
            </div>
            <div className="borrow-entry-balance-info">
              <p className="borrow-entry-balance-label">{depositBalanceLabel}</p>
              <span className="borrow-entry-balance-amount">Available amount; {usdcBalance} USDC</span>
            </div>
          </div>
          <button
            type="button"
            className="borrow-entry-balance-change"
            onClick={(event) => {
              event.stopPropagation();
              onChangeNetwork();
            }}
          >
            Change
          </button>
        </button>

        <div className="borrow-entry-info-card">
          <p className="borrow-entry-info-text">
            Interest accrues daily. We'll notify you if your collateral nears the liquidation threshold.
          </p>
          <div className="borrow-entry-info-apy">
            <span>Borrow APY</span>
            <strong>6.43%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
