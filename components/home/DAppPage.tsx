"use client"
import { useEffect, useState } from 'react';
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
    <div className="p-6 pt-0 pb-6 flex flex-col h-[calc(100dvh-100px)] overflow-y-auto scrollbar-none">
      {showMarketHeader ? (
        <MarketTabs activeTab={activeTab} onTabChange={setActiveTab} />
      ) : null}

      {activeTab === 'market' ? (
        <>
          <section className="bg-[#1f1f1f] rounded-[32px] p-5 pb-6 flex flex-col gap-4 mb-4 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
            <span className="bg-[#183324] text-[#4ade80] px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider uppercase font-sans w-fit">All Assets</span>

            <div className="flex flex-col gap-3 mt-1">
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

          <section className="bg-[#1f1f1f] rounded-[32px] p-5 pb-6 flex flex-col gap-4 mb-4 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.28)] mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8b8b93] font-sans">Loan</p>
            <button type="button" className="flex items-center justify-between p-3.5 bg-[#252525] rounded-[16px] border border-white/5 cursor-pointer text-left transition-colors duration-150 ease-out hover:bg-[#2b2b2b]" onClick={loanFlow.openLoan}>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-[#7c5cfc] flex items-center justify-center text-sm font-bold text-white shrink-0">U</span>
                <div>
                  <p className="text-sm font-semibold text-[#f3f3f5] mb-0.5">Loan created</p>
                  <span className="text-[11px] text-[#8b8b93]">Feb 16th 2026</span>
                </div>
              </div>
              <strong className="text-sm font-bold text-white">0.05757 SOL</strong>
            </button>
          </section>
        </>
      ) : activeTab === 'borrow' ? (
        <>
          {borrowTabStep === 'landing' ? (
            <section className="bg-[#1f1f1f] rounded-[32px] p-6 pb-8 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.28)] flex flex-col gap-4 mb-4">
              <BorrowEntryScreen
                onContinue={handleBorrowContinue}
                onPasteAddress={handleBorrowPaste}
                onChangeNetwork={openDepositSelector}
                depositBalanceLabel="USDC Balance"
                usdcBalance="600 USDC"
              />
            </section>
          ) : (
            <section className="p-4 px-6 flex flex-col min-h-[calc(100dvh-100px)] bg-transparent animate-[fadeIn_0.4s_ease-out]">
              <div className="flex justify-between items-center mb-6">
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-[#1c1c1e] flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#262626] border-none"
                  onClick={() => {
                    setBorrowTabStep('landing');
                    setBorrowReviewOpen(false);
                  }}
                  aria-label="Back"
                >
                  <img src={backIcon} alt="" className="w-3.5 h-[11px] block" />
                </button>
                <h2 className="text-lg font-bold text-[#f3f3f5]">Send Money</h2>
                <button type="button" className="flex items-center gap-1 bg-[#1c1c1e] py-1.5 px-3 rounded-[12px] border border-white/5 cursor-pointer transition-colors duration-150 ease-out hover:bg-[#262626]">
                  <span>Sol</span>
                  <img src={dropdownChevronIcon} alt="" className="w-3 h-2 shrink-0 object-contain ml-1" />
                </button>
              </div>

              <div className="bg-[#1f1f1f] p-4 rounded-[20px] border border-white/5 mb-4">
                <p className="text-[12px] font-semibold text-[#8b8b93] uppercase tracking-wider mb-2">To:</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={avatarImageIcon} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-[#f3f3f5]">Oxbn...NYA</p>
                      <span className="text-[11px] text-[#8b8b93] font-mono break-all max-w-[200px]">0xB7..BYGgnjdhjghshgdhhdhhdz9</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1f1f1f] p-[18px] rounded-[24px] border border-white/5 flex flex-col items-center mb-4">
                <button type="button" className="flex items-center gap-2 bg-[#252525] py-2 px-3 rounded-[14px] border border-white/5 cursor-pointer transition-colors duration-200 hover:bg-[#2b2b2b]">
                  <div className="flex items-center gap-2">
                    <img src={walletIcon} alt="" className="w-[14px] h-[14px] opacity-70" />
                    <span className="text-xs font-bold text-[#f3f3f5]">7tB7...BYz9</span>
                  </div>
                  <img src={dropdownChevronIcon} alt="" className="w-2 h-1.5 ml-1 opacity-50" />
                </button>

                <p className="text-[48px] font-extrabold text-white text-center mt-5 mb-1 flex justify-center items-baseline">
                  <span>{amountWhole}.</span>
                  <span className="text-[32px] text-[#8b8b93]">{amountDecimal}</span>
                </p>
                <p className="text-xs text-[#8b8b93] text-center mb-5">$81.07</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs font-semibold text-[#22c55e] uppercase tracking-wider">Available</p>
                  <button type="button" className="w-6 h-6 rounded-full bg-[#252525] flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-[#2b2b2b] border-none">
                    <img src={correctIcon} alt="Edit" className="w-3 h-3 opacity-90" />
                  </button>
                </div>
              </div>

              <div className="mt-auto w-full flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-y-2 gap-x-8 w-full">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
                    <button key={key} type="button" className="h-12 text-2xl font-medium flex items-center justify-center hover:bg-white/5 rounded-full active:scale-95 transition-all cursor-pointer" onClick={() => handleBorrowKeypad(key)}>
                      {key}
                    </button>
                  ))}
                  <button type="button" className="h-12 text-2xl font-medium flex items-center justify-center hover:bg-white/5 rounded-full active:scale-95 transition-all cursor-pointer text-[#8b8b93]" onClick={() => handleBorrowKeypad('backspace')} aria-label="Backspace">
                    <img src={arrowIcon} alt="" className="w-5 h-5 opacity-70" />
                  </button>
                </div>

                <button
                  type="button"
                  className="w-full py-4 bg-[#7c5cfc] text-white border-none rounded-2xl text-base font-bold cursor-pointer transition-all duration-200 ease-out hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_24px_rgba(124,92,252,0.35)] disabled:bg-[#252525] disabled:text-[#8b8b93] disabled:cursor-not-allowed"
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
        <section className="flex flex-col items-center justify-center text-center py-12 px-6 bg-[#1f1f1f] rounded-[32px] border border-white/5 min-h-[300px] mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">RWA</h2>
            <p className="text-sm text-[#b7b7be] leading-relaxed">Real-world asset markets will be added here next. The tab is wired, but the flow is intentionally out of scope for this pass.</p>
          </div>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8b8b93] bg-[#252525] py-1 px-2.5 rounded-full mt-4">Placeholder</span>
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
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[10px] z-55 flex items-end justify-center sm:items-center" onClick={closeDepositSelector}>
          <div className="w-full sm:w-[342px] bg-[#0f0f10] rounded-t-[24px] sm:rounded-[32px] p-6 pt-5 px-4 pb-8 flex flex-col max-h-[75%] overflow-y-auto scrollbar-none animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards] relative" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-[#2b2b2b]" onClick={closeDepositSelector} aria-label="Close">
              <img src={closeIcon} alt="" width="11.72" height="11.72" className="opacity-70" />
            </button>

            <h3 className="text-[17px] font-bold text-white text-center">Deposit</h3>

            <div className="flex flex-col gap-3 mt-6">
              <button
                type="button"
                className="flex items-center gap-3 p-4 bg-[#1f1f1f] rounded-[16px] border border-white/5 cursor-pointer text-left w-full transition-colors duration-150 hover:bg-[#252525]"
                onClick={() => chooseDepositNetwork('sol')}
                aria-pressed={depositNetwork === 'sol'}
              >
                <div className="w-8 h-8 flex-shrink-0 bg-[#252525] rounded-full flex items-center justify-center">
                  <img src="/coins/usdc.svg" alt="USDC" width="32" height="32" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f3f3f5]">Sol USDC Balance</p>
                  <span className="text-[11px] text-[#8b8b93]">Available amount; 600 USDC</span>
                </div>
              </button>

              <button
                type="button"
                className="flex items-center gap-3 p-4 bg-[#1f1f1f] rounded-[16px] border border-white/5 cursor-pointer text-left w-full transition-colors duration-150 hover:bg-[#252525]"
                onClick={() => chooseDepositNetwork('eth')}
                aria-pressed={depositNetwork === 'eth'}
              >
                <div className="w-8 h-8 flex-shrink-0 bg-[#252525] rounded-full flex items-center justify-center">
                  <img src="/coins/usdc.svg" alt="USDC" width="32" height="32" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f3f3f5]">Eth USDC Balance</p>
                  <span className="text-[11px] text-[#8b8b93]">Available amount; 600 USDC</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {borrowReviewOpen ? (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[10px] z-55 flex items-end justify-center sm:items-center" onClick={() => !isBorrowProcessing && setBorrowReviewOpen(false)}>
          <div className="w-full sm:w-[342px] bg-[#0f0f10] rounded-t-[24px] sm:rounded-[32px] p-6 pt-5 px-4 pb-8 flex flex-col max-h-[75%] overflow-y-auto scrollbar-none animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards] relative" onClick={(event) => event.stopPropagation()}>
            <button 
              type="button" 
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-[#2b2b2b] disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => !isBorrowProcessing && setBorrowReviewOpen(false)} 
              aria-label="Close"
              disabled={isBorrowProcessing}
            >
              <img src={closeIcon} alt="" width="11.72" height="11.72" className="opacity-70" />
            </button>

            <h3 className="text-[17px] font-bold text-white text-center">Confirm transaction</h3>

            <div className="flex flex-col gap-2 relative mt-6 mb-4">
              <section className="bg-[#1f1f1f] p-4 rounded-[20px] border border-white/[0.05] pb-5">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <p className="text-[12px] font-semibold text-[#8b8b93] uppercase tracking-wider">You Receive</p>
                    <p className="text-2xl font-bold text-white">
                      <span>{amountWhole}</span>
                      <span className="text-lg">.{amountDecimal}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-[#252525] py-1 px-3 rounded-full text-xs font-bold text-white border border-white/5">
                      <span>Sol</span>
                    </div>
                    <p className="text-[11px] text-[#8b8b93]">1 Eth</p>
                  </div>
                </div>
              </section>

              <div className="absolute left-1/2 -translate-x-1/2 top-[55px] z-10 w-9 h-9 bg-[#101010] border-[3px] border-[#0f0f10] rounded-xl flex items-center justify-center">
                <img src={arrowUpDownIcon} alt="" className="w-4 h-4 text-[#7c5cfc]" />
              </div>

              <section className="bg-[#1f1f1f] p-4 rounded-[20px] border border-white/[0.05] pt-5">
                <div className="flex flex-col gap-2">
                  <p className="text-[12px] font-semibold text-[#8b8b93] uppercase tracking-wider">To:</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={avatarImageIcon} alt="Recipient" width="36" height="36" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-[#f3f3f5]">0X...FHS</p>
                        <span className="text-[11px] text-[#8b8b93]">0x71C....C7ab88</span>
                      </div>
                    </div>
                    <img src={markIcon} alt="Confirmed" className="w-4 h-4 opacity-90" />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-2 mb-6 text-sm px-1">
              <div className="flex justify-between items-center">
                <span className="text-[#8b8b93]">Network</span>
                <strong className="text-white font-semibold">Solana</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8b8b93]">Network fee</span>
                <strong className="text-white font-semibold">$0.023</strong>
              </div>
            </div>

            {!isBorrowProcessing ? (
              <button
                type="button"
                className="w-full py-4 bg-[#7c5cfc] text-white border-none rounded-2xl text-base font-bold cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(124,92,252,0.35)]"
                onClick={() => {
                  setBorrowReviewOpen(false);
                  setBorrowPinOpen(true);
                }}
              >
                Borrow
              </button>
            ) : (
              <button type="button" className="w-full py-4 bg-[#252525] text-[#8b8b93] border-none rounded-2xl text-base font-bold cursor-not-allowed" disabled>
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
        <div className="fixed inset-0 bg-black z-100 flex flex-col justify-center items-center p-6" onClick={resetBorrowJourney}>
          <div className="flex flex-col items-center text-center animate-[fadeIn_0.3s_ease_forwards]">
            <img src={successIcon} alt="Success" className="w-[120px] h-[120px] object-contain mb-8" />
            <p className="text-2xl font-bold text-white mb-2">Sent !</p>
            <p className="text-[#b7b7be] text-base leading-relaxed">
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
