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
    <div className="flex justify-center gap-3">
      {Array.from({ length: WALLET_PIN_LENGTH }, (_, index) => {
        const isFilled = index < pin.length;
        const stateClass = pinStatus === 'error' ? 'border-[#ef4444]' : pinStatus === 'success' ? 'border-[#22c55e]' : 'border-[#8a8a8a]';

        return (
          <div key={index} className={`w-[52px] h-[52px] rounded-[10px] border bg-[#353535] inline-flex items-center justify-center ${stateClass}`}>
            {isFilled ? <span className="w-3.5 h-3.5 rounded-full bg-white" /> : null}
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
    <div className="fixed inset-0 z-[98] bg-black/58 backdrop-blur-[6px] flex items-start justify-center pt-[90px] px-3 pb-6" onClick={onClose}>
      <div 
        className={`w-[min(100%,366px)] bg-[#101010] rounded-[40px] relative flex flex-col gap-3 transition-all ${
          step === 'success' 
            ? 'justify-center items-center min-h-[640px] pt-14 px-[22px] pb-5' 
            : 'min-h-[680px] p-[20px_22px_20px]'
        }`} 
        onClick={(event) => event.stopPropagation()}
      >
        {step === 'success' || step === 'detail' ? null : (
          <button 
            type="button" 
            className="absolute top-3 right-3 w-[35px] h-[35px] border-none rounded-full bg-[#2d2d2d] text-[#f4f4f4] text-2xl leading-none cursor-pointer flex items-center justify-center hover:bg-[#3a3a3a] transition-colors duration-150" 
            onClick={onClose} 
            aria-label="Close repayment flow"
          >
            ×
          </button>
        )}

        {step === 'detail' ? (
          <div className="flex flex-col gap-3 w-full">
            <button 
              type="button" 
              className="w-9 h-9 border-none rounded-full bg-[#2d2d2d] inline-flex items-center justify-center cursor-pointer hover:bg-[#3a3a3a] transition-colors duration-150" 
              onClick={onClose} 
              aria-label="Back"
            >
              <img src={backIcon} alt="" width="16" height="16" className="brightness-0 invert" />
            </button>

            <section className="rounded-[20px] bg-[#2d2d2d] p-3.5 flex flex-col gap-3.5">
              <p className="m-0 w-fit rounded-full bg-[#171717] py-1.25 px-2.5 text-[#c4c4c4] text-[11px] leading-none">Loaned amount</p>
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-white text-[46px] leading-none tracking-[-0.04em] font-bold">$1.00</p>
                <button type="button" className="w-7.5 h-7.5 border-none rounded-full bg-transparent inline-flex items-center justify-center cursor-pointer" aria-label="Hide amount">
                  <img src={eyeClosedIcon} alt="" width="18" height="18" className="opacity-[0.86]" />
                </button>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Loan action tabs">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'borrow'}
                className={`border rounded-full min-h-[32px] text-xs font-semibold leading-none cursor-pointer transition-all duration-150 ${
                  mode === 'borrow' 
                    ? 'border-[#2f2f2f] bg-[#232323] text-white' 
                    : 'border-[#1a1a1a] bg-[#171717] text-[#d8d8d8] hover:bg-[#1f1f1f]'
                }`}
                onClick={() => onModeChange('borrow')}
              >
                Borrow
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'repay'}
                className={`border rounded-full min-h-[32px] text-xs font-semibold leading-none cursor-pointer transition-all duration-150 ${
                  mode === 'repay' 
                    ? 'border-[#2f2f2f] bg-[#232323] text-white' 
                    : 'border-[#1a1a1a] bg-[#171717] text-[#d8d8d8] hover:bg-[#1f1f1f]'
                }`}
                onClick={() => {
                  onModeChange('repay');
                  onContinueFromDetail();
                }}
              >
                Repay
              </button>
            </div>

            <p className="mt-0.5 mb-0 text-[#d8d8d8] text-xs leading-[1.45]">Active Loan</p>

            <section className="rounded-[16px] bg-[#2d2d2d] p-3 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <img src="/coins/sol.svg" alt="SOL" width="36" height="36" className="rounded-full" />
                <div>
                  <p className="m-0 text-white text-[13px] font-semibold leading-[1.2]">Loan created</p>
                  <span className="block mt-0.5 text-[#909090] text-[11px] leading-[1.2]">Feb 16th 2026</span>
                </div>
              </div>
              <strong className="text-white text-[13px] leading-[1.2] whitespace-nowrap font-bold">0.05757 Sol</strong>
            </section>
          </div>
        ) : null}

        {step === 'amount' ? (
          <>
            <h3 className="mt-14 mb-0 text-center text-white text-xl font-bold leading-[1.25] tracking-[-0.02em]">Repay amount</h3>
            <section className="rounded-[20px] bg-[#2d2d2d] p-[15px] flex flex-col gap-2.5 items-center py-5">
              <div className="min-w-[58px] px-3.5 h-[30px] rounded-full bg-[#434343] text-[#d5d5d5] inline-flex items-center justify-center text-[13px] font-medium">USDC</div>
              <p className="m-0 text-white text-[38px] leading-[1.1] font-bold tracking-[-0.04em]">
                <span>{amountWhole}.</span>
                <span className="text-[#777]">{amountDecimal}</span>
              </p>
              <p className="m-0 text-[#8f8f8f] text-xs leading-[1.45]">Outstanding: 200.00 USDC</p>
            </section>

            <RepayAmountKeypad value={repayAmount} onChange={onRepayAmountChange} />

            <button 
              type="button" 
              className="mt-auto w-full h-[50px] border-none rounded-xl bg-[#6a59ce] text-white text-base font-medium cursor-pointer transition-all duration-150 active:scale-[0.98] hover:bg-[#7b6be3]" 
              onClick={onContinueFromAmount}
            >
              Review
            </button>
          </>
        ) : null}

        {step === 'review' ? (
          <>
            <h3 className="mt-14 mb-0 text-center text-white text-xl font-bold leading-[1.25] tracking-[-0.02em]">Confirm transaction</h3>

            <section className="rounded-[20px] bg-[#2d2d2d] p-[15px] flex flex-col gap-2.5 min-h-[112px]">
              <div className="flex items-start justify-between gap-3 w-full">
                <div>
                  <p className="m-0 text-[#d5d5d5] text-xs leading-[1.45]">You repay</p>
                  <p className="mt-1.5 mb-0 text-white text-[36px] leading-[1.2] tracking-[-0.04em] font-bold">
                    <span>{amountWhole}</span>
                    <span className="text-[#777]">.{amountDecimal}</span>
                  </p>
                </div>
                <div className="min-w-[58px] px-3.5 h-[30px] rounded-full bg-[#434343] text-[#d5d5d5] inline-flex items-center justify-center text-[13px] font-medium">USDC</div>
              </div>
            </section>

            <section className="rounded-[20px] bg-[#2d2d2d] p-[15px] flex flex-col gap-2.5">
              <p className="m-0 text-[#d5d5d5] text-xs leading-[1.45]">To:</p>
              <div className="flex items-center gap-2">
                <img src="/avatar_1.svg" alt="Wallet" width="40" height="40" className="rounded-full object-cover" />
                <div>
                  <p className="m-0 text-[#f4f4f4] text-xs leading-[1.45] font-semibold">0X...FHS</p>
                  <span className="mt-0.5 block text-[#777] text-xs leading-[1.45]">0x71C....C7ab88</span>
                </div>
              </div>
            </section>

            <div className="mt-0.5 flex flex-col w-full">
              <div className="flex items-center justify-between py-2.75 px-1.5 border-b border-dashed border-[#787878]">
                <span className="text-white text-sm font-medium leading-[1.45] opacity-80">Network</span>
                <strong className="text-white text-sm font-semibold leading-[1.45]">Ethereum</strong>
              </div>
              <div className="flex items-center justify-between py-2.75 px-1.5 border-b border-dashed border-[#787878]">
                <span className="text-white text-sm font-medium leading-[1.45] opacity-80">Network fee</span>
                <strong className="text-white text-sm font-semibold leading-[1.45]">$0.023</strong>
              </div>
            </div>

            <button 
              type="button" 
              className="mt-auto w-full h-[50px] border-none rounded-xl bg-[#6a59ce] text-white text-base font-medium cursor-pointer transition-all duration-150 active:scale-[0.98] hover:bg-[#7b6be3]" 
              onClick={onContinueFromReview}
            >
              Make full payment
            </button>
          </>
        ) : null}

        {step === 'pin' ? (
          <>
            <h3 className="mt-14 mb-0 text-center text-white text-xl font-bold leading-[1.25] tracking-[-0.02em]">Enter pin</h3>
            <section className="rounded-[20px] bg-[#2d2d2d] p-[15px] flex flex-col gap-3.5 items-center py-[22px]">
              <RepayPinDots pin={pin} pinStatus={pinStatus} />
              <p className="m-0 text-[#777] text-[11px] leading-[1.45]">Jumpa secure keypad</p>
            </section>
            <NumericKeyboard onKeyPress={onPinKeyPress} />
          </>
        ) : null}

        {step === 'processing' ? (
          <>
            <h3 className="mt-14 mb-0 text-center text-white text-xl font-bold leading-[1.25] tracking-[-0.02em]">Confirm transaction</h3>
            <section className="rounded-[20px] bg-[#2d2d2d] p-[15px] min-h-[220px] flex items-center justify-center">
              <p className="m-0 text-white text-2xl leading-[1.2]">Processing...</p>
            </section>
            <button type="button" className="mt-auto w-full h-[50px] border-none rounded-xl bg-[#b9b0df] text-[#f3efff] text-base font-medium cursor-not-allowed" disabled>
              Processing
            </button>
          </>
        ) : null}

        {step === 'success' ? (
          <div className="w-full flex flex-col items-center text-center">
            <img src="/borrow-success-badge.svg" alt="Success" className="w-[220px] h-[220px] object-contain" />
            <h3 className="mt-[-10px] mb-0 text-white text-2xl font-normal leading-[1.45]">Successful!</h3>
            <p className="m-0 text-white text-xl leading-[1.45]">
              {amountWhole}.{amountDecimal} USDC repaid.
            </p>
            <button 
              type="button" 
              className="mt-6 w-full h-[50px] border-none rounded-xl bg-[#6a59ce] text-white text-base font-medium cursor-pointer transition-all duration-150 active:scale-[0.98] hover:bg-[#7b6be3]" 
              onClick={onDone}
            >
              Done
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
