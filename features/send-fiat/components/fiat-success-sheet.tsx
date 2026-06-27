import { Check } from "lucide-react";
const closeIcon = "/assets/icons/actions/close.svg";

type FiatSuccessSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  recipientAccount: string;
  bankName: string;
  fee: string;
  date: string;
  onDone: () => void;
};

export default function FiatSuccessSheet({
  open,
  onOpenChange,
  amount,
  recipientAccount,
  bankName,
  fee,
  date,
  onDone,
}: FiatSuccessSheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-55"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="deposit-method-sheet"
        style={{ zIndex: 60, height: "auto", paddingBottom: "32px" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Confetti Background at the top */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-[url('/assets/images/illustrations/confetti.svg')] bg-cover bg-center rounded-t-4xl opacity-80 pointer-events-none" />

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

        <div className="flex flex-col items-center w-full pt-16 px-6 box-border relative z-10">
          <div className="flex h-15 w-15 items-center justify-center rounded-full bg-[#22C55E] mb-6">
            <Check className="h-8 w-8 text-white" strokeWidth={4} />
          </div>

          <h2 className="text-[17px] font-semibold text-white mb-1.5">
            Transaction Successful
          </h2>
          <p className="text-[13px] font-medium text-white mb-8">
            You've sent ₦{amount} to {recipientAccount}
          </p>

          <div className="w-full space-y-5 px-1 mb-10">
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-medium text-white">Amount</span>
              <span className="text-[14px] font-medium text-white">
                ₦{amount}
              </span>
            </div>
            <div className="border-b border-dashed border-[#555555]"></div>

            <div className="flex justify-between items-center">
              <span className="text-[14px] font-medium text-white">
                Account number
              </span>
              <span className="text-[14px] font-medium text-white">
                {recipientAccount}
              </span>
            </div>
            <div className="border-b border-dashed border-[#555555]"></div>

            <div className="flex justify-between items-center">
              <span className="text-[14px] font-medium text-white">Bank</span>
              <span className="text-[14px] font-medium text-white">
                {bankName}
              </span>
            </div>
            <div className="border-b border-dashed border-[#555555]"></div>

            <div className="flex justify-between items-center">
              <span className="text-[14px] font-medium text-white">Fee</span>
              <span className="text-[14px] font-medium text-white">{fee}</span>
            </div>
            <div className="border-b border-dashed border-[#555555]"></div>

            <div className="flex justify-between items-center">
              <span className="text-[14px] font-medium text-white">Date</span>
              <span className="text-[14px] font-medium text-white">{date}</span>
            </div>
            <div className="border-b border-dashed border-[#555555]"></div>
          </div>

          <button
            type="button"
            onClick={onDone}
            className="w-full h-13 rounded-2xl bg-[#6B52D9] hover:bg-[#5a42c0] text-white font-medium flex items-center justify-center transition-all active:scale-95"
          >
            <span className="text-[15px]">Done</span>
          </button>
        </div>
      </div>
    </>
  );
}
