"use client"
import { useState } from 'react';
const clipboardIcon = '/assets/icons/actions/clipboard.svg';;
const closeIcon = '/assets/icons/actions/close.svg';;
const closeCircleDashIcon = '/assets/icons/actions/close_circle_dash_line.svg';;

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
    <div className="flex flex-col gap-2.5 w-full">
      {showBanner && (
        <div className="relative bg-[#c72ff8] border border-dashed border-[#d9cfcf] rounded-lg w-[342px] h-[82px] self-center p-[21px_25px] flex items-center justify-start">
          <button
            type="button"
            className="absolute top-2 right-2 w-[17px] h-[17px] border-none bg-transparent p-0 cursor-pointer flex items-start justify-start"
            onClick={() => setShowBanner(false)}
            aria-label="Close banner"
          >
            <img src={closeCircleDashIcon} alt="" className="w-[13.8px] h-[13.8px] block mt-[1.6px] ml-[1.6px]" />
          </button>
          <p className="m-0 font-sans text-sm font-normal text-white text-left tracking-[-2%] w-[292px] leading-[145%]">
            Low interest rate, no credit checks and instant approval using your crypto as collateral.
          </p>
        </div>
      )}

      <div className="flex flex-col w-[342px] min-h-[106px] self-center items-start justify-center p-[17px_23px] bg-[#2d2d2d] rounded-2xl gap-3">
        <div className="flex flex-col gap-0 w-full">
          <div className="flex justify-between items-center w-full">
            <p className="m-0 font-sans text-xs font-normal text-[#d5d5d5] tracking-[-0.24px] leading-[1.45]">Address or .Tag handle</p>
            {(validationStatus === 'invalid' || validationStatus === 'valid') && (
              <button type="button" className="bg-[#1f1f1f] border-none w-6 h-6 rounded-[34.91px] p-[5.45px] cursor-pointer inline-flex items-center justify-center gap-[5.45px] opacity-80 hover:opacity-100 transition-opacity duration-200" onClick={handleClear}>
                <img src={closeIcon} alt="Clear" className="w-[8.03px] h-[8.03px]" />
              </button>
            )}
          </div>
          
          <div className="flex items-start justify-between w-full relative">
            <input
              type="text"
              className="flex-1 border-none p-0 m-0 outline-none bg-transparent font-sans text-sm font-normal text-[#d5d5d5] tracking-[-0.2px] leading-[1.45] placeholder-[#5a5a5a]"
              value={walletAddress}
              placeholder="Enter wallet address or .tag handle"
              onChange={(e) => handleAddressChange(e.target.value)}
              aria-label="Wallet address"
            />
            {validationStatus === 'valid' && (
              <div className="flex flex-col items-end gap-1 absolute right-0 top-[-15px]">
                <span className="text-[11px] text-[#5a5a5a] whitespace-nowrap">New address</span>
              </div>
            )}
          </div>
          
          {validationStatus === 'invalid' && (
            <span className="text-[#ff3b30] text-[11px] mt-0.5">Invalid address</span>
          )}
        </div>

        <div className="flex gap-2 items-center w-full">
          <button
            type="button"
            className={`border-none rounded-[24px] p-[5px_10px] min-w-[71px] font-sans text-xs font-normal leading-[1.45] cursor-pointer transition-all duration-200 ease-out flex items-center justify-center gap-1 ${
              validationStatus !== 'valid'
                ? 'bg-[#3c3c3c] text-[#777] cursor-not-allowed opacity-100'
                : 'bg-[#f4f4f4] text-[#777] active:opacity-80'
            }`}
            onClick={handleContinueClick}
            disabled={validationStatus !== 'valid'}
          >
            Continue
          </button>
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              className="border-none rounded-[24px] p-[5px_10px] min-w-[71px] font-sans text-xs font-normal leading-[1.45] cursor-pointer transition-all duration-200 ease-out flex items-center justify-center gap-1 bg-[#3c3c3c] text-[#777] active:opacity-80"
              onClick={handlePaste}
            >
              <span>Paste</span>
              <img src={clipboardIcon} alt="" className="w-4 h-4 block" />
            </button>
            {validationStatus === 'valid' && (
              <span className="text-xs text-[#5a5a5a] whitespace-nowrap tracking-[-0.24px]">Available USDC : {usdcBalance}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative">
        {showNoBalanceHints && (
          <div className="flex justify-between w-[346px] self-center mb-3 px-1">
            <span className="font-sans text-xs font-normal text-[#6a59ce] tracking-[-2%] underline decoration-dotted leading-[145%]">Supply Collateral to Borrow</span>
            {showSecondHint && (
              <span className="font-sans text-xs font-normal text-[#6a59ce] tracking-[-2%] underline decoration-dotted leading-[145%]">Minimum 0.06 SOL Balance</span>
            )}
          </div>
        )}
        
        <div
          role="button"
          tabIndex={0}
          className="w-[346px] h-[69px] self-center border-none rounded-2xl bg-[#2d2d2d] p-[14.5px] flex items-center justify-between cursor-pointer transition-opacity duration-200 active:opacity-80"
          onClick={onChangeNetwork}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onChangeNetwork();
            }
          }}
        >
          <div className="flex items-center gap-[6px] min-w-0">
            <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center shrink-0">
              <img src="/coins/usdc.svg" alt="USDC" className="w-8 h-8 block object-contain" />
            </div>
            <div className="flex flex-col gap-0 min-w-0 items-start">
              <p className="m-0 font-sans text-sm font-normal text-white tracking-[-0.28px] whitespace-nowrap text-left leading-[145%]">{depositBalanceLabel}</p>
              <span className="m-0 font-sans text-xs font-normal text-[#5a5a5a] tracking-[-0.24px] whitespace-nowrap text-left leading-[1.45]">Available amount; {usdcBalance} USDC</span>
            </div>
          </div>
          <button
            type="button"
            className="border-none bg-[#1f1f1f] text-[#f4f4f4] rounded-xl p-[6px_12px] font-sans text-[10px] font-normal leading-[1.45] cursor-pointer whitespace-nowrap shrink-0 transition-colors duration-200 active:opacity-80 mr-[18px]"
            onClick={(event) => {
              event.stopPropagation();
              onChangeNetwork();
            }}
          >
            Change
          </button>
        </div>

        <div className="border border-dashed border-[#aaa] rounded-none bg-transparent w-[346px] h-[111px] self-center p-[18px_29px] flex flex-col gap-3 items-start justify-center">
          <p className="m-0 font-sans text-sm font-normal text-[#d5d5d5] tracking-[-0.28px] text-left max-w-[288px] leading-[1.45]">
            Interest accrues daily. We'll notify you if your collateral nears the liquidation threshold.
          </p>
          <div className="w-full flex items-center justify-between max-w-[288px]">
            <span className="font-sans text-sm font-normal text-[#777] tracking-[-0.28px] whitespace-nowrap leading-[1.45]">Borrow APY</span>
            <strong className="font-sans text-sm font-normal text-[#ee9c2e] tracking-[-0.28px] whitespace-nowrap leading-[1.45]">6.43%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
