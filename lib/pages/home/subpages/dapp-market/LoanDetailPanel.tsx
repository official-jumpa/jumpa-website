import NumericKeyboard from '@/components/pin/NumericKeyboard';
const backIcon = '/assets/icons/actions/back.svg';
const eyeClosedIcon = '/assets/icons/actions/eye-closed.svg';
import type { PinStatus } from './borrow-flow.types';
import { WALLET_PIN_LENGTH } from '@/lib/wallet-pin';

type LoanDetailPanelProps = {
  open: boolean;
  step: 'detail' | 'amount' | 'review' | 'pin' | 'processing' | 'success';
  mode: 'borrow' | 'repay';
  repayAmount: string;
  pin: string;
  pinStatus: PinStatus;
  onClose: () => void;
  onModeChange: (mode: 'borrow' | 'repay') => void;
  onRepayAmountChange: (value: string) => void;
  onContinueFromDetail: () => void;
  onContinueFromAmount: () => void;
  onContinueFromReview: () => void;
  onPinKeyPress: (key: string) => void;
  onDone: () => void;
};

function RepayPinDots({ pin, pinStatus }: { pin: string; pinStatus: PinStatus }) {
  return (
    <div className="loan-repay-pin-dots">
      {Array.from({ length: WALLET_PIN_LENGTH }, (_, index) => {
        const isFilled = index < pin.length;
        const stateClass = pinStatus === 'error' ? 'is-error' : pinStatus === 'success' ? 'is-success' : '';

        return (
          <div key={index} className={`loan-repay-pin-dot ${stateClass}`}>
            {isFilled ? <span className="loan-repay-pin-dot-fill" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function RepayAmountKeypad({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const onKeyPress = (key: string) => {
    if (key === 'backspace') {
      const next = value.slice(0, -1);
      onChange(next.length ? next : '0');
      return;
    }

    if (key === '.') {
      if (!value.includes('.')) onChange(`${value}.`);
      return;
    }

    if (!/^[0-9]$/.test(key)) return;

    if (value.includes('.')) {
      const decimals = value.split('.')[1] ?? '';
      if (decimals.length >= 2) return;
    }

    if (value === '0') {
      onChange(key);
      return;
    }

    if (value.length >= 10) return;
    onChange(`${value}${key}`);
  };

  return <NumericKeyboard onKeyPress={onKeyPress} />;
}

export default function LoanDetailPanel({
  open,
  step,
  mode,
  repayAmount,
  pin,
  pinStatus,
  onClose,
  onModeChange,
  onRepayAmountChange,
  onContinueFromDetail,
  onContinueFromAmount,
  onContinueFromReview,
  onPinKeyPress,
  onDone,
}: LoanDetailPanelProps) {
  if (!open) return null;

  const [wholeRaw, decimalRaw = ''] = (repayAmount || '0').split('.');
  const amountWhole = wholeRaw || '0';
  const amountDecimal = `${decimalRaw}00`.slice(0, 2);

  return (
    <div className="loan-repay-overlay" onClick={onClose}>
      <div className={`loan-repay-modal ${step === 'success' ? 'is-success' : ''}`} onClick={(event) => event.stopPropagation()}>
        {step === 'success' || step === 'detail' ? null : (
          <button type="button" className="loan-repay-close" onClick={onClose} aria-label="Close repayment flow">
            ×
          </button>
        )}

        {step === 'detail' ? (
          <div className="loan-repay-detail-wrap">
            <button type="button" className="loan-repay-back" onClick={onClose} aria-label="Back">
              <img src={backIcon} alt="" width="16" height="16" />
            </button>

            <section className="loan-repay-hero-card">
              <p className="loan-repay-hero-label">Loaned amount</p>
              <div className="loan-repay-hero-row">
                <p className="loan-repay-hero-amount">$1.00</p>
                <button type="button" className="loan-repay-hero-visibility" aria-label="Hide amount">
                  <img src={eyeClosedIcon} alt="" width="18" height="18" />
                </button>
              </div>
            </section>

            <div className="loan-repay-tabs" role="tablist" aria-label="Loan action tabs">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'borrow'}
                className={`loan-repay-tab ${mode === 'borrow' ? 'is-active' : ''}`}
                onClick={() => onModeChange('borrow')}
              >
                Borrow
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'repay'}
                className={`loan-repay-tab ${mode === 'repay' ? 'is-active' : ''}`}
                onClick={() => {
                  onModeChange('repay');
                  onContinueFromDetail();
                }}
              >
                Repay
              </button>
            </div>

            <p className="loan-repay-section-title">Active Loan</p>

            <section className="loan-repay-active-loan-card">
              <div className="loan-repay-active-main">
                <img src="/coins/sol.svg" alt="SOL" width="36" height="36" />
                <div>
                  <p>Loan created</p>
                  <span>Feb 16th 2026</span>
                </div>
              </div>
              <strong className="loan-repay-active-amount">0.05757 Sol</strong>
            </section>

          </div>
        ) : null}

        {step === 'amount' ? (
          <>
            <h3 className="loan-repay-title">Repay amount</h3>
            <section className="loan-repay-card loan-repay-amount-card">
              <div className="loan-repay-token-pill">USDC</div>
              <p className="loan-repay-amount-text">
                <span>{amountWhole}.</span>
                <span className="loan-repay-amount-decimals">{amountDecimal}</span>
              </p>
              <p className="loan-repay-amount-sub">Outstanding: 200.00 USDC</p>
            </section>

            <RepayAmountKeypad value={repayAmount} onChange={onRepayAmountChange} />

            <button type="button" className="loan-repay-primary" onClick={onContinueFromAmount}>
              Review
            </button>
          </>
        ) : null}

        {step === 'review' ? (
          <>
            <h3 className="loan-repay-title">Confirm transaction</h3>

            <section className="loan-repay-card loan-repay-review-card">
              <div className="loan-repay-review-row">
                <div>
                  <p className="loan-repay-label">You repay</p>
                  <p className="loan-repay-review-amount">
                    <span>{amountWhole}</span>
                    <span>.{amountDecimal}</span>
                  </p>
                </div>
                <div className="loan-repay-token-pill">USDC</div>
              </div>
            </section>

            <section className="loan-repay-card loan-repay-review-card">
              <p className="loan-repay-label">To:</p>
              <div className="loan-repay-wallet-row">
                <img src="/avatar_1.svg" alt="Wallet" width="40" height="40" />
                <div>
                  <p>0X...FHS</p>
                  <span>0x71C....C7ab88</span>
                </div>
              </div>
            </section>

            <div className="loan-repay-meta">
              <div>
                <span>Network</span>
                <strong>Ethereum</strong>
              </div>
              <div>
                <span>Network fee</span>
                <strong>$0.023</strong>
              </div>
            </div>

            <button type="button" className="loan-repay-primary" onClick={onContinueFromReview}>
              Make full payment
            </button>
          </>
        ) : null}

        {step === 'pin' ? (
          <>
            <h3 className="loan-repay-title">Enter pin</h3>
            <section className="loan-repay-card loan-repay-pin-card">
              <RepayPinDots pin={pin} pinStatus={pinStatus} />
              <p className="loan-repay-pin-help">Jumpa secure keypad</p>
            </section>
            <NumericKeyboard onKeyPress={onPinKeyPress} />
          </>
        ) : null}

        {step === 'processing' ? (
          <>
            <h3 className="loan-repay-title">Confirm transaction</h3>
            <section className="loan-repay-card loan-repay-processing">
              <p>Processing...</p>
            </section>
            <button type="button" className="loan-repay-primary is-disabled" disabled>
              Processing
            </button>
          </>
        ) : null}

        {step === 'success' ? (
          <div className="loan-repay-success-wrap">
            <img src="/borrow-success-badge.svg" alt="Success" className="loan-repay-success-badge" />
            <h3 className="loan-repay-success-title">Successful!</h3>
            <p className="loan-repay-success-copy">
              {amountWhole}.{amountDecimal} USDC repaid.
            </p>
            <button type="button" className="loan-repay-primary" onClick={onDone}>
              Done
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
