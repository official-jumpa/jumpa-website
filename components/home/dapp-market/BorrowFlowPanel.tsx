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
    <div className="fixed inset-0 bg-black/55 backdrop-blur-[8px] z-[90] flex items-end justify-center" onClick={onClose}>
      <div className="w-full sm:w-[450px] max-h-[86vh] bg-[#0f0f10] border-t border-x border-white/5 rounded-t-[32px] sm:rounded-b-[32px] sm:border-b sm:mb-8 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.28)] flex flex-col overflow-y-auto scrollbar-none gap-6" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <button type="button" className="w-[34px] h-[34px] border-none rounded-full bg-[#252525] text-[#8b8b93] text-lg cursor-pointer flex items-center justify-center hover:bg-[#2b2b2b] transition-colors" onClick={onClose} aria-label="Close borrow flow">
            ×
          </button>
          <h3 className="m-0 text-lg font-bold text-white">{step === 'success' ? 'Success' : 'Borrow'}</h3>
        </div>

        {(step === 'address-entry' || step === 'review' || step === 'pin' || step === 'processing' || step === 'success') && (
          <div className="flex items-center gap-2.5 p-[10px_12px] rounded-2xl bg-[#1f1f1f] border border-white/5">
            <img src={asset.iconSrc} alt={asset.symbol} className="w-[34px] h-[34px] rounded-full object-cover flex-shrink-0" width="34" height="34" />
            <div>
              <p className="m-0 text-white text-[13px] font-bold">{asset.symbol} Market</p>
              <span className="text-[#8b8b93] text-[11px]">{asset.network}</span>
            </div>
          </div>
        )}

        {step === 'address-entry' ? (
          <div className="flex flex-col gap-3">
            <section className="bg-[#1f1f1f] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5">
              <label htmlFor="borrow-address" className="m-0 text-[#8b8b93] text-[11px]">Address or .Tag handle</label>
              <input
                id="borrow-address"
                value={addressInput}
                onChange={(event) => onAddressChange(event.target.value)}
                className={`bg-[#252525] border border-white/5 rounded-xl p-3 text-white text-sm outline-none placeholder-[#5a5a5a] ${
                  addressStatus === 'invalid' ? 'border-[#ef4444]' : addressStatus === 'valid' ? 'border-[#22c55e]' : ''
                }`}
                placeholder="7EcDhSYGxXys..."
              />
              <p className={`m-0 text-[11px] ${
                addressStatus === 'invalid' ? 'text-[#ef4444]' : addressStatus === 'valid' ? 'text-[#22c55e]' : 'text-[#8b8b93]'
              }`}>{addressHelperText}</p>

              <div className="flex justify-end gap-2">
                <button type="button" className="bg-transparent border-none text-[#7c5cfc] text-[13px] font-semibold cursor-pointer hover:underline" onClick={onConfirmAddress}>Continue</button>
                <button type="button" className="bg-transparent border-none text-[#7c5cfc] text-[13px] font-semibold cursor-pointer hover:underline" onClick={onPasteDemo}>Paste</button>
              </div>
            </section>

            <section className="bg-[#1f1f1f] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 w-full">
                <span className="text-[#8b8b93]">{asset.walletBalanceLabel}</span>
                <strong className="text-white font-bold">{asset.availableAmountText}</strong>
              </div>
              <div className="flex items-center justify-between gap-3 w-full">
                <span className="text-[#8b8b93]">Borrow APY</span>
                <strong className="text-white font-bold">{asset.borrowApy}</strong>
              </div>
              <p className="text-[11px] text-[#8b8b93] leading-[1.45] m-0">
                Interest accrues daily. We&apos;ll notify you if your collateral nears the liquidation threshold.
              </p>
            </section>

            {showAddressConfirmation && !hasMinimumCollateral ? (
              <p className="text-[#ef4444] text-xs m-0">
                Minimum {asset.minimumCollateral} {asset.collateralToken} balance required to continue.
              </p>
            ) : null}

            <button
              type="button"
              className="w-full h-[50px] border-none rounded-xl bg-[#7c5cfc] text-white text-base font-medium cursor-pointer mt-auto hover:bg-[#8b6dfc] transition-colors disabled:bg-[#252525] disabled:text-[#8b8b93] disabled:cursor-not-allowed"
              onClick={onGoToReview}
              disabled={!showAddressConfirmation || !hasMinimumCollateral}
            >
              Review
            </button>
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="flex flex-col gap-3">
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

            <button type="button" className="w-full h-[50px] border-none rounded-xl bg-[#7c5cfc] text-white text-base font-medium cursor-pointer mt-auto hover:bg-[#8b6dfc] transition-colors" onClick={onGoToPin}>
              Borrow
            </button>
          </div>
        ) : null}

        {step === 'pin' ? (
          <div className="flex flex-col gap-3">
            <PinEntryBlock pin={pin} pinStatus={pinStatus} onKeyPress={onPinKeyPress} onDone={onClose} />
          </div>
        ) : null}

        {step === 'processing' ? (
          <div className="flex flex-col gap-3">
            <section className="bg-[#1f1f1f] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5 items-center justify-center min-h-[140px]">
              <p className="m-0 text-[#8b8b93] text-[11px]">Confirm transaction</p>
              <p className="m-0 text-white text-xl font-bold">Processing...</p>
            </section>
          </div>
        ) : null}

        {step === 'success' ? (
          <div className="flex flex-col gap-3">
            <section className="border border-white/5 rounded-2xl p-6 text-center bg-[#1f1f1f] flex flex-col items-center">
              <div className="w-[72px] h-[72px] rounded-full mx-auto mb-3 bg-[#7c5cfc] text-white text-[34px] font-extrabold flex items-center justify-center shadow-[0_0_15px_rgba(124,92,252,0.4)]">✓</div>
              <h4 className="m-0 text-white text-2xl font-bold">Sent!</h4>
              <p className="mt-2 mb-0 text-[#8b8b93] text-sm">
                ${amount} was sent to your wallet successfully.
              </p>
            </section>
            <button type="button" className="w-full h-[50px] border-none rounded-xl bg-[#7c5cfc] text-white text-base font-medium cursor-pointer mt-auto hover:bg-[#8b6dfc] transition-colors" onClick={onDone}>Done</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}