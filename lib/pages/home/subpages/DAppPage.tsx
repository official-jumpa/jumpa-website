import { useEffect, useState } from 'react';
import './DAppPage.css';
const successIcon = '/assets/success.png';
const closeIcon = '/assets/icons/actions/close.svg';
const backIcon = '/assets/icons/actions/back.svg';
import PinEntryScreen from '@/components/pin/PinEntryScreen';
import LoanDetailPanel from './dapp-market/LoanDetailPanel';
import { borrowAssets } from './dapp-market/borrow-flow.data';
import MarketAssetRow from './dapp-market/MarketAssetRow';
import MarketTabs from './dapp-market/MarketTabs';
import { useLoanRepayFlow } from './dapp-market/useLoanRepayFlow';
import WatchlistPromptCard from './dapp-market/WatchlistPromptCard';
import BorrowEntryScreen from './dapp-market/BorrowEntryScreen';
const dropdownChevronIcon = '/assets/icons/actions/dropdown-chevron.svg';
const avatarImageIcon = '/assets/abigail.svg';
const walletIcon = '/assets/icons/actions/wallet.svg';
const correctIcon = '/assets/icons/actions/correct.svg';
const arrowIcon = '/assets/icons/actions/Arrow 2.svg';
const markIcon = '/assets/icons/actions/mark.svg';
const arrowUpDownIcon = '/assets/icons/actions/arrow-up-down.svg';

function DAppPage() {
  const [activeTab, setActiveTab] = useState<'market' | 'borrow' | 'rwa'>('market');
  const [depositSelectorOpen, setDepositSelectorOpen] = useState(false);
  const [depositNetwork, setDepositNetwork] = useState<'sol' | 'eth'>('sol');
  const [borrowTabStep, setBorrowTabStep] = useState<'landing' | 'amount'>('landing');
  const [borrowAmountInput, setBorrowAmountInput] = useState('1.00');
  const [borrowReviewOpen, setBorrowReviewOpen] = useState(false);
  const [borrowPinOpen, setBorrowPinOpen] = useState(false);
  const [isBorrowProcessing, setIsBorrowProcessing] = useState(false);
  const [borrowSuccessOpen, setBorrowSuccessOpen] = useState(false);
  const loanFlow = useLoanRepayFlow();
  const borrowAddress = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';

  useEffect(() => {
    const shouldOpenLoan = sessionStorage.getItem('jumpa-open-loan-detail') === 'true';
    if (!shouldOpenLoan) return;

    sessionStorage.removeItem('jumpa-open-loan-detail');
    setActiveTab('market');
    loanFlow.openLoan();
  }, [loanFlow]);

  useEffect(() => {
    if (activeTab !== 'borrow') {
      setBorrowTabStep('landing');
      setBorrowReviewOpen(false);
    }
  }, [activeTab]);

  const handleBorrowContinue = () => {
    setBorrowTabStep('amount');
    setBorrowReviewOpen(false);
  };

  const handleBorrowPaste = async () => {
    try {
      const clipboardValue = await navigator.clipboard?.readText?.();
      return clipboardValue?.trim() || borrowAddress;
    } catch {
      return borrowAddress;
    }
  };

  const openDepositSelector = () => setDepositSelectorOpen(true);
  const closeDepositSelector = () => setDepositSelectorOpen(false);

  const chooseDepositNetwork = (network: 'sol' | 'eth') => {
    setDepositNetwork(network);
    setDepositSelectorOpen(false);
  };

  const showMarketHeader = !(activeTab === 'borrow' && borrowTabStep === 'amount');

  const handleBorrowKeypad = (key: string) => {
    if (key === 'backspace') {
      setBorrowAmountInput((prev) => {
        const next = prev.slice(0, -1);
        return next.length ? next : '0';
      });
      return;
    }

    if (key === '.') {
      setBorrowAmountInput((prev) => (prev.includes('.') ? prev : `${prev}.`));
      return;
    }

    if (!/^[0-9]$/.test(key)) return;

    setBorrowAmountInput((prev) => {
      if (prev.includes('.')) {
        const decimals = prev.split('.')[1] ?? '';
        if (decimals.length >= 2) return prev;
      }

      if (prev === '0') return key;
      if (prev.length >= 10) return prev;
      return `${prev}${key}`;
    });
  };

  const [amountWholeRaw, amountDecimalRaw = ''] = (borrowAmountInput || '0').split('.');
  const amountWhole = amountWholeRaw || '0';
  const amountDecimal = `${amountDecimalRaw}00`.slice(0, 2);
  const canReviewBorrowAmount = Number.parseFloat(borrowAmountInput) > 0;

  const resetBorrowJourney = () => {
    setBorrowSuccessOpen(false);
    setIsBorrowProcessing(false);
    setBorrowPinOpen(false);
    setBorrowReviewOpen(false);
    setBorrowTabStep('landing');
    setBorrowAmountInput('1.00');
    setActiveTab('market');
  };

  return (
    <div className="dapp-page">
      {showMarketHeader ? (
        <MarketTabs activeTab={activeTab} onTabChange={setActiveTab} />
      ) : null}

      {activeTab === 'market' ? (
        <>
          <section className="market-panel">
            <p className="market-all-assets-label">All Assets</p>

            <div className="market-asset-list">
              {borrowAssets.map((asset) => (
                <MarketAssetRow
                  key={asset.id}
                  {...asset}
                  active={false}
                  onSelect={() => setActiveTab('borrow')}
                />
              ))}
            </div>
          </section>

          <WatchlistPromptCard />

          <section className="market-panel loan-market-card">
            <p className="market-all-assets-label">Loan</p>
            <button type="button" className="market-loan-entry" onClick={loanFlow.openLoan}>
              <div className="market-loan-entry-main">
                <span className="market-loan-token">U</span>
                <div>
                  <p>Loan created</p>
                  <span>Feb 16th 2026</span>
                </div>
              </div>
              <strong>0.05757 SOL</strong>
            </button>
          </section>
        </>
      ) : activeTab === 'borrow' ? (
        <>
          {borrowTabStep === 'landing' ? (
            <section className="market-panel borrow-balance-panel">
              <BorrowEntryScreen
                onContinue={handleBorrowContinue}
                onPasteAddress={handleBorrowPaste}
                onChangeNetwork={openDepositSelector}
                depositBalanceLabel="USDC Balance"
                usdcBalance="600 USDC"
              />
            </section>
          ) : (
            <section className="borrow-send-screen">
              <div className="borrow-send-top-row">
                <button
                  type="button"
                  className="borrow-send-back"
                  onClick={() => {
                    setBorrowTabStep('landing');
                    setBorrowReviewOpen(false);
                  }}
                  aria-label="Back"
                >
                  <img src={backIcon} alt="" className="borrow-send-back-icon" />
                </button>
                <h2>Send Money</h2>
                <button type="button" className="borrow-send-network-btn">
                  <span>Sol</span>
                  <img src={dropdownChevronIcon} alt="" className="borrow-send-chevron" />
                </button>
              </div>

              <div className="borrow-send-to-card">
                <p className="borrow-send-to-label">To:</p>
                <div className="borrow-send-to-row">
                  <div className="borrow-send-recipient-info">
                    <img src={avatarImageIcon} alt="" className="borrow-send-avatar-img" />
                    <div className="borrow-send-names">
                      <p className="borrow-send-name">Oxbn...NYA</p>
                      <span className="borrow-send-address">0xB7..BYGgnjdhjghshgdhhdhhdz9</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="borrow-send-amount-card">
                <button type="button" className="borrow-send-wallet-selector">
                  <div className="borrow-send-wallet-main">
                    <img src={walletIcon} alt="" className="borrow-send-wallet-icon" />
                    <span className="borrow-send-wallet-addr">7tB7...BYz9</span>
                  </div>
                  <img src={dropdownChevronIcon} alt="" className="borrow-send-chevron-small" />
                </button>

                <p className="borrow-send-amount">
                  <span>{amountWhole}.</span>
                  <span className="borrow-send-amount-decimals">{amountDecimal}</span>
                </p>
                <p className="borrow-send-amount-value">$81.07</p>
                
                <div className="borrow-send-status-row">
                  <p className="borrow-send-available-text">Available</p>
                  <button type="button" className="borrow-send-edit-btn">
                    <img src={correctIcon} alt="Edit" className="borrow-send-correct-icon" />
                  </button>
                </div>
              </div>

              <div className="borrow-send-keypad">
                <div className="borrow-send-keypad-grid">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
                    <button key={key} type="button" className="borrow-send-key" onClick={() => handleBorrowKeypad(key)}>
                      {key}
                    </button>
                  ))}
                  <button type="button" className="borrow-send-key borrow-send-backspace" onClick={() => handleBorrowKeypad('backspace')} aria-label="Backspace">
                    <img src={arrowIcon} alt="" className="borrow-send-arrow-icon" />
                  </button>
                </div>

                <button
                  type="button"
                  className="borrow-send-review-btn"
                  onClick={() => setBorrowReviewOpen(true)}
                  disabled={!canReviewBorrowAmount}
                >
                  Review
                </button>
              </div>
            </section>
          )}

        </>
      ) : (
        <section className="market-panel market-panel-placeholder">
          <div>
            <h2>RWA</h2>
            <p>Real-world asset markets will be added here next. The tab is wired, but the flow is intentionally out of scope for this pass.</p>
          </div>
          <span className="market-placeholder-badge">Placeholder</span>
        </section>
      )}

      <LoanDetailPanel
        open={loanFlow.open}
        step={loanFlow.step}
        mode={loanFlow.mode}
        repayAmount={loanFlow.repayAmount}
        pin={loanFlow.pin}
        pinStatus={loanFlow.pinStatus}
        onClose={loanFlow.closeLoan}
        onModeChange={loanFlow.setMode}
        onRepayAmountChange={loanFlow.setRepayAmount}
        onContinueFromDetail={loanFlow.goToAmount}
        onContinueFromAmount={loanFlow.goToReview}
        onContinueFromReview={loanFlow.goToPin}
        onPinKeyPress={loanFlow.onPinKeyPress}
        onDone={loanFlow.closeLoan}
      />

      {depositSelectorOpen ? (
        <div className="deposit-selector-overlay" onClick={closeDepositSelector}>
          <div className="deposit-selector-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="deposit-selector-close" onClick={closeDepositSelector} aria-label="Close">
              <img src={closeIcon} alt="" width="11.72" height="11.72" />
            </button>

            <h3>Deposit</h3>

            <div className="deposit-selector-options">
              <button
                type="button"
                className="deposit-option"
                onClick={() => chooseDepositNetwork('sol')}
                aria-pressed={depositNetwork === 'sol'}
              >
                <div className="deposit-option-icon">
                  <img src="/coins/usdc.svg" alt="USDC" width="32" height="32" />
                </div>
                <div>
                  <p>Sol USDC Balance</p>
                  <span>Available amount; 600 USDC</span>
                </div>
              </button>

              <button
                type="button"
                className="deposit-option"
                onClick={() => chooseDepositNetwork('eth')}
                aria-pressed={depositNetwork === 'eth'}
              >
                <div className="deposit-option-icon">
                  <img src="/coins/usdc.svg" alt="USDC" width="32" height="32" />
                </div>
                <div>
                  <p>Eth USDC Balance</p>
                  <span>Available amount; 600 USDC</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {borrowReviewOpen ? (
        <div className="borrow-review-overlay" onClick={() => !isBorrowProcessing && setBorrowReviewOpen(false)}>
          <div className="borrow-review-modal" onClick={(event) => event.stopPropagation()}>
            <button 
              type="button" 
              className="borrow-review-close" 
              onClick={() => !isBorrowProcessing && setBorrowReviewOpen(false)} 
              aria-label="Close"
              disabled={isBorrowProcessing}
            >
              <img src={closeIcon} alt="" width="11.72" height="11.72" />
            </button>

            <h3>Confirm transaction</h3>

            <div className="borrow-review-card-stack">
              <section className="borrow-review-card borrow-review-receive-card">
                <div className="borrow-review-receive-group">
                  <div className="borrow-review-receive-left">
                    <p className="borrow-review-label">You Receive</p>
                    <p className="borrow-review-amount">
                      <span className="borrow-review-amount-whole">{amountWhole}</span>
                      <span className="borrow-review-amount-decimal">.{amountDecimal}</span>
                    </p>
                  </div>
                  <div className="borrow-review-token-side">
                    <div className="borrow-review-token-surface">
                      <span>Sol</span>
                    </div>
                    <p className="borrow-review-alt-value">1 Eth</p>
                  </div>
                </div>
              </section>

              <div className="borrow-review-swap-icon-container">
                <img src={arrowUpDownIcon} alt="" className="borrow-review-swap-icon-img" />
              </div>

              <section className="borrow-review-card borrow-review-to-card">
                <div className="borrow-review-to-group">
                  <p className="borrow-review-label">To:</p>
                  <div className="borrow-review-recipient-row">
                    <div className="borrow-review-recipient">
                      <img src={avatarImageIcon} alt="Recipient" width="36" height="36" />
                      <div>
                        <p>0X...FHS</p>
                        <span>0x71C....C7ab88</span>
                      </div>
                    </div>
                    <img src={markIcon} alt="Confirmed" className="borrow-review-mark-icon" />
                  </div>
                </div>
              </section>
            </div>

            <div className="borrow-review-meta-lines">
              <div>
                <span>Network</span>
                <strong>Solana</strong>
              </div>
              <div>
                <span>Network fee</span>
                <strong>$0.023</strong>
              </div>
            </div>

            {!isBorrowProcessing ? (
              <button
                type="button"
                className="borrow-review-borrow-btn"
                onClick={() => {
                  setBorrowReviewOpen(false);
                  setBorrowPinOpen(true);
                }}
              >
                Borrow
              </button>
            ) : (
              <button type="button" className="borrow-review-processing-btn" disabled>
                Processing...
              </button>
            )}
          </div>
        </div>
      ) : null}

      {borrowPinOpen ? (
        <PinEntryScreen
          onSuccess={() => {
            setBorrowPinOpen(false);
            setBorrowReviewOpen(true);
            setIsBorrowProcessing(true);
            window.setTimeout(() => {
              setIsBorrowProcessing(false);
              setBorrowReviewOpen(false);
              setBorrowSuccessOpen(true);
              window.setTimeout(() => {
                resetBorrowJourney();
              }, 1800);
            }, 1400);
          }}
          onClose={() => setBorrowPinOpen(false)}
        />
      ) : null}

      {borrowSuccessOpen ? (
        <div className="borrow-success-screen" onClick={resetBorrowJourney}>
          <div className="borrow-success-content">
            <img src={successIcon} alt="Success" className="borrow-success-badge" />
            <p className="borrow-success-title">Sent !</p>
            <p className="borrow-success-message">
              <span>$</span>10,000 is sent to
              <br />
              your Wallet.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DAppPage;
