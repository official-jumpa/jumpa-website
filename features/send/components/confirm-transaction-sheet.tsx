import { RefreshCcw } from "lucide-react";
import type { Recipient } from "../types";

const closeIcon = "/assets/icons/actions/close.svg";

type ConfirmTransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: Recipient;
  amountDisplay: string;
  tokenSymbol: string;
  processing: boolean;
  onMakePayment: () => void;
};

export default function ConfirmTransactionSheet({
  open,
  onOpenChange,
  recipient,
  amountDisplay,
  tokenSymbol,
  processing,
  onMakePayment,
}: ConfirmTransactionSheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-55"
        onClick={() => {
          if (!processing) onOpenChange(false);
        }}
      />
      <div
        className="deposit-method-sheet deposit-method-sheet-confirm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="confirm-tx-sheet-title"
        aria-modal="true"
        style={{ zIndex: 60 }}
      >
        <button
          type="button"
          className="absolute top-3.5 right-5.25 w-8.75 h-8.75 p-2 border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer gap-2 z-10 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
          onClick={() => {
            if (!processing) onOpenChange(false);
          }}
          aria-label="Close"
        >
          <img
            src={closeIcon}
            alt=""
            width={12}
            height={12}
            className="w-[11.72px] h-[11.72px] block opacity-70"
          />
        </button>

        <div className="flex flex-col items-center w-full pt-14 px-4 pb-5 box-border flex-1 min-h-0 overflow-y-auto">
          <div className="w-75 max-w-full mt-2.5 flex flex-col items-center text-center mb-6">
            <h2
              id="confirm-tx-sheet-title"
              className="m-0 font-sans font-bold text-[18px] leading-[120%] tracking-[-0.02em] text-white"
            >
              Confirm transaction
            </h2>
          </div>

          <div className="w-82.5 max-w-full flex flex-col gap-0 pb-1">
            {/* Top Card */}
            <div className="relative rounded-t-[28px] rounded-b-[20px] bg-[#2D2D2D] p-5 pb-8">
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-[13px] text-zinc-300 mb-1">You Pay</p>
                  <p className="text-4xl font-bold text-white flex items-baseline">
                    {amountDisplay.split(".")[0]}
                    {amountDisplay.includes(".") && (
                      <span className="text-[#AAAAAA]">
                        .{amountDisplay.split(".")[1]}
                      </span>
                    )}
                    {!amountDisplay.includes(".") && (
                      <span className="text-[#AAAAAA]">.00</span>
                    )}
                  </p>
                </div>
                <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-zinc-300">
                  {tokenSymbol}
                </div>
              </div>

              <div className="absolute -bottom-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[#16171d]">
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#C3BDEB]">
                  <RefreshCcw className="h-3.5 w-3.5 text-[#5432d3]" />
                </div>
              </div>
            </div>

            {/* Bottom Card */}
            <div className="rounded-t-[20px] rounded-b-[28px] bg-[#2D2D2D] p-5 pt-8 mt-2">
              <p className="text-[13px] font-medium text-zinc-300 mb-4">To:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9.5 w-9.5 shrink-0 rounded-full bg-linear-to-tr from-cyan-200 via-pink-200 to-indigo-200" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-white">
                      {recipient.name}
                    </span>
                    <span className="text-[12px] text-[#AAAAAA] mt-0.5">
                      {recipient.address}
                    </span>
                  </div>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Details section */}
            <div className="mt-8 space-y-5 px-1">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-medium text-white">Network</span>
                <span className="text-[14px] font-medium text-white">
                  {tokenSymbol.includes("SOL")
                    ? "Solana"
                    : tokenSymbol.includes("XLM")
                      ? "Stellar"
                      : tokenSymbol.includes("BASE")
                        ? "Base Chain"
                        : "Ethereum"}
                </span>
              </div>
              <div className="border-b border-dashed border-[#555555]"></div>

              <div className="flex justify-between items-center">
                <span className="text-[14px] font-medium text-white">Network fee</span>
                <span className="text-[14px] font-medium text-white">$0.023</span>
              </div>
              <div className="border-b border-dashed border-[#555555]"></div>
            </div>
          </div>

          {/* Button pushed to bottom */}
          <div className="w-82.5 max-w-full mt-auto pt-8 pb-4 px-1">
            <button
              type="button"
              disabled={processing}
              onClick={onMakePayment}
              className="w-full h-13 rounded-2xl bg-[#6B52D9] hover:bg-[#5a42c0] text-white font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span className="text-[15px]">Make payment</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
