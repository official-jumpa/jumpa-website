import SheetShell from "@/features/send/components/sheet-shell";

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
  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title="">
      <div className="flex flex-col items-center pb-6">
        {/* Confetti background simulation */}
        <div className="relative mb-6 flex h-32 w-full items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/images/illustrations/confetti.svg')] bg-cover bg-center opacity-50 mix-blend-screen" />
          <div className="z-10 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Transaction Successful</h2>
        <p className="text-sm text-zinc-400 mb-8 text-center px-4">
          You've sent ₦{amount} to {recipientAccount}.
        </p>

        <div className="w-full space-y-4 px-2 mb-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-sm font-medium text-zinc-400">Amount</span>
            <span className="text-sm font-medium text-white">₦{amount}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-sm font-medium text-zinc-400">Account number</span>
            <span className="text-sm font-medium text-white">{recipientAccount}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-sm font-medium text-zinc-400">Bank</span>
            <span className="text-sm font-medium text-white">{bankName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-sm font-medium text-zinc-400">Fee</span>
            <span className="text-sm font-medium text-white">{fee}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="text-sm font-medium text-zinc-400">Date</span>
            <span className="text-sm font-medium text-white">{date}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="w-full h-14 rounded-xl bg-[#7c5cfc] hover:bg-[#6b4ce6] text-white font-medium flex items-center justify-center transition-all active:scale-95"
        >
          Done
        </button>
      </div>
    </SheetShell>
  );
}
