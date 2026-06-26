import { ChevronRight } from "lucide-react";
import SheetShell from "@/features/send/components/sheet-shell";

type ConfirmFiatSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  recipientAccount: string;
  recipientName: string;
  bankName: string;
  fee: string;
  processing?: boolean;
  onMakePayment: () => void;
};

export default function ConfirmFiatSheet({
  open,
  onOpenChange,
  amount,
  recipientAccount,
  recipientName,
  bankName,
  fee,
  processing = false,
  onMakePayment,
}: ConfirmFiatSheetProps) {
  return (
    <SheetShell
      open={open}
      onOpenChange={(v) => {
        if (!processing) onOpenChange(v);
      }}
      title="Confirm transaction"
    >
      <div className="space-y-4 pt-4 pb-2">
        <div className="relative rounded-3xl bg-[#1c1d22] p-5 pb-8 border border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-zinc-400">You Pay</p>
              <p className="mt-1 text-4xl font-bold text-white">{amount}</p>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-zinc-300">
              Naira
            </div>
          </div>

          <div className="absolute -bottom-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[#16171d]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a78bfa]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-[#1c1d22] p-5 pt-8 border border-white/5">
          <p className="text-sm font-medium text-zinc-400 mb-3">To:</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400" />
              <div>
                <p className="font-medium text-white">{recipientName}</p>
                <p className="text-xs text-zinc-400">{recipientAccount}</p>
              </div>
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 px-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Amount</span>
            <span className="text-sm font-medium text-white">₦{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Bank</span>
            <span className="text-sm font-medium text-white">{bankName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Fee</span>
            <span className="text-sm font-medium text-white">{fee}</span>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="button"
            disabled={processing}
            onClick={onMakePayment}
            className="w-full h-14 rounded-xl bg-[#7c5cfc] hover:bg-[#6b4ce6] text-white font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {processing ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Make payment</span>
            )}
          </button>
        </div>
      </div>
    </SheetShell>
  );
}
