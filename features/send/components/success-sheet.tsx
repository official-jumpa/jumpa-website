import { Check } from "lucide-react";

const closeIcon = "/assets/icons/actions/close.svg";

type SuccessSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
  amount: string;
  tokenSymbol: string;
  hash: string;
};

export default function SuccessSheet({
  open,
  onOpenChange,
  onDone,
  amount,
  tokenSymbol,
  hash,
}: SuccessSheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-1000"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="absolute left-1/2 bottom-0 w-full max-w-100 -translate-x-1/2 bg-[#101010] rounded-t-4xl pb-8 z-1005 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] animate-[slideUp_0.35s_ease-out_forwards]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Confetti Background at the top */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-[url('/assets/images/illustrations/confetti.png')] bg-cover bg-center rounded-t-4xl opacity-80 pointer-events-none" />

        <button
          type="button"
          className="absolute top-3.5 right-5.25 w-8.75 h-8.75 p-2 border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer gap-2 z-10 transition-colors duration-150 ease-out hover:bg-[#3a3a3a]"
          onClick={() => onOpenChange(false)}
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

        <div className="flex flex-col items-center w-full pt-14 px-4 pb-5 box-border flex-1 min-h-0 overflow-y-auto z-10 relative">
          <div className="w-75 max-w-full mt-2.5 flex flex-col items-center text-center mb-6">
            <div className="w-16.5 h-16.5 rounded-full bg-[#4CD964] flex items-center justify-center mb-6 mt-4 shadow-[0_0_20px_rgba(76,217,100,0.3)]">
              <Check strokeWidth={3.5} className="w-8 h-8 text-white" />
            </div>

            <h2 className="m-0 font-sans font-semibold text-[17px] leading-[120%] tracking-[-0.02em] text-white">
              Transaction Successful
            </h2>
            <p className="m-0 mt-2 font-sans text-[13px] leading-[145%] tracking-[-0.02em] text-[#D5D5D5]">
              You've sent {amount} {tokenSymbol} to ...
            </p>
          </div>

          <div className="w-82.5 max-w-full flex flex-col gap-5 mt-4">
            <div className="w-full flex items-center justify-between border-b border-dashed border-[#3C3C3C] pb-4">
              <span className="font-sans text-[13px] font-medium text-zinc-300">
                Amount
              </span>
              <span className="font-sans text-[13px] font-semibold text-white">
                {amount} {tokenSymbol}
              </span>
            </div>
            <div className="w-full flex items-center justify-between border-b border-dashed border-[#3C3C3C] pb-4">
              <span className="font-sans text-[13px] font-medium text-zinc-300">
                Date
              </span>
              <span className="font-sans text-[13px] font-semibold text-white">
                {new Date()
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                  .replace(/\//g, "-")}
              </span>
            </div>
            <div className="w-full flex items-center justify-between border-b border-dashed border-[#3C3C3C] pb-4">
              <span className="font-sans text-[13px] font-medium text-zinc-300">
                Hash Trx
              </span>
              <span className="font-sans text-[13px] font-semibold text-[#6a59ce] underline cursor-pointer break-all text-right max-w-37.5">
                {hash}
              </span>
            </div>
          </div>

          <div className="w-82.5 max-w-full mt-8 pt-2 pb-4 px-1">
            <button
              type="button"
              className="w-full h-13 rounded-2xl bg-[#6B52D9] hover:bg-[#5a42c0] text-white font-medium flex items-center justify-center transition-all active:scale-95"
              onClick={onDone}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
