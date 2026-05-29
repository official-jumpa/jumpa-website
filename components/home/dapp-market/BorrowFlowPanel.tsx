import type { AddressStatus, BorrowAsset, BorrowFlowStep, PinStatus } from './borrow-flow.types';
import PinEntryBlock from './PinEntryBlock';
import TransactionReviewCard from './TransactionReviewCard';

type BorrowFlowPanelProps = {
  step: BorrowFlowStep;
  asset: BorrowAsset;
  addressInput: string;
  addressStatus: AddressStatus;
  hasMinimumCollateral: boolean;
  resolvedAddress: string;
  recipientLabel: string;
  amount: string;
  pin: string;
  pinStatus: PinStatus;
  onClose: () => void;
  onAddressChange: (value: string) => void;
  onPasteDemo: () => void;
  onConfirmAddress: () => void;
  onGoToReview: () => void;
  onGoToPin: () => void;
  onPinKeyPress: (key: string) => void;
  onDone: () => void;
};

export default function BorrowFlowPanel({
  step,
  asset,
  addressInput,
  addressStatus,
  hasMinimumCollateral,
  resolvedAddress,
  recipientLabel,
  amount,
  pin,
  pinStatus,
  onClose,
  onAddressChange,
  onPasteDemo,
  onConfirmAddress,
  onGoToReview,
  onGoToPin,
  onPinKeyPress,
  onDone,
}: BorrowFlowPanelProps) {
  const addressHelperText =
    addressStatus === 'invalid'
      ? 'Invalid address'
      : addressStatus === 'valid'
        ? recipientLabel
        : 'Enter wallet address or .tag handle';

  const showAddressConfirmation = addressStatus === 'valid';

  return (
    <div className="borrow-flow-overlay" onClick={onClose}>
      <div className="borrow-flow-panel" onClick={(event) => event.stopPropagation()}>
        <div className="borrow-flow-head">
          <button type="button" className="borrow-flow-close" onClick={onClose} aria-label="Close borrow flow">
            x
          </button>
          <h3>{step === 'success' ? 'Success' : 'Borrow'}</h3>
        </div>

        {(step === 'address-entry' || step === 'review' || step === 'pin' || step === 'processing' || step === 'success') && (
          <div className="borrow-flow-asset-card">
            <img src={asset.iconSrc} alt={asset.symbol} className="borrow-flow-asset-img" width="34" height="34" />
            <div>
              <p>{asset.symbol} Market</p>
              <span>{asset.network}</span>
            </div>
          </div>
        )}

        {step === 'address-entry' ? (
          <div className="borrow-flow-content">
            <section className="borrow-card">
              <label htmlFor="borrow-address" className="borrow-card-label">Address or .Tag handle</label>
              <input
                id="borrow-address"
                value={addressInput}
                onChange={(event) => onAddressChange(event.target.value)}
                className={`borrow-input ${addressStatus === 'invalid' ? 'is-invalid' : ''} ${addressStatus === 'valid' ? 'is-valid' : ''}`}
                placeholder="7EcDhSYGxXys..."
              />
              <p className={`borrow-helper borrow-helper-${addressStatus}`}>{addressHelperText}</p>

              <div className="borrow-inline-actions">
                <button type="button" className="borrow-inline-btn" onClick={onConfirmAddress}>Continue</button>
                <button type="button" className="borrow-inline-btn" onClick={onPasteDemo}>Paste</button>
              </div>
            </section>

            <section className="borrow-card">
              <div className="borrow-card-row">
                <span className="borrow-muted">{asset.walletBalanceLabel}</span>
                <strong>{asset.availableAmountText}</strong>
              </div>
              <div className="borrow-card-row">
                <span className="borrow-muted">Borrow APY</span>
                <strong>{asset.borrowApy}</strong>
              </div>
              <p className="borrow-disclaimer">
                Interest accrues daily. We&apos;ll notify you if your collateral nears the liquidation threshold.
              </p>
            </section>

            {showAddressConfirmation && !hasMinimumCollateral ? (
              <p className="borrow-validation-error">
                Minimum {asset.minimumCollateral} {asset.collateralToken} balance required to continue.
              </p>
            ) : null}

            <button
              type="button"
              className="borrow-primary-btn"
              onClick={onGoToReview}
              disabled={!showAddressConfirmation || !hasMinimumCollateral}
            >
              Review
            </button>
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="borrow-flow-content">
            <TransactionReviewCard
              title="Confirm transaction"
              receiveLabel="You Receive"
              receiveValue={asset.estimatedReceive}
              valueLabel="Value"
              valueAmount={asset.estimatedReceiveValue}
              toLabel="To"
              toValue={resolvedAddress ? `${resolvedAddress.slice(0, 6)}...${resolvedAddress.slice(-4)}` : '0x...----'}
              networkFee="$0.023"
            />

            <button type="button" className="borrow-primary-btn" onClick={onGoToPin}>
              Borrow
            </button>
          </div>
        ) : null}

        {step === 'pin' ? (
          <div className="borrow-flow-content">
            <PinEntryBlock pin={pin} pinStatus={pinStatus} onKeyPress={onPinKeyPress} onDone={onClose} />
          </div>
        ) : null}

        {step === 'processing' ? (
          <div className="borrow-flow-content">
            <section className="borrow-card borrow-processing-card">
              <p className="borrow-card-label">Confirm transaction</p>
              <p className="borrow-processing-text">Processing...</p>
            </section>
          </div>
        ) : null}

        {step === 'success' ? (
          <div className="borrow-flow-content">
            <section className="borrow-success">
              <div className="borrow-success-mark">✓</div>
              <h4>Sent!</h4>
              <p>
                ${amount} was sent to your wallet successfully.
              </p>
            </section>
            <button type="button" className="borrow-primary-btn" onClick={onDone}>Done</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}